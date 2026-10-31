from enum import Enum
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ResourceCategory(str, Enum):
    MEDICINES = "MEDICINES"
    BLOOD_COMPONENTS = "BLOOD_COMPONENTS"
    MEDICAL_EQUIPMENT = "MEDICAL_EQUIPMENT"
    VACCINES = "VACCINES"
    DIAGNOSTIC_SAMPLES = "DIAGNOSTIC_SAMPLES"
    EMERGENCY_SUPPLIES = "EMERGENCY_SUPPLIES"

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    STANDARD = "STANDARD"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"

class ShipmentStatus(str, Enum):
    PENDING = "PENDING"
    ALLOCATED = "ALLOCATED"
    DISPATCHED = "DISPATCHED"
    IN_TRANSIT = "IN_TRANSIT"
    UNDER_REVIEW = "UNDER_REVIEW"
    DELIVERED = "DELIVERED"
    REJECTED = "REJECTED"

class FacilityType(str, Enum):
    HOSPITAL = "HOSPITAL"
    BLOOD_BANK = "BLOOD_BANK"
    WAREHOUSE = "WAREHOUSE"
    LAB = "LAB"

class FacilityBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    organization_id: str
    facility_type: str  # HOSPITAL, BLOOD_BANK, WAREHOUSE, LAB
    latitude: float
    longitude: float
    city: str = "Bhagalpur"
    is_active: bool = True

class FacilityCreate(BaseModel):
    name: str
    organization_id: str
    facility_type: str
    latitude: float
    longitude: float
    city: str = "Bhagalpur"

class FacilityResponse(FacilityBase):
    pass

