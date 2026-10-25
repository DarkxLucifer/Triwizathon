import os
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    BigInteger,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class RecordingSession(Base):
    __tablename__ = "recording_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="SET NULL"), nullable=True, index=True)
    session_token = Column(String(64), unique=True, index=True, nullable=False)
    
    # Mode: "dual" (screen + camera) or "screen_only"
    mode = Column(String(32), default="dual", nullable=False)
    
    # Status: "recording", "processing", "completed", "failed", "incomplete"
    status = Column(String(32), default="recording", nullable=False, index=True)
    
    # Label: "live_recorded" or "uploaded_unverified" (never "verified authentic")
    label = Column(String(64), default="live_recorded", nullable=False)
    
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    stopped_at = Column(DateTime(timezone=True), nullable=True)
    duration_sec = Column(Float, default=0.0)
    total_bytes = Column(BigInteger, default=0)
    
    final_screen_path = Column(String(512), nullable=True)
    final_camera_path = Column(String(512), nullable=True)
    audio_path = Column(String(512), nullable=True)
    
    consent_recorded = Column(Boolean, default=True, nullable=False)
    retention_until = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", backref="recording_sessions")
    player = relationship("Player", backref="recording_sessions")
    challenge = relationship("RecordingChallenge", back_populates="session", uselist=False, cascade="all, delete-orphan")
    tracks = relationship("RecordingTrack", back_populates="session", cascade="all, delete-orphan")
    chunks = relationship("RecordingChunk", back_populates="session", cascade="all, delete-orphan")
    checks = relationship("RecordingCheck", back_populates="session", cascade="all, delete-orphan")
    shares = relationship("RecordingShare", back_populates="session", cascade="all, delete-orphan")


class RecordingChallenge(Base):
    __tablename__ = "recording_challenges"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recording_sessions.id", ondelete="CASCADE"), unique=True, nullable=False)
    code = Column(String(32), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    verified = Column(Boolean, default=False, nullable=False)
    spoken_at_sec = Column(Float, nullable=True)
    match_confidence = Column(Float, nullable=True)
    used_at = Column(DateTime(timezone=True), nullable=True)

    session = relationship("RecordingSession", back_populates="challenge")


class RecordingTrack(Base):
    __tablename__ = "recording_tracks"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recording_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # "screen" or "camera"
    track_kind = Column(String(32), nullable=False)
    mime_type = Column(String(128), default="video/webm;codecs=vp9,opus")
    
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    fps = Column(Float, nullable=True)
    
    # "monitor", "window", "browser", or None
    display_surface = Column(String(64), nullable=True)
    ended_early = Column(Boolean, default=False, nullable=False)

    session = relationship("RecordingSession", back_populates="tracks")


class RecordingChunk(Base):
    __tablename__ = "recording_chunks"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recording_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    track_kind = Column(String(32), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    byte_size = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    file_path = Column(String(512), nullable=False)
    server_received_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("session_id", "track_kind", "chunk_index", name="uq_session_track_chunk"),
    )

    session = relationship("RecordingSession", back_populates="chunks")


class RecordingCheck(Base):
    __tablename__ = "recording_checks"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recording_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Check types: spoken_challenge, challenge_window, ffprobe_metadata, duplicate_detection, surface_and_camera
    check_type = Column(String(64), nullable=False)
    # Status: "passed", "warning", "failed"
    status = Column(String(32), nullable=False)
    summary = Column(String(256), nullable=False)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    session = relationship("RecordingSession", back_populates="checks")


class RecordingShare(Base):
    __tablename__ = "recording_shares"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recording_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    shared_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    shared_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    session = relationship("RecordingSession", back_populates="shares")
    organization = relationship("Organization")
    shared_by = relationship("User")
