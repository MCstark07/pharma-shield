from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.core import ResourceCategory, UrgencyLevel, ShipmentStatus

class MedicalRequestCreate(BaseModel):
    requesting_facility_id: str
    category: ResourceCategory
    resource_code: str                  # e.g., "O_POS_RBC", "INSULIN_GLARGINE", "TRAUMA_KIT"
    quantity: int = Field(gt=0)
    urgency: UrgencyLevel = UrgencyLevel.STANDARD
    required_by: Optional[datetime] = None
    clinical_note_redacted: Optional[str] = None  # No raw patient PII allowed

# Alias for GEMINI.md Section 2 / compatibility
EmergencyRequestCreate = MedicalRequestCreate

class MedicalRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    requesting_facility_id: str
    category: ResourceCategory
    resource_code: str
    quantity: int
    urgency: UrgencyLevel
    required_by: Optional[datetime] = None
    clinical_note_redacted: Optional[str] = None
    status: str                         # "OPEN", "MATCHED", "ALLOCATED", "DISPATCHED", "DELIVERED", "CANCELLED"
    created_at: datetime
    updated_at: Optional[datetime] = None

EmergencyRequestResponse = MedicalRequestResponse

class AllocationCreate(BaseModel):
    request_id: str
    fulfilling_facility_id: str
    allocated_quantity: int = Field(gt=0)
    transport_mode: str = "EMERGENCY_AMBULANCE"
    cold_chain_required: bool = False

class AllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    request_id: str
    fulfilling_facility_id: str
    allocated_quantity: int
    transport_mode: str
    cold_chain_required: bool
    status: str
    created_at: datetime
