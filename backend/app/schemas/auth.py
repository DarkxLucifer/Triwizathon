from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    org_name: Optional[str] = None
    role: str = Field(default="analyst", pattern="^(analyst|coach|gm|player|admin)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: str
    org_id: Optional[int] = None
    org_name: Optional[str] = None
    player_id: Optional[int] = None
    active_context: str = "organiser"
    available_contexts: List[str] = ["organiser"]
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ContextSwitchRequest(BaseModel):
    target_context: str = Field(pattern="^(player|organiser)$")
    target_org_id: Optional[int] = None


class UserMeResponse(BaseModel):
    user: UserOut
    player_summary: Optional[Dict[str, Any]] = None
    organization_summary: Optional[Dict[str, Any]] = None
    unread_notifications_count: int = 0
