from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class RosterSlotPlayer(BaseModel):
    id: int
    name: str
    handle: str
    role: str
    tier: str
    kd: float
    adr: float
    role_score: float
    confidence: float
    playstyle: str


class RosterSlotOut(BaseModel):
    slot_number: int
    role: str
    player: Optional[RosterSlotPlayer] = None
    status: str  # optimal, weakest, warning, empty


class RosterSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    title_name: str
    team_name: Optional[str] = None
    filled_slots: int
    total_slots: int
    weakest_role: Optional[str] = None
    created_at: datetime


class RosterAlert(BaseModel):
    severity: str  # high, medium, low
    message: str


class RosterHealthResponse(BaseModel):
    roster_id: int
    roster_name: str
    title: str
    slots: List[RosterSlotOut]
    weakest_role: Optional[str] = None
    weakest_slot_index: Optional[int] = None
    overlap_analysis: str
    alerts: List[RosterAlert]
