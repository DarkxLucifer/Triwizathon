from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="analyst", nullable=False)  # analyst | coach | gm | player | admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="users")
    decisions = relationship("Decision", back_populates="user")
