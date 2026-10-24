from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class PlayerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    handle: str
    role: str
    team_name: Optional[str] = None
    region: str
    tier: str
    is_available: bool
    source: str
    matches_count: int
    kd: float
    adr: float
    kpr: float
    confidence: float
    playstyle: str


class PlayerListResponse(BaseModel):
    total: int
    items: List[PlayerSummary]


class MatchStatItem(BaseModel):
    match_id: int
    match_date: datetime
    kills: int
    deaths: int
    adr: float
    kpr: float
    opening_kills: int
    opening_deaths: int
    trades: int
    utility_damage: float
    clutches_won: int
    rounds: int
    opponent_name: Optional[str] = None
    opponent_tier: Optional[str] = None


class PlayerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
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
    matches_count: int
    confidence: float
    confidence_label: str
    confidence_warning: Optional[str] = None
    formula_version: str
    data_coverage: float
    metrics: Dict[str, float]
    role_scores: Dict[str, float]
    recent_matches: List[MatchStatItem]
