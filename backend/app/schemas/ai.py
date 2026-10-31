from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

class CandidateSupplier(BaseModel):
    facility_id: str
    facility_name: str
    latitude: float
    longitude: float
    distance_km: float
    available_units: int
    score: float                        # 0.0 to 100.0
    rank: int
    score_breakdown: Dict[str, float]   # {"urgency": 30, "availability": 25, "transport": 20, "safety": 15, "reliability": 10}
    is_eligible: bool
    disqualification_reason: Optional[str] = None

# Synonym alias matching GEMINI.md
CandidateMatch = CandidateSupplier

class MatchingResponse(BaseModel):
    request_id: str
    resource_code: str
    candidates: List[CandidateSupplier]
    best_match: Optional[CandidateSupplier] = None

class ShortagePrediction(BaseModel):
    facility_id: str
    facility_name: str
    resource_code: str
    resource_name: str
    current_stock: int
    daily_consumption: float
    dos_days: float
    lead_time_days: float
    status: str                         # "NORMAL", "LOW_STOCK_WARNING", "CRITICAL_SHORTAGE_PREDICTED"
    predicted_exhaustion_date: Optional[str] = None
    alert_level: str                    # "SAFE", "WARNING", "CRITICAL"
