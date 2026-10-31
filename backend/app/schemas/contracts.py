"""
PharmaShield — Central Pydantic v2 Contracts
Single source of truth for all three portals and the central real-time API.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
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


class RequisitionStatus(str, Enum):
    REQUESTED = "REQUESTED"
    AUTHORIZED = "AUTHORIZED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    UNDER_REVIEW = "UNDER_REVIEW"
    TAMPER_REJECTED = "TAMPER_REJECTED"


class AttackType(str, Enum):
    QUANTITY_TAMPER = "QUANTITY_TAMPER"
    SIGNATURE_FORGERY = "SIGNATURE_FORGERY"
    TEMPERATURE_BREACH = "TEMPERATURE_BREACH"
    BLOOD_INCOMPATIBILITY = "BLOOD_INCOMPATIBILITY"
    REPLAY_EXPIRED_BATCH = "REPLAY_EXPIRED_BATCH"


class MedicalRequisitionCreate(BaseModel):
    requesting_facility_id: str = "FAC-JLNMCH-01"
    category: ResourceCategory = ResourceCategory.BLOOD_COMPONENTS
    resource_code: str = "O_POS_RBC"
    quantity: int = Field(gt=0, default=10)
    urgency: UrgencyLevel = UrgencyLevel.CRITICAL
    clinical_note: Optional[str] = "Emergency Trauma ICU Transfusion - Protocol Active"


class MedicalRequisition(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    requesting_facility_id: str
    category: ResourceCategory
    resource_code: str
    quantity: int
    urgency: UrgencyLevel
    clinical_note: Optional[str] = None
    status: RequisitionStatus
    created_at: str
    authorized_at: Optional[str] = None
    authorized_by: Optional[str] = None
    supplying_facility_id: Optional[str] = None
    batch_id: Optional[str] = None
    temperature_celsius: Optional[float] = 4.2
    event_hash: Optional[str] = None
    signature_hex: Optional[str] = None
    public_key_hex: Optional[str] = None
    previous_hash: Optional[str] = None


class AuthorizeRequest(BaseModel):
    supplying_facility_id: str = "FAC-MAYAGANJ-01"
    authorized_by: str = "Dr. R. K. Sharma (Chief Depot Pharmacist)"
    batch_id: Optional[str] = "BATCH-2026-MAYAGANJ-881"


class AttackPayload(BaseModel):
    attack_type: AttackType = AttackType.QUANTITY_TAMPER
    requisition_id: Optional[str] = None
    tampered_quantity: Optional[int] = 500
    forged_signature_hex: Optional[str] = None
    excursion_temperature_celsius: Optional[float] = 14.8
    target_facility_id: Optional[str] = "FAC-MAYAGANJ-01"


class AttackResponse(BaseModel):
    success: bool  # True if defense successfully intercepted attack
    attack_type: AttackType
    status: str
    alert_title: str
    alert_details: str
    cryptographic_proof: Dict[str, Any]
    timestamp_utc: str


class WebSocketMessage(BaseModel):
    event_type: str  # REQUISITION_CREATED, REQUISITION_AUTHORIZED, SECURITY_ALERT, TELEMETRY_UPDATE, STOCK_UPDATED
    timestamp: str
    data: Dict[str, Any]


class Facility(BaseModel):
    id: str
    name: str
    facility_type: str  # HOSPITAL, BLOOD_BANK, CLINIC, DEPOT
    latitude: float
    longitude: float
    reliability: float


class InventoryStock(BaseModel):
    id: str
    facility_id: str
    facility_name: str
    category: ResourceCategory
    resource_code: str
    name: str
    quantity: int
    min_threshold: int
    days_of_stock: float
    storage_temp_celsius: float
    is_critical: bool

