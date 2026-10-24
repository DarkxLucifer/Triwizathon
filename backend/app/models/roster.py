from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Roster(Base):
    __tablename__ = "rosters"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization", back_populates="rosters")
    title = relationship("Title")
    team = relationship("Team")
    slots = relationship("RosterSlot", back_populates="roster", cascade="all, delete-orphan", order_by="RosterSlot.slot_number")
    briefs = relationship("Brief", back_populates="roster")
    decisions = relationship("Decision", back_populates="roster")


class RosterSlot(Base):
    __tablename__ = "roster_slots"

    id = Column(Integer, primary_key=True, index=True)
    roster_id = Column(Integer, ForeignKey("rosters.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="SET NULL"), nullable=True)
    slot_number = Column(Integer, nullable=False)  # 1 to 5

    roster = relationship("Roster", back_populates="slots")
    role = relationship("Role")
    player = relationship("Player")
