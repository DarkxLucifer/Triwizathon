import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.api.deps import get_current_user, enforce_org_isolation
from app.models.user import User
from app.models.esports import Player
from app.models.audio import AudioJob, AudioEvidence
from app.schemas.audio import AudioUploadResponse, AudioJobOut, AudioEvidenceOut
from app.services.audio_transcription import run_transcription_job
from app.core.config import settings

router = APIRouter(prefix="/audio", tags=["Audio Intelligence"])

ALLOWED_AUDIO_EXTENSIONS = [".wav", ".mp3", ".ogg", ".m4a", ".flac"]
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


@router.post("", response_model=AudioUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_consented_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    player_id: int = Form(...),
    consent_given: bool = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Rule: Consent is strictly mandatory
    if not consent_given:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory consent verification failed: audio cannot be ingested without explicit player/team consent."
        )

    # Validate file format
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed extensions: {', '.join(ALLOWED_AUDIO_EXTENSIONS)}."
        )

    # Verify player exists
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified player does not exist.")

    # Save audio file locally
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"audio_org{current_user.org_id}_p{player_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum allowed limit of 50MB."
            )
        buffer.write(content)

    # Create AudioJob record
    job = AudioJob(
        org_id=current_user.org_id,
        player_id=player_id,
        consent_given=True,
        file_path=file_path,
        status="pending",
        model_version=f"whisper-{settings.WHISPER_MODEL_SIZE}-stock",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Dispatch non-blocking background task
    background_tasks.add_task(run_transcription_job, job.id, file_path, SessionLocal)

    return AudioUploadResponse(
        job_id=job.id,
        player_id=player_id,
        status="pending",
        model_version=job.model_version,
        message="Consented tactical audio uploaded successfully; background processing initiated."
    )


@router.get("/{job_id}", response_model=AudioJobOut)
def get_audio_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(AudioJob).filter(AudioJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio job not found.")

    # Strict multi-tenancy check
    enforce_org_isolation(job.org_id, current_user)

    segments_out = [
        AudioEvidenceOut(
            id=s.id,
            start_sec=s.start_sec,
            end_sec=s.end_sec,
            transcript=s.transcript,
            confidence=s.confidence,
            is_command=s.is_command,
            needs_review=s.needs_review,
        )
        for s in job.segments
    ]

    return AudioJobOut(
        id=job.id,
        player_id=job.player_id,
        player_handle=job.player.handle if job.player else None,
        player_name=job.player.name if job.player else None,
        status=job.status,
        model_version=job.model_version,
        consent_given=job.consent_given,
        decision_score=job.decision_score,
        decision_data_json=job.decision_data_json,
        llm_provider=job.llm_provider,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
        segments=segments_out,
    )
