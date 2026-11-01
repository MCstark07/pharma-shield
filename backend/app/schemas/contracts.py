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
    PRESCRIPTION_PENDING = "PRESCRIPTION_PENDING"  # Patient submitted, awaiting doctor approval
    REQUESTED = "REQUESTED"                        # Doctor approved, awaiting vendor dispatch
    AUTHORIZED = "AUTHORIZED"                      # Vendor accepted & Ed25519 signed
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
    TELEMETRY_SPOOFING = "TELEMETRY_SPOOFING"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    REPLAY_ATTACK = "REPLAY_ATTACK"


class PatientPrescriptionCreate(BaseModel):
    patient_id: str = "PT-2026-JLNMCH-04"
    patient_name: str = "Rohit Kumar"
    bed_number: str = "Bed #ICU-04"
    facility_id: str = "FAC-JLNMCH-01"
    category: ResourceCategory = ResourceCategory.BLOOD_COMPONENTS
    resource_code: str = "O_POS_RBC"
    quantity: int = Field(gt=0, default=10)
    urgency: UrgencyLevel = UrgencyLevel.CRITICAL
    patient_note: Optional[str] = "Severe acute blood loss trauma - Emergency O+ RBC transfusion needed"


class DoctorApproveRequest(BaseModel):
    doctor_name: str = "Dr. Ananya Sharma"
    doctor_license: str = "LIC-BH-8842-TRAUMA"
    clinical_notes: Optional[str] = "Clinically verified for emergency bedside infusion protocol"


class MedicalRequisitionCreate(BaseModel):
    requesting_facility_id: str = "FAC-JLNMCH-01"
    category: ResourceCategory = ResourceCategory.BLOOD_COMPONENTS
    resource_code: str = "O_POS_RBC"
    quantity: int = Field(gt=0, default=10)
    urgency: UrgencyLevel = UrgencyLevel.CRITICAL
    clinical_note: Optional[str] = "Emergency Trauma ICU Transfusion - Protocol Active"
    patient_id: Optional[str] = "PT-2026-JLNMCH-04"
    patient_name: Optional[str] = "Rohit Kumar"
    bed_number: Optional[str] = "Bed #ICU-04"


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
    patient_id: Optional[str] = "PT-2026-JLNMCH-04"
    patient_name: Optional[str] = "Rohit Kumar"
    bed_number: Optional[str] = "Bed #ICU-04"
    doctor_approved: Optional[bool] = False
    prescribed_by: Optional[str] = None
    prescribed_at: Optional[str] = None
    doctor_license: Optional[str] = None
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
    authorized_by: str = "Dr. R. K. Sinha (Chief Medical Logistics Officer)"
    batch_id: Optional[str] = "BATCH-2026-MAYAGANJ-ALPHA"


class AttackPayload(BaseModel):
    attack_type: AttackType = AttackType.QUANTITY_TAMPER
    requisition_id: Optional[str] = None
    tampered_quantity: Optional[int] = 500
    forged_signature_hex: Optional[str] = None
    excursion_temperature_celsius: Optional[float] = 14.8
    spoofed_telemetry_celsius: Optional[float] = 14.8
    claimed_role: Optional[str] = "CHIEF_AUTHORITY_SIGNER"
    replay_nonce: Optional[str] = "0x88921BCA"
    target_facility_id: Optional[str] = "FAC-MAYAGANJ-01"


class AttackResponse(BaseModel):
    success: bool
    attack_type: AttackType
    status: str
    alert_title: str
    alert_details: str
    cryptographic_proof: Dict[str, Any]
    timestamp_utc: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Facility(BaseModel):
    id: str
    name: str
    facility_type: str
    latitude: float
    longitude: float
    city: str = "Bhagalpur"
    reliability: float = 95.0


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
    is_critical: bool = False


class WebSocketMessage(BaseModel):
    event_type: str
    timestamp: str
    data: Dict[str, Any]


# ===========================================================================
# Extended Core Problem Schemas (Problems 1, 2, 3, 4, 6)
# ===========================================================================

class SearchScope(str, Enum):
    LOCAL = "LOCAL"              # Within city / 25km radius
    DISTRICT = "DISTRICT"        # Within district / 100km radius
    INTER_STATE = "INTER_STATE"  # Across states / >100km radius


class LandedCostBreakdown(BaseModel):
    base_price_inr: float
    shipping_cost_inr: float
    cold_chain_surcharge_inr: float
    applicable_taxes_inr: float
    total_landed_cost_inr: float


class MedicineOffer(BaseModel):
    facility_id: str
    facility_name: str
    facility_type: str
    city: str
    district: str
    state: str
    distance_km: float
    estimated_transit_hours: float
    search_scope: SearchScope
    resource_code: str
    product_name: str
    brand: Optional[str] = None
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    pack_size: Optional[str] = None
    batch_number: str
    units_available: int
    stock_confidence: str  # CONFIRMED, LAST_REPORTED, INDICATIVE
    cost_breakdown: LandedCostBreakdown
    is_lowest_cost: bool = False
    is_fastest_delivery: bool = False
    cold_chain_required: bool = False
    storage_temp_range: str = "15.0°C – 25.0°C"


class MedicineSearchResponse(BaseModel):
    query: str
    category: Optional[str] = None
    user_location: Dict[str, Any]
    total_eligible_offers: int
    local_stock_available: bool
    recommended_offer: Optional[MedicineOffer] = None
    all_offers: List[MedicineOffer] = []
    search_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StatePriceSummary(BaseModel):
    state: str
    min_price_inr: float
    max_price_inr: float
    average_price_inr: float
    facilities_reporting: int
    total_units_in_state: int


class PriceIntelligenceReport(BaseModel):
    resource_code: str
    product_name: str
    national_median_price_inr: float
    state_breakdown: List[StatePriceSummary]
    lowest_cost_state: str
    highest_cost_state: str
    price_anomaly_detected: bool
    price_anomaly_details: Optional[str] = None
    data_freshness_minutes: int = 5
    generated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ColdChainDispositionRequest(BaseModel):
    shipment_id: str
    disposition: str  # "CLEARED_WITH_OVERRIDE" or "PERMANENTLY_REJECTED"
    inspector_name: str = "Dr. S. K. Verma (Chief Clinical Toxicologist)"
    inspector_license: str = "LIC-QC-9941-COLDCHAIN"
    justification_notes: str = "Excursion duration was evaluated under stability protocol; product remains clinically viable."


class ColdChainDispositionResponse(BaseModel):
    success: bool
    shipment_id: str
    final_status: str
    inspector_name: str
    inspector_license: str
    timestamp_utc: str
    signature_hex: str
    event_hash: str
    audit_chain_status: str = "CHAIN_VALID"


class RebalanceRecommendation(BaseModel):
    recommendation_id: str
    resource_code: str
    resource_name: str
    source_facility_id: str
    source_facility_name: str
    source_units_available: int
    source_dos_days: float
    target_facility_id: str
    target_facility_name: str
    target_units_available: int
    target_dos_days: float
    recommended_transfer_quantity: int
    distance_km: float
    estimated_transit_minutes: int
    priority: UrgencyLevel
    clinical_justification: str
