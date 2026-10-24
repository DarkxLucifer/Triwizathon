from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Brief(Base):
    __tablename__ = "briefs"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=False)
    roster_id = Column(Integer, ForeignKey("rosters.id", ondelete="SET NULL"), nullable=True)
    target_role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    constraints_json = Column(JSON, nullable=True)
    status = Column(String(50), default="active", nullable=False)  # active, closed, archived
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="briefs")
    roster = relationship("Roster", back_populates="briefs")
    target_role = relationship("Role")
    title = relationship("Title")
    recommendations = relationship("Recommendation", back_populates="brief", cascade="all, delete-orphan", order_by="Recommendation.rank")
    decisions = relationship("Decision", back_populates="brief")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    brief_id = Column(Integer, ForeignKey("briefs.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    formula_version_id = Column(Integer, ForeignKey("formula_versions.id", ondelete="SET NULL"), nullable=True)
    rank = Column(Integer, nullable=False)
    fit_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    breakdown_json = Column(JSON, nullable=False)
    drivers_json = Column(JSON, nullable=False)
    risks_json = Column(JSON, nullable=False)
    audio_status = Column(String(50), default="unavailable", nullable=False)  # pending, completed, unavailable
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    brief = relationship("Brief", back_populates="recommendations")
    player = relationship("Player", back_populates="recommendations")
    formula_version = relationship("FormulaVersion", back_populates="recommendations")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    brief_id = Column(Integer, ForeignKey("briefs.id", ondelete="SET NULL"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    roster_id = Column(Integer, ForeignKey("rosters.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    formula_version_id = Column(Integer, ForeignKey("formula_versions.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)  # advance | trial | watch | reject
    rationale = Column(Text, nullable=False)
    outcome_label = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="decisions")
    brief = relationship("Brief", back_populates="decisions")
    player = relationship("Player")
    roster = relationship("Roster", back_populates="decisions")
    user = relationship("User", back_populates="decisions")
    formula_version = relationship("FormulaVersion", back_populates="decisions")
