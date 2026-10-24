from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class IngestionError(BaseModel):
    record_index: int
    reason: str
    rejected_data: Dict[str, Any]


class IngestionReportOut(BaseModel):
    total_records_processed: int
    accepted_count: int
    rejected_count: int
    sources: Dict[str, int]
    validation_errors: List[IngestionError]
    last_ingestion_time: datetime


class PlayerSearchAndImportRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Player handle, pro name, or Steam64 ID")
    role: Optional[str] = Field(None, description="Preferred role or auto-detect")
    tier: Optional[str] = Field("Tier 1", description="Competition tier: Tier 1, Tier 2, Tier 3")


class PlayerImportResponse(BaseModel):
    status: str
    message: str
    source: str
    player: Dict[str, Any]
