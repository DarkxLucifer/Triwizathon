from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BriefConstraints(BaseModel):
    region: Optional[str] = None
    min_tier: Optional[str] = None
    max_tier: Optional[str] = None
    available_only: bool = True
    playstyle_preference: Optional[str] = None


class BriefCreate(BaseModel):
    title_id: int = 1
    roster_id: Optional[int] = None
    target_role: str
    constraints: Optional[BriefConstraints] = None


class RecommendationBreakdown(BaseModel):
    role_performance: float
    roster_need_match: float
    synergy_contribution: float
    constraint_match: float
    telemetry_score_70: Optional[float] = None
    audio_score_30: Optional[float] = None
    unified_total_100: Optional[float] = None
    raw_metrics: Dict[str, float]
    redistributed_weights: Optional[Dict[str, float]] = None


class RecommendationItem(BaseModel):
    rank: int
    player_id: int
    name: str
    handle: str
    current_team: Optional[str] = None
    tier: str
    region: str
    role: str
    fit_score: float
    confidence: float
    evaluation_label: str
    audio_status: str
    formula_version: str
    breakdown: RecommendationBreakdown
    drivers: List[str]
    risks: List[str]
    alternatives: List[Dict[str, Any]]
    source: str


class BriefRecommendationsResponse(BaseModel):
    brief_id: int
    target_role: str
    formula_version: str
    roster_name: Optional[str] = None
    recommendations: List[RecommendationItem]
