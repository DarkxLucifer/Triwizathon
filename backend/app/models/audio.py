from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class AudioJob(Base):
    __tablename__ = "audio_jobs"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    consent_given = Column(Boolean, default=False, nullable=False)
    file_path = Column(String(255), nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, processing, completed, failed
    model_version = Column(String(100), default="whisper-small-stock", nullable=False)
    decision_score = Column(Float, nullable=True)  # AI Tactical Decision Score (0-100)
    decision_data_json = Column(JSON, nullable=True)  # Detailed LLM breakdown & decision log
    llm_provider = Column(String(100), nullable=True)  # groq or gemini
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="audio_jobs")
    player = relationship("Player", back_populates="audio_jobs")
    segments = relationship("AudioEvidence", back_populates="job", cascade="all, delete-orphan")


class AudioEvidence(Base):
    __tablename__ = "audio_evidence"

    id = Column(Integer, primary_key=True, index=True)
    audio_job_id = Column(Integer, ForeignKey("audio_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    start_sec = Column(Float, nullable=False)
    end_sec = Column(Float, nullable=False)
    transcript = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    is_command = Column(Boolean, default=False, nullable=False)
    needs_review = Column(Boolean, default=False, nullable=False)

    job = relationship("AudioJob", back_populates="segments")
