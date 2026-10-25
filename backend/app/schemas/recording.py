from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RecordingSessionCreate(BaseModel):
    mode: str = Field(default="dual", description="'dual' (screen + camera) or 'screen_only'")
    consent_given: bool = Field(default=True, description="Explicit user consent acknowledgment")


class RecordingChallengeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    expires_at: datetime
    verified: bool
    spoken_at_sec: Optional[float] = None
    match_confidence: Optional[float] = None


class RecordingTrackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    track_kind: str
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    fps: Optional[float] = None
    display_surface: Optional[str] = None
    ended_early: bool = False


class RecordingCheckOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    check_type: str
    status: str
    summary: str
    details_json: Optional[Any] = None
    created_at: datetime


class RecordingShareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    org_id: int
    org_name: Optional[str] = None
    shared_at: datetime
    revoked_at: Optional[datetime] = None
    is_active: bool


class RecordingSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    player_id: Optional[int] = None
    session_token: str
    mode: str
    status: str
    label: str
    started_at: datetime
    stopped_at: Optional[datetime] = None
    duration_sec: float
    total_bytes: int
    final_screen_path: Optional[str] = None
    final_camera_path: Optional[str] = None
    audio_path: Optional[str] = None
    consent_recorded: bool
    retention_until: Optional[datetime] = None
    created_at: datetime

    challenge: Optional[RecordingChallengeOut] = None
    tracks: List[RecordingTrackOut] = []
    checks: List[RecordingCheckOut] = []
    shares: List[RecordingShareOut] = []


class ChunkUploadResponse(BaseModel):
    status: str
    session_id: int
    track_kind: str
    chunk_index: int
    byte_size: int
    sha256: str
    is_duplicate: bool


class RecordingFinalizeRequest(BaseModel):
    screen_ended_early: bool = False
    display_surface: Optional[str] = "monitor"
    screen_width: Optional[int] = None
    screen_height: Optional[int] = None
    screen_fps: Optional[float] = None
    camera_width: Optional[int] = None
    camera_height: Optional[int] = None
    camera_fps: Optional[float] = None


class RecordingShareRequest(BaseModel):
    org_id: int


class RecordingShareResponse(BaseModel):
    status: str
    session_id: int
    org_id: int
    is_active: bool
    message: str
