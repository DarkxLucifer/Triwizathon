from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class PlayerTitleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title_slug: str
    title_name: str
    in_game_name: str
    in_game_id: Optional[str] = None
    self_reported_rank: Optional[str] = None
    verification_status: str
    stats_json: Optional[Dict[str, Any]] = None
    created_at: datetime


class PlayerTitleIn(BaseModel):
    title_slug: str
    title_name: str
    in_game_name: str
    in_game_id: Optional[str] = None
    self_reported_rank: Optional[str] = None
    verification_status: Optional[str] = "self_reported"
    stats_json: Optional[Dict[str, Any]] = None


class TrajectoryPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    week_label: str
    combat_score: float
    tactical_score: float
    overall_score: float
    recorded_at: datetime


class PlayerClipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    player_id: int
    title: str
    map_name: str
    file_path: str
    duration_seconds: float
    audio_job_id: Optional[int] = None
    tactical_score: Optional[float] = None
    verdict: Optional[str] = None
    soundness_reasoning: Optional[str] = None
    transcription: Optional[str] = None
    transcript_segments: Optional[List[Dict[str, Any]]] = None
    created_at: datetime


class ContactAccessGrantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    player_id: int
    org_id: int
    org_name: Optional[str] = None
    status: str
    granted_via: str
    created_at: datetime
    updated_at: datetime


class ContactAccessResponse(BaseModel):
    action: str = Field(pattern="^(approve|reject)$")


class RosterOpeningOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_id: int
    org_name: Optional[str] = None
    roster_id: Optional[int] = None
    roster_name: Optional[str] = None
    title_id: Optional[int] = None
    title_name: Optional[str] = None
    role_id: Optional[int] = None
    role_name: str
    title: str
    description: str
    min_rank_text: str
    scrim_window: str
    package_text: str
    urgency: str
    status: str
    applicants_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime


class RosterOpeningCreate(BaseModel):
    roster_id: Optional[int] = None
    title_id: Optional[int] = None
    role_id: Optional[int] = None
    role_name: str
    title: str
    description: str
    min_rank_text: str
    scrim_window: str
    package_text: str
    urgency: Optional[str] = "Medium"
    status: Optional[str] = "open"


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    opening_id: int
    opening_title: Optional[str] = None
    org_id: Optional[int] = None
    org_name: Optional[str] = None
    player_id: int
    player_handle: Optional[str] = None
    player_name: Optional[str] = None
    role_name: Optional[str] = None
    status: str
    source: str
    cover_note: Optional[str] = None
    reviewer_notes: Optional[str] = None
    combat_score: Optional[float] = None
    tactical_score: Optional[float] = None
    overall_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class ApplicationCreate(BaseModel):
    cover_note: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern="^(applied|viewed|shortlisted|trial|rejected|withdrawn)$")
    reviewer_notes: Optional[str] = None


class ActivityEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    payload_json: Optional[Dict[str, Any]] = None
    visible_to_player: bool
    created_at: datetime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    message: str
    payload_json: Optional[Dict[str, Any]] = None
    read_at: Optional[datetime] = None
    created_at: datetime


class PlayerDossierOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    name: str
    handle: str
    role: str
    team_name: Optional[str] = None
    region: str
    tier: str
    source: str
    is_available: bool
    avatar_url: Optional[str] = None
    playstyle: str
    
    # Dossier & Privacy
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_unlocked: bool = False
    hours_per_week: int
    scrim_window_start: str
    scrim_window_end: str
    scrim_timezone: str
    playstyle_description: Optional[str] = None
    primary_game: str
    availability_status: str
    hardware_specs_json: Optional[Dict[str, Any]] = None
    map_pool_json: Optional[List[str]] = None
    past_experience_json: Optional[List[Dict[str, Any]]] = None
    expected_compensation: Optional[str] = None
    visibility_settings_json: Optional[Dict[str, Any]] = None
    
    # Linked telemetry & scores
    titles: List[PlayerTitleOut] = []
    trajectory: List[TrajectoryPoint] = []
    clips: List[PlayerClipOut] = []
    latest_combat_score: float = 0.0
    latest_tactical_score: float = 0.0
    latest_overall_score: float = 0.0
    inquiries_count: int = 0
    active_applications_count: int = 0


class PlayerDossierUpdate(BaseModel):
    name: Optional[str] = None
    handle: Optional[str] = None
    region: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    hours_per_week: Optional[int] = None
    scrim_window_start: Optional[str] = None
    scrim_window_end: Optional[str] = None
    scrim_timezone: Optional[str] = None
    playstyle_description: Optional[str] = None
    primary_game: Optional[str] = None
    availability_status: Optional[str] = None
    hardware_specs_json: Optional[Dict[str, Any]] = None
    map_pool_json: Optional[List[str]] = None
    past_experience_json: Optional[List[Dict[str, Any]]] = None
    expected_compensation: Optional[str] = None
    visibility_settings_json: Optional[Dict[str, Any]] = None


class OrgKpiOut(BaseModel):
    active_candidates: int
    scouting_briefs: int
    active_rosters: int
    evaluations_logged: int


class ReviewChartPoint(BaseModel):
    date: str
    profiles: int


class LeaderboardItem(BaseModel):
    rank: int
    player_id: int
    handle: str
    name: str
    role: str
    region: str
    team_name: Optional[str] = None
    combat_score: float
    tactical_score: float
    overall_score: float
    source: str
    verification_status: str
    matches_count: int


class LeaderboardResponse(BaseModel):
    title_slug: str
    role: Optional[str] = None
    total: int
    items: List[LeaderboardItem]
