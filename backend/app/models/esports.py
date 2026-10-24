from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Title(Base):
    __tablename__ = "titles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)

    roles = relationship("Role", back_populates="title", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="title", cascade="all, delete-orphan")
    formula_versions = relationship("FormulaVersion", back_populates="title")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), nullable=False)

    title = relationship("Title", back_populates="roles")
    players = relationship("Player", back_populates="role")


class FormulaVersion(Base):
    __tablename__ = "formula_versions"

    id = Column(Integer, primary_key=True, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="SET NULL"), nullable=True)
    version_tag = Column(String(50), unique=True, index=True, nullable=False)
    weights_json = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    title = relationship("Title", back_populates="formula_versions")
    recommendations = relationship("Recommendation", back_populates="formula_version")
    decisions = relationship("Decision", back_populates="formula_version")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    region = Column(String(20), default="NA", nullable=False)  # NA, EU, APAC, SA, BR
    tier = Column(String(20), default="Tier 1", nullable=False)  # Tier 1, Tier 2, Tier 3
    strength_rating = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    players = relationship("Player", back_populates="team")


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=False)
    handle = Column(String(50), index=True, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    region = Column(String(20), default="NA", nullable=False)
    tier = Column(String(20), default="Tier 1", nullable=False)
    source = Column(String(30), default="simulated", nullable=False)  # 'simulated' or 'pandascore'
    is_available = Column(Boolean, default=True, nullable=False)
    avatar_url = Column(String(255), nullable=True)
    playstyle = Column(String(50), default="Balanced", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    role = relationship("Role", back_populates="players")
    team = relationship("Team", back_populates="players")
    match_stats = relationship("PlayerMatchStat", back_populates="player", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="player")
    audio_jobs = relationship("AudioJob", back_populates="player")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    title_id = Column(Integer, ForeignKey("titles.id", ondelete="CASCADE"), nullable=False)
    team_a_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team_b_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    winner_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    match_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    source = Column(String(30), default="simulated", nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    title = relationship("Title", back_populates="matches")
    team_a = relationship("Team", foreign_keys=[team_a_id])
    team_b = relationship("Team", foreign_keys=[team_b_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    player_stats = relationship("PlayerMatchStat", back_populates="match", cascade="all, delete-orphan")


class PlayerMatchStat(Base):
    __tablename__ = "player_match_stats"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True)
    kills = Column(Integer, default=0, nullable=False)
    deaths = Column(Integer, default=0, nullable=False)
    adr = Column(Float, default=0.0, nullable=False)  # Average damage per round
    kpr = Column(Float, default=0.0, nullable=False)  # Kills per round
    opening_kills = Column(Integer, default=0, nullable=False)
    opening_deaths = Column(Integer, default=0, nullable=False)
    trades = Column(Integer, default=0, nullable=False)
    utility_damage = Column(Float, default=0.0, nullable=False)
    clutches_won = Column(Integer, default=0, nullable=False)
    rounds = Column(Integer, default=24, nullable=False)
    calls_count = Column(Integer, default=0, nullable=False)  # For IGL tactical metrics
    calls_converted = Column(Integer, default=0, nullable=False)
    halftime_rating_diff = Column(Float, default=0.0, nullable=False)  # For adaptation
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    match = relationship("Match", back_populates="player_stats")
    player = relationship("Player", back_populates="match_stats")
