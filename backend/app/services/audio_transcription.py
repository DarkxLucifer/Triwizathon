"""ScoutForge Audio Intelligence & Transcription Service.

Uses faster-whisper with Whisper-small model.
Resilient design: audio processing runs in the background and NEVER blocks ranking.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.audio import AudioJob, AudioEvidence
from app.core.config import settings

logger = logging.getLogger(__name__)

COMMAND_KEYWORDS = [
    "smoke", "flash", "go", "rush", "rotate", "push", "fall back", "save",
    "execute", "hold", "plant", "defuse", "cat", "window", "mid", "long",
    "short", "site", "drop", "cross", "boost", "clear", "molly"
]

# Hook for future fine-tuned acoustic or esports-domain weights
CUSTOM_WHISPER_WEIGHTS_HOOK: Optional[str] = None


def is_tactical_command(transcript_text: str) -> bool:
    """Detects tactical commands from transcript keywords."""
    lower = transcript_text.lower()
    return any(kw in lower for kw in COMMAND_KEYWORDS)


def run_transcription_job(job_id: int, file_path: str, db_session_factory):
    """Background task to run Whisper-small transcription safely."""
    db: Session = db_session_factory()
    job = db.query(AudioJob).filter(AudioJob.id == job_id).first()
    if not job:
        db.close()
        return

    try:
        job.status = "processing"
        db.commit()

        # Check if faster_whisper is available and file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        # Configure DLL directory for CUDA/cuDNN on Windows
        try:
            import torch
            torch_lib = os.path.join(os.path.dirname(torch.__file__), "lib")
            if os.path.exists(torch_lib) and hasattr(os, "add_dll_directory"):
                os.add_dll_directory(torch_lib)
                os.environ["PATH"] = torch_lib + os.pathsep + os.environ.get("PATH", "")
        except Exception:
            pass

        from faster_whisper import WhisperModel
        import ctranslate2

        model_name_or_path = CUSTOM_WHISPER_WEIGHTS_HOOK or settings.WHISPER_MODEL_SIZE
        use_cuda = (
            getattr(settings, "WHISPER_DEVICE", "cuda") == "cuda"
            and ctranslate2.get_cuda_device_count() > 0
        )
        device = "cuda" if use_cuda else "cpu"
        compute_type = "float16" if use_cuda else "int8"

        try:
            model = WhisperModel(model_name_or_path, device=device, compute_type=compute_type)
        except Exception as load_err:
            logger.warning(f"Failed to load Whisper on {device}/{compute_type}: {load_err}. Falling back to cpu/int8.")
            model = WhisperModel(model_name_or_path, device="cpu", compute_type="int8")

        segments, info = model.transcribe(file_path, beam_size=5, language="en")

        evidence_count = 0
        for seg in segments:
            # seg.avg_logprob can be mapped to approximate confidence: exp(avg_logprob)
            import math
            conf = min(1.0, max(0.0, math.exp(seg.avg_logprob))) if seg.avg_logprob is not None else 0.85
            conf = round(conf, 3)
            needs_review = conf < 0.70
            is_cmd = is_tactical_command(seg.text)

            evidence = AudioEvidence(
                audio_job_id=job.id,
                start_sec=round(seg.start, 2),
                end_sec=round(seg.end, 2),
                transcript=seg.text.strip(),
                confidence=conf,
                is_command=is_cmd,
                needs_review=needs_review,
            )
            db.add(evidence)
            evidence_count += 1

        db.commit()

        # Run AI Tactical Decision Evaluation (Groq / Gemini)
        try:
            from app.services.llm_decision_evaluator import evaluate_tactical_decisions
            import asyncio

            segment_dicts = [
                {
                    "start_sec": s.start_sec,
                    "end_sec": s.end_sec,
                    "transcript": s.transcript,
                    "confidence": s.confidence,
                    "is_command": s.is_command,
                }
                for s in job.segments
            ]

            player_handle = job.player.handle if job.player else "Player"
            player_role = job.player.role.name if job.player and job.player.role else "IGL"

            eval_res = asyncio.run(evaluate_tactical_decisions(
                transcript_segments=segment_dicts,
                player_handle=player_handle,
                player_role=player_role,
            ))

            job.decision_score = float(eval_res.get("audio_score") or eval_res.get("tactical_decision_score") or 25.0)
            job.decision_data_json = eval_res
            job.llm_provider = f"{eval_res.get('provider', 'groq')}/{eval_res.get('model_used', 'default')}"
            db.commit()
        except Exception as eval_err:
            logger.warning(f"Non-blocking tactical decision evaluation warning for job {job.id}: {eval_err}")

        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        logger.error(f"Error processing audio job {job_id}: {e}", exc_info=True)
        job.status = "failed"
        job.error_message = str(e)
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()
