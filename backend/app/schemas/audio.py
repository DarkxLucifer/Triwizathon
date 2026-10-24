from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class AudioUploadResponse(BaseModel):
    job_id: int
    player_id: int
    status: str
    model_version: str
    message: str


class AudioEvidenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    start_sec: float
    end_sec: float
    transcript: str
    confidence: float
    is_command: bool
    needs_review: bool


class AudioJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    player_id: int
    player_handle: Optional[str] = None
    player_name: Optional[str] = None
    status: str
    model_version: str
    consent_given: bool
    decision_score: Optional[float] = None
    decision_data_json: Optional[dict] = None
    llm_provider: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    segments: List[AudioEvidenceOut]
