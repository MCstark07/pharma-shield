from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.core import ResourceCategory

# Category specific detail models
class MedicineDetails(BaseModel):
    batch_id: str
    expiry_date: datetime
    recall_status: bool = False
    storage_temp_c: float = 20.0

class BloodDetails(BaseModel):
    blood_group: str  # "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
    component: str    # "RBC", "Platelet", "Plasma", "Whole Blood"
    expiry_date: datetime

class EquipmentDetails(BaseModel):
    serial_no: str
    calibration_valid: bool = True
    maintenance_due: datetime

class VaccineDetails(BaseModel):
    batch_id: str
    min_temp_c: float = 2.0
    max_temp_c: float = 8.0
    current_temp_c: float = 4.0
    expiry_date: datetime

class DiagnosticDetails(BaseModel):
    sample_id: str
    specimen_type: str  # "Blood", "Biopsy", "Swab", etc.
    processing_deadline: datetime

class EmergencySupplyDetails(BaseModel):
    item_type: str      # "Trauma Kit", "PPE", "Ventilator Circuit", "Anti-venom"
    critical_grade: bool = True

# Common Resource Schemas
class InventoryItemBase(BaseModel):
    facility_id: str
    category: ResourceCategory
    resource_code: str
    name: str
    units_available: int = Field(default=0, ge=0)
    batch_number: str = "BATCH-DEFAULT"
    expiry_date: datetime
    status: str = "AVAILABLE"  # AVAILABLE, QUARANTINED, DEPLETED, RESERVED
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    details: Dict[str, Any] = {}
    daily_consumption: float = 1.0

    # Optional alias property
    @property
    def quantity(self) -> int:
        return self.units_available

class InventoryItemCreate(BaseModel):
    facility_id: str
    category: ResourceCategory
    resource_code: str
    name: str
    units_available: Optional[int] = None
    quantity: Optional[int] = None
    batch_number: Optional[str] = "BATCH-DEFAULT"
    expiry_date: Optional[datetime] = None
    status: Optional[str] = "AVAILABLE"
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    details: Dict[str, Any] = {}
    daily_consumption: float = 1.0
    is_quarantined: bool = False
    quarantine_reason: Optional[str] = None

class InventoryItemUpdate(BaseModel):
    units_available: Optional[int] = None
    quantity: Optional[int] = None
    status: Optional[str] = None
    is_quarantined: Optional[bool] = None
    quarantine_reason: Optional[str] = None
    daily_consumption: Optional[float] = None
    details: Optional[Dict[str, Any]] = None

class BatchQuarantineRequest(BaseModel):
    batch_or_item_id: str
    reason: str
    quarantine: bool = True

class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    facility_id: str
    category: ResourceCategory
    resource_code: str
    name: str
    units_available: int
    quantity: int
    batch_number: str
    expiry_date: datetime
    status: str
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    details: Dict[str, Any] = {}
    daily_consumption: float = 1.0
    is_quarantined: bool = False
    quarantine_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
