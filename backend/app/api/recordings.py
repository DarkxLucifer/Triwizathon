import os
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    Header,
    status,
    BackgroundTasks,
)
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.models.organization import Organization
from app.models.recording import RecordingSession, RecordingShare
from app.schemas.recording import (
    RecordingSessionCreate,
    RecordingSessionOut,
    ChunkUploadResponse,
    RecordingFinalizeRequest,
    RecordingShareRequest,
    RecordingShareResponse,
)
from app.services.recording_service import (
    create_recording_session,
    save_chunk,
    finalize_session,
    abort_session,
    delete_session,
    share_session_with_org,
    revoke_session_share,
)

router = APIRouter(prefix="/recordings", tags=["Anti-Cheat Recording"])


def verify_session_access(session: RecordingSession, current_user: User, db: Session) -> bool:
    """Authorize access: Owner player has full access; Organizers only have access if actively shared."""
    if session.user_id == current_user.id or current_user.role == "admin":
        return True

    if current_user.org_id:
        share = db.query(RecordingShare).filter(
            RecordingShare.session_id == session.id,
            RecordingShare.org_id == current_user.org_id,
            RecordingShare.is_active == True,
        ).first()
        if share:
            return True

    return False


@router.post("/sessions", response_model=RecordingSessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: RecordingSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new recording session and generate a cryptographic one-time challenge code."""
    session = create_recording_session(
        db=db,
        user_id=current_user.id,
        player_id=current_user.player_id,
        mode=payload.mode,
        consent_given=payload.consent_given,
    )
    return session


@router.get("/sessions", response_model=List[RecordingSessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recordings: players see their own; organizations see recordings shared with them."""
    if current_user.role == "player" or not current_user.org_id:
        sessions = db.query(RecordingSession).filter(
            RecordingSession.user_id == current_user.id
        ).order_by(RecordingSession.created_at.desc()).all()
    else:
        # Organization view: find sessions actively shared with user's org
        sessions = db.query(RecordingSession).join(
            RecordingShare, RecordingShare.session_id == RecordingSession.id
        ).filter(
            RecordingShare.org_id == current_user.org_id,
            RecordingShare.is_active == True,
        ).order_by(RecordingSession.created_at.desc()).all()

    return sessions


@router.get("/sessions/{session_id}", response_model=RecordingSessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if not verify_session_access(session, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this recording."
        )

    return session


@router.post("/sessions/{session_id}/chunks", response_model=ChunkUploadResponse)
async def upload_chunk(
    session_id: int,
    track_kind: str = Form(...),
    chunk_index: int = Form(...),
    sha256: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a stream chunk with SHA-256 verification and idempotent deduplication."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can upload stream chunks."
        )

    content = await file.read()
    chunk, is_duplicate = save_chunk(
        db=db,
        session=session,
        track_kind=track_kind,
        chunk_index=chunk_index,
        chunk_bytes=content,
        client_sha256=sha256,
    )

    return ChunkUploadResponse(
        status="duplicate" if is_duplicate else "stored",
        session_id=session.id,
        track_kind=track_kind,
        chunk_index=chunk_index,
        byte_size=chunk.byte_size,
        sha256=chunk.sha256_hash,
        is_duplicate=is_duplicate,
    )


@router.post("/sessions/{session_id}/finalize", response_model=RecordingSessionOut)
def finalize(
    session_id: int,
    payload: RecordingFinalizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stop recording, assemble chunks, execute integrity checks, and finalize."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can finalize the session."
        )

    finalized = finalize_session(db=db, session=session, req=payload)
    return finalized


@router.post("/sessions/{session_id}/abort", response_model=RecordingSessionOut)
def abort(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Abort an active session and purge temporary chunks."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can abort the session."
        )

    aborted = abort_session(db=db, session=session)
    return aborted


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete a recording session, assembled video files, chunks, and derived data."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can delete this recording."
        )

    delete_session(db=db, session=session)
    return None


@router.post("/sessions/{session_id}/share", response_model=RecordingShareResponse)
def share(
    session_id: int,
    payload: RecordingShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Share recording with a specified organization."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can share this session."
        )

    org = db.query(Organization).filter(Organization.id == payload.org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target organization not found.")

    share_record = share_session_with_org(
        db=db,
        session=session,
        org_id=payload.org_id,
        user_id=current_user.id,
    )

    return RecordingShareResponse(
        status="shared",
        session_id=session.id,
        org_id=payload.org_id,
        is_active=share_record.is_active,
        message=f"Session successfully shared with {org.name}."
    )


@router.post("/sessions/{session_id}/revoke", response_model=RecordingShareResponse)
def revoke(
    session_id: int,
    payload: RecordingShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke organization access to recording."""
    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recording owner can revoke access."
        )

    revoke_session_share(db=db, session=session, org_id=payload.org_id)

    return RecordingShareResponse(
        status="revoked",
        session_id=session.id,
        org_id=payload.org_id,
        is_active=False,
        message="Organization access revoked."
    )


def resolve_media_user(
    db: Session,
    token: Optional[str] = None,
    authorization: Optional[str] = None,
) -> User:
    """Helper to authenticate user from either Bearer header or ?token= query parameter."""
    auth_token = None
    if authorization and authorization.lower().startswith("bearer "):
        auth_token = authorization[7:].strip()
    elif token:
        auth_token = token.strip()

    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required via Bearer header or 'token' query parameter.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/sessions/{session_id}/stream/{track_kind}")
def stream_media(
    session_id: int,
    track_kind: str,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Authenticated streaming endpoint for playback of assembled video supporting token in query or header."""
    current_user = resolve_media_user(db=db, token=token, authorization=authorization)

    session = db.query(RecordingSession).filter(RecordingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording session not found.")

    if not verify_session_access(session, current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this media stream."
        )

    file_path = session.final_screen_path if track_kind == "screen" else session.final_camera_path
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media file for {track_kind} track does not exist."
        )

    return FileResponse(
        path=file_path,
        media_type="video/webm",
        filename=f"session_{session.id}_{track_kind}.webm",
    )
