from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class PlayerTitle(Base):
    """Player-registered game titles (CS2, BGMI, Valorant, Free Fire, MLBB)."""
    __tablename__ = "player_titles"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    title_slug = Column(String(50), nullable=False)  # cs2, bgmi, valorant, free-fire, mlbb
    title_name = Column(String(100), nullable=False) # Full display name e.g. Battlegrounds Mobile India
    in_game_name = Column(String(100), nullable=False)
    in_game_id = Column(String(100), nullable=True)  # Steam64, BGMI UID, Riot ID
    self_reported_rank = Column(String(50), nullable=True)  # Faceit 10, Conqueror, Radiant
    verification_status = Column(String(30), default="self_reported", nullable=False)  # none, self_reported, linked
    stats_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    player = relationship("Player", back_populates="titles")


class PlayerScoreHistory(Base):
    """Historical score snapshots feeding the 6-week trajectory chart and formula audit."""
    __tablename__ = "player_score_history"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    formula_version = Column(String(50), default="Formula v2.4", nullable=False)
    combat_score = Column(Float, nullable=False)      # Out of 70 (Leetify / stats)
    tactical_score = Column(Float, nullable=False)    # Out of 30 (Whisper + LLM judge)
    overall_score = Column(Float, nullable=False)     # Out of 100
    breakdown_json = Column(JSON, nullable=True)
    week_label = Column(String(20), nullable=False)   # "Week 1", "Week 2", ... "Week 6"
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    player = relationship("Player", back_populates="score_history")


class PlayerClip(Base):
    """Gameplay clips uploaded by players with tactical audio evaluation."""
    __tablename__ = "player_clips"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    map_name = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    audio_job_id = Column(Integer, ForeignKey("audio_jobs.id", ondelete="SET NULL"), nullable=True)
    tactical_score = Column(Float, nullable=True)     # Real LLM judge score (out of 30)
    verdict = Column(String(50), nullable=True)       # Optimal, Suboptimal, Blunder
    soundness_reasoning = Column(Text, nullable=True)
    transcription = Column(Text, nullable=True)
    transcript_segments_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    player = relationship("Player", back_populates="clips")
    audio_job = relationship("AudioJob")


class ContactAccessGrant(Base):
    """Privacy control: determines which orgs can see a player's contact info."""
    __tablename__ = "contact_access_grants"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="pending", nullable=False)  # pending, approved, rejected
    granted_via = Column(String(30), default="request", nullable=False)  # request, application
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    player = relationship("Player", back_populates="contact_grants")
    organization = relationship("Organization")


class RosterOpening(Base):
    """Recruitment role postings by organisations."""
    __tablename__ = "roster_openings"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    roster_id = Column(Integer, ForeignKey("rosters.id", ondelete="CASCADE"), nullable=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), nullable=False)
    role_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    min_rank_text = Column(String(100), nullable=False)
    scrim_window = Column(String(100), nullable=False)
    package_text = Column(String(100), nullable=False)
    urgency = Column(String(20), default="Medium", nullable=False)  # High, Medium, Low
    status = Column(String(20), default="open", nullable=False)     # open, paused, closed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization")
    roster = relationship("Roster")
    title_rel = relationship("Title")
    applications = relationship("Application", back_populates="opening", cascade="all, delete-orphan")


class Application(Base):
    """Player applications to roster openings."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    opening_id = Column(Integer, ForeignKey("roster_openings.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="applied", nullable=False)  # applied, viewed, shortlisted, trial, rejected, withdrawn
    source = Column(String(30), default="player_applied", nullable=False)  # player_applied, org_invited
    cover_note = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    opening = relationship("RosterOpening", back_populates="applications")
    player = relationship("Player", back_populates="applications")


class PlayerWatchlist(Base):
    """Organiser player watchlists / bookmarks."""
    __tablename__ = "player_watchlists"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    organization = relationship("Organization")
    player = relationship("Player", back_populates="watchlists")


class ActivityEvent(Base):
    """Audit and timeline event log. Visible events feed the Player Scouting Timeline."""
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    org_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    subject_player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # profile_viewed, shortlisted, trial_offered, rejected, application_status_changed, formula_audit
    entity_type = Column(String(50), nullable=True)  # opening, application, brief, dossier
    entity_id = Column(String(50), nullable=True)
    payload_json = Column(JSON, nullable=True)
    visible_to_player = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    player = relationship("Player", back_populates="activity_events")
    organization = relationship("Organization")


class Notification(Base):
    """In-app notifications for users."""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    payload_json = Column(JSON, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")
