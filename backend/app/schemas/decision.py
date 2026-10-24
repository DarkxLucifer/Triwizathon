from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DecisionCreate(BaseModel):
    brief_id: Optional[int] = None
    player_id: int
    roster_id: Optional[int] = None
    action: str = Field(pattern="^(advance|trial|watch|reject)$")
    rationale: str = Field(min_length=5)
    outcome_label: Optional[str] = None


class DecisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_id: int
    brief_id: Optional[int] = None
    player_id: int
    player_name: str
    player_handle: str
    roster_id: Optional[int] = None
    roster_name: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    rationale: str
    outcome_label: Optional[str] = None
    formula_version: str
    created_at: datetime
