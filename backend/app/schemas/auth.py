from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    org_name: str
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
    org_id: int
    org_name: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
