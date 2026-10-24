from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    rosters = relationship("Roster", back_populates="organization", cascade="all, delete-orphan")
    briefs = relationship("Brief", back_populates="organization", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="organization", cascade="all, delete-orphan")
    audio_jobs = relationship("AudioJob", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")
