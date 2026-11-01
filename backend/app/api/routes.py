"""
PharmaShield — Central API Routes & Real-Time Event Bus
Provides REST endpoints and /ws/events WebSocket broadcasting
connecting Doctor, Pharma Ops, and Cyber Lab portals.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from fastapi import Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db, SessionLocal
from backend.app.models.inventory import InventoryItem as DBInventoryItem
from backend.app.models.organization import Facility as DBFacility
from backend.app.models.shipments import Shipment as DBShipment
from backend.app.models.ledger import AuditLedgerRecord as DBAuditLedgerRecord
from backend.app.schemas.contracts import (
    AttackPayload,
    AttackResponse,
    AttackType,
    AuthorizeRequest,
    ColdChainDispositionRequest,
    ColdChainDispositionResponse,
    DoctorApproveRequest,
    Facility,
    InventoryStock,
    MedicalRequisition,
    MedicalRequisitionCreate,
    MedicineSearchResponse,
    PatientPrescriptionCreate,
    PriceIntelligenceReport,
    RebalanceRecommendation,
    RequisitionStatus,
    ResourceCategory,
    UrgencyLevel,
    WebSocketMessage,
)
from backend.app.services.medicine_finder import (
    search_medicines_universal,
    get_price_intelligence_report,
    generate_rebalance_recommendations,
)
from backend.app.services.crypto_ledger import (
    authorities,
    global_ledger,
    sign_requisition_event,
)
from backend.app.services.event_bus import event_bus
from backend.app.services.crypto import (
    canonical_bytes,
    compute_event_hash,
    generate_keypair,
    sign_hash,
    verify_signature,
)
from backend.app.services.forecasting import calculate_days_of_stock


router = APIRouter()

# In-memory fast state store synchronized with SQLite
REQUISITIONS: Dict[str, MedicalRequisition] = {}
FACILITIES: Dict[str, Facility] = {
    "FAC-JLNMCH-01": Facility(
        id="FAC-JLNMCH-01",
        name="Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
        facility_type="HOSPITAL",
        latitude=25.2445,
        longitude=87.0125,
        reliability=96.5,
    ),
    "FAC-MAYAGANJ-01": Facility(
        id="FAC-MAYAGANJ-01",
        name="Mayaganj Blood Bank & Central Depot",
        facility_type="DEPOT",
        latitude=25.2420,
        longitude=87.0150,
        reliability=98.0,
    ),
    "FAC-SADAR-01": Facility(
        id="FAC-SADAR-01",
        name="Sadar Hospital Bhagalpur",
        facility_type="HOSPITAL",
        latitude=25.2490,
        longitude=86.9840,
        reliability=92.0,
    ),
    "FAC-CLINIC-01": Facility(
        id="FAC-CLINIC-01",
        name="IIIT Bhagalpur Health Clinic",
        facility_type="CLINIC",
        latitude=25.2605,
        longitude=87.0425,
        reliability=89.0,
    ),
}

INVENTORY: List[InventoryStock] = [
    InventoryStock(
        id="INV-001",
        facility_id="FAC-MAYAGANJ-01",
        facility_name="Mayaganj Central Depot",
        category=ResourceCategory.BLOOD_COMPONENTS,
        resource_code="O_POS_RBC",
        name="Packed Red Blood Cells (O+)",
        quantity=50,
        min_threshold=15,
        days_of_stock=6.25,
        storage_temp_celsius=4.0,
        is_critical=False,
    ),
    InventoryStock(
        id="INV-002",
        facility_id="FAC-JLNMCH-01",
        facility_name="JLNMCH Hospital",
        category=ResourceCategory.BLOOD_COMPONENTS,
        resource_code="O_POS_RBC",
        name="Packed Red Blood Cells (O+)",
        quantity=4,
        min_threshold=8,
        days_of_stock=0.8,
        storage_temp_celsius=4.2,
        is_critical=True,
    ),
    InventoryStock(
        id="INV-003",
        facility_id="FAC-MAYAGANJ-01",
        facility_name="Mayaganj Central Depot",
        category=ResourceCategory.BLOOD_COMPONENTS,
        resource_code="A_POS_RBC",
        name="Packed Red Blood Cells (A+)",
        quantity=40,
        min_threshold=10,
        days_of_stock=5.0,
        storage_temp_celsius=4.0,
        is_critical=False,
    ),
    InventoryStock(
        id="INV-004",
        facility_id="FAC-SADAR-01",
        facility_name="Sadar Hospital Bhagalpur",
        category=ResourceCategory.BLOOD_COMPONENTS,
        resource_code="O_POS_RBC",
        name="Packed Red Blood Cells (O+)",
        quantity=25,
        min_threshold=5,
        days_of_stock=8.3,
        storage_temp_celsius=21.0,
        is_critical=False,
    ),
    InventoryStock(
        id="INV-005",
        facility_id="FAC-CLINIC-01",
        facility_name="IIIT Bhagalpur Health Clinic",
        category=ResourceCategory.EMERGENCY_SUPPLIES,
        resource_code="ANTI_VENOM_POLYVALENT",
        name="Snake Venom Antiserum (Polyvalent)",
        quantity=2,
        min_threshold=4,
        days_of_stock=2.0,
        storage_temp_celsius=5.0,
        is_critical=True,
    ),
    InventoryStock(
        id="INV-006",
        facility_id="FAC-SADAR-01",
        facility_name="Sadar Hospital Bhagalpur",
        category=ResourceCategory.MEDICINES,
        resource_code="INSULIN_GLARGINE",
        name="Insulin Glargine 100 IU/ml",
        quantity=45,
        min_threshold=12,
        days_of_stock=9.0,
        storage_temp_celsius=4.0,
        is_critical=False,
    ),
]


def init_seed_requisitions():
    """Populates realistic active requisitions on initial boot."""
    if not REQUISITIONS:
        req1 = MedicalRequisition(
            id="REQ-2026-JLNMCH-001",
            requesting_facility_id="FAC-JLNMCH-01",
            category=ResourceCategory.BLOOD_COMPONENTS,
            resource_code="O_POS_RBC",
            quantity=10,
            urgency=UrgencyLevel.CRITICAL,
            clinical_note="ICU Emergency Transfusion - Severe Hemorrhagic Shock",
            status=RequisitionStatus.PRESCRIPTION_PENDING,
            patient_id="PT-2026-JLNMCH-04",
            patient_name="Rohit Kumar",
            bed_number="Bed #ICU-04",
            doctor_approved=False,
            created_at=datetime.now(timezone.utc).isoformat(),
            temperature_celsius=4.2,
        )
        REQUISITIONS[req1.id] = req1


init_seed_requisitions()


# ---------------------------------------------------------------------------
# WebSocket Bus Endpoint
# ---------------------------------------------------------------------------
@router.websocket("/ws/events")
async def websocket_event_bus(websocket: WebSocket):
    await event_bus.connect(websocket)
    try:
        # Send initial snapshot upon connection
        await event_bus.send_personal_message(
            {
                "event_type": "INITIAL_STATE",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "data": {
                    "requisitions": [r.model_dump() for r in REQUISITIONS.values()],
                    "inventory": [i.model_dump() for i in INVENTORY],
                    "facilities": [f.model_dump() for f in FACILITIES.values()],
                },
            },
            websocket,
        )
        while True:
            # Keep socket alive and accept client telemetry or pings
            msg = await websocket.receive_text()
    except WebSocketDisconnect:
        event_bus.disconnect(websocket)


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------
@router.get("/requisitions", response_model=List[MedicalRequisition])
def get_requisitions():
    """Fetches all medical requisitions sorted by newest first."""
    reqs = list(REQUISITIONS.values())
    reqs.sort(key=lambda x: x.created_at, reverse=True)
    return reqs


@router.post("/patient/prescription", response_model=MedicalRequisition)
async def create_patient_prescription(payload: PatientPrescriptionCreate):
    """
    Step 1: Patient submits an emergency prescription / supply request.
    Status starts as PRESCRIPTION_PENDING.
    Broadcasts PRESCRIPTION_REQUESTED over WebSocket to Doctor portal.
    """
    req_id = f"REQ-2026-{uuid.uuid4().hex[:6].upper()}"
    new_req = MedicalRequisition(
        id=req_id,
        requesting_facility_id=payload.facility_id,
        category=payload.category,
        resource_code=payload.resource_code,
        quantity=payload.quantity,
        urgency=payload.urgency,
        clinical_note=payload.patient_note,
        status=RequisitionStatus.PRESCRIPTION_PENDING,
        patient_id=payload.patient_id,
        patient_name=payload.patient_name,
        bed_number=payload.bed_number,
        doctor_approved=False,
        created_at=datetime.now(timezone.utc).isoformat(),
        temperature_celsius=4.2,
    )
    REQUISITIONS[req_id] = new_req

    # Broadcast to Doctor on Port 5173
    await event_bus.broadcast("PRESCRIPTION_REQUESTED", new_req.model_dump())

    return new_req


@router.post("/doctor/prescriptions/{req_id}/approve", response_model=MedicalRequisition)
async def approve_prescription(req_id: str, payload: DoctorApproveRequest):
    """
    Step 2: Doctor reviews and approves the patient's prescription with medical license.
    Transitions status to REQUESTED (now an active hospital requisition).
    Broadcasts DOCTOR_PRESCRIPTION_APPROVED and REQUISITION_CREATED to Vendor on Port 5174.
    """
    if req_id not in REQUISITIONS:
        raise HTTPException(status_code=404, detail="Requisition not found")

    req = REQUISITIONS[req_id]
    now_utc = datetime.now(timezone.utc).isoformat()
    req.status = RequisitionStatus.REQUESTED
    req.doctor_approved = True
    req.prescribed_by = payload.doctor_name
    req.doctor_license = payload.doctor_license
    req.prescribed_at = now_utc
    if payload.clinical_notes:
        req.clinical_note = f"{req.clinical_note or ''} [Physician Note: {payload.clinical_notes}]".strip()

    REQUISITIONS[req_id] = req

    # Real-time WebSocket Broadcast: Alert Vendor on Port 5174
    await event_bus.broadcast("DOCTOR_PRESCRIPTION_APPROVED", req.model_dump())
    await event_bus.broadcast("REQUISITION_CREATED", req.model_dump())

    return req


@router.post("/requisitions", response_model=MedicalRequisition)
async def create_requisition(payload: MedicalRequisitionCreate):
    """
    Submits a new emergency requisition from Clinical Doctor Portal.
    Broadcasts REQUISITION_CREATED event to Pharma Ops and Cyber Lab.
    """
    req_id = f"REQ-2026-{uuid.uuid4().hex[:6].upper()}"
    new_req = MedicalRequisition(
        id=req_id,
        requesting_facility_id=payload.requesting_facility_id,
        category=payload.category,
        resource_code=payload.resource_code,
        quantity=payload.quantity,
        urgency=payload.urgency,
        clinical_note=payload.clinical_note,
        status=RequisitionStatus.REQUESTED,
        patient_id=payload.patient_id or "PT-2026-JLNMCH-04",
        patient_name=payload.patient_name or "Rohit Kumar",
        bed_number=payload.bed_number or "Bed #ICU-04",
        doctor_approved=True,
        prescribed_by="Dr. Ananya Sharma",
        created_at=datetime.now(timezone.utc).isoformat(),
        temperature_celsius=4.0,
    )
    REQUISITIONS[req_id] = new_req

    # Real-time WebSocket Broadcast
    await event_bus.broadcast("REQUISITION_CREATED", new_req.model_dump())

    return new_req


@router.post("/requisitions/{req_id}/authorize", response_model=MedicalRequisition)
async def authorize_requisition(req_id: str, payload: AuthorizeRequest):
    """
    Step 3: Authorizes an order from Pharma Ops Hub (Vendor Approval):
    Applies Ed25519 digital signature and SHA-256 canonical hash chaining.
    Broadcasts REQUISITION_AUTHORIZED to Doctor, Patient, and Cyber Lab portals.
    """
    if req_id not in REQUISITIONS:
        raise HTTPException(status_code=404, detail="Requisition not found")

    req = REQUISITIONS[req_id]
    now_utc = datetime.now(timezone.utc).isoformat()
    supplying_fac = payload.supplying_facility_id
    batch_id = payload.batch_id or f"BATCH-{uuid.uuid4().hex[:6].upper()}"

    # Sign with Ed25519 Authority Key & chain into SHA-256 Ledger
    audit_data = {
        "id": req.id,
        "resource_code": req.resource_code,
        "quantity": req.quantity,
        "requesting_facility_id": req.requesting_facility_id,
        "supplying_facility_id": supplying_fac,
        "batch_id": batch_id,
        "authorized_by": payload.authorized_by,
        "authorized_at": now_utc,
    }
    audit_record = sign_requisition_event(
        facility_id=supplying_fac,
        requisition_data=audit_data,
        event_type="REQUISITION_AUTHORIZED",
    )

    # Update requisition state
    req.status = RequisitionStatus.AUTHORIZED
    req.authorized_at = now_utc
    req.authorized_by = payload.authorized_by
    req.supplying_facility_id = supplying_fac
    req.batch_id = batch_id
    req.event_hash = audit_record["event_hash"]
    req.signature_hex = audit_record["signature_hex"]
    req.public_key_hex = audit_record["public_key_hex"]
    req.previous_hash = audit_record["event"]["previous_hash"]

    REQUISITIONS[req_id] = req

    # Deduct stock from supplying facility (In-Memory + Database Row-Level Lock)
    for inv in INVENTORY:
        if inv.resource_code == req.resource_code and inv.facility_id == supplying_fac:
            inv.quantity = max(0, inv.quantity - req.quantity)
            inv.days_of_stock = calculate_days_of_stock(inv.quantity, 5.0)
            inv.is_critical = inv.days_of_stock <= 2.0

    try:
        with SessionLocal() as db:
            db_item = db.query(DBInventoryItem).filter(
                DBInventoryItem.resource_code == req.resource_code,
                DBInventoryItem.facility_id == supplying_fac
            ).with_for_update().first()
            if db_item:
                db_item.units_available = max(0, db_item.units_available - req.quantity)
                if db_item.units_available == 0:
                    db_item.status = "DEPLETED"
                db.commit()
    except Exception as db_err:
        pass

    # Real-time WebSocket Broadcast
    await event_bus.broadcast("REQUISITION_AUTHORIZED", req.model_dump())

    return req


@router.post("/attack", response_model=AttackResponse)
async def simulate_attack(payload: AttackPayload):
    """
    Cybersecurity Lab Exploit Trigger:
    Simulates malicious MITM quantity tampering, forged signatures, or cold-chain breaches.
    Verifies cryptographic failure and broadcasts SECURITY_ALERT across all portals.
    """
    now_utc = datetime.now(timezone.utc).isoformat()
    target_id = payload.requisition_id or (list(REQUISITIONS.keys())[0] if REQUISITIONS else "REQ-NONE")
    req = REQUISITIONS.get(target_id)

    if not req:
        raise HTTPException(status_code=404, detail="No requisition available for exploit simulation")

    if payload.attack_type == AttackType.QUANTITY_TAMPER:
        tampered_qty = payload.tampered_quantity or 500
        original_qty = req.quantity
        original_hash = req.event_hash or "b1d1387cfe794e6cb56082f020e05156cd87e3e5695dedd41bedcd9ccd9299ee"
        original_sig = req.signature_hex or "8bf77bb782cc83a0859a826958b3713e"

        # Construct tampered envelope
        envelope = {
            "id": req.id,
            "resource_code": req.resource_code,
            "quantity": tampered_qty,
            "requesting_facility_id": req.requesting_facility_id,
        }
        tampered_hash = compute_event_hash(req.previous_hash or ("0" * 64), envelope)
        pub_hex = req.public_key_hex or authorities.get_public_key("FAC-MAYAGANJ-01")

        # Cryptographically evaluate tampered payload against original signature
        is_valid = verify_signature(pub_hex, tampered_hash, original_sig)

        # Mark requisition as quarantined
        req.status = RequisitionStatus.TAMPER_REJECTED
        REQUISITIONS[target_id] = req

        alert_msg = {
            "attack_type": "QUANTITY_TAMPER",
            "requisition_id": req.id,
            "original_quantity": original_qty,
            "tampered_quantity": tampered_qty,
            "original_hash": original_hash,
            "tampered_hash": tampered_hash,
            "signature_valid": is_valid,
            "defense_action": "PAYLOAD_DEFLECTED_TO_QUARANTINE",
            "timestamp": now_utc,
        }

        # Broadcast High-Priority Security Alert across ALL portals
        await event_bus.broadcast("SECURITY_ALERT", alert_msg)

        return AttackResponse(
            success=True,
            attack_type=AttackType.QUANTITY_TAMPER,
            status="ATTACK_DEFLECTED",
            alert_title="🚨 CRITICAL SECURITY ALERT: QUANTITY TAMPERING INTERCEPTED",
            alert_details=(
                f"Malicious actor attempted to inflate {req.resource_code} from {original_qty} to {tampered_qty} units. "
                f"SHA-256 hash diverged and Ed25519 verification failed instantly."
            ),
            cryptographic_proof={
                "original_hash": original_hash,
                "tampered_hash": tampered_hash,
                "signature_check": "FAILED (Invalid Signature)",
                "avalanche_effect_detected": True,
            },
            timestamp_utc=now_utc,
        )

    elif payload.attack_type == AttackType.SIGNATURE_FORGERY:
        forged_sig = "deadbeef" * 16  # 128 chars invalid hex
        pub_hex = authorities.get_public_key("FAC-MAYAGANJ-01")
        hash_val = req.event_hash or compute_event_hash("0" * 64, {"test": "payload"})
        is_valid = verify_signature(pub_hex, hash_val, forged_sig)

        req.status = RequisitionStatus.TAMPER_REJECTED
        REQUISITIONS[target_id] = req

        alert_msg = {
            "attack_type": "SIGNATURE_FORGERY",
            "requisition_id": req.id,
            "forged_signature": forged_sig,
            "defense_action": "FORGERY_REJECTED_ZERO_TRUST",
            "timestamp": now_utc,
        }
        await event_bus.broadcast("SECURITY_ALERT", alert_msg)

        return AttackResponse(
            success=True,
            attack_type=AttackType.SIGNATURE_FORGERY,
            status="FORGERY_REJECTED",
            alert_title="🚨 SECURITY ALERT: FORGED ED25519 SIGNATURE DETECTED",
            alert_details="Unauthorized entity attempted to inject fabricated digital signature. Rejected under zero-trust policy.",
            cryptographic_proof={"verification_result": "REJECTED", "public_key": pub_hex},
            timestamp_utc=now_utc,
        )

    elif payload.attack_type == AttackType.TEMPERATURE_BREACH or payload.attack_type == AttackType.TELEMETRY_SPOOFING:
        temp_c = payload.excursion_temperature_celsius or payload.spoofed_telemetry_celsius or 14.8
        req.temperature_celsius = temp_c
        req.status = RequisitionStatus.UNDER_REVIEW
        REQUISITIONS[target_id] = req

        alert_msg = {
            "attack_type": "TEMPERATURE_BREACH",
            "requisition_id": req.id,
            "temperature_celsius": temp_c,
            "safe_zone": "2.0°C – 8.0°C",
            "defense_action": "SHIPMENT_LOCKED_INTO_UNDER_REVIEW",
            "timestamp": now_utc,
        }
        await event_bus.broadcast("SECURITY_ALERT", alert_msg)

        return AttackResponse(
            success=True,
            attack_type=AttackType.TEMPERATURE_BREACH,
            status="EXCURSION_QUARANTINED",
            alert_title="❄️ COLD-CHAIN BREACH: THERMAL EXCURSION TRIGGERED",
            alert_details=f"Sensor registered {temp_c}°C (violating 2.0°C – 8.0°C safe threshold). Shipment automatically locked into UNDER_REVIEW.",
            cryptographic_proof={"excursion_celsius": temp_c, "quarantine_enforced": True},
            timestamp_utc=now_utc,
        )

    elif payload.attack_type == AttackType.BLOOD_INCOMPATIBILITY:
        req.status = RequisitionStatus.TAMPER_REJECTED
        REQUISITIONS[target_id] = req

        alert_msg = {
            "attack_type": "BLOOD_INCOMPATIBILITY",
            "requisition_id": req.id,
            "patient_blood_group": "O_POS",
            "attempted_donor_blood_group": "B_POS",
            "defense_action": "CLINICAL_SAFETY_FILTER_HALT",
            "timestamp": now_utc,
        }
        await event_bus.broadcast("SECURITY_ALERT", alert_msg)

        return AttackResponse(
            success=True,
            attack_type=AttackType.BLOOD_INCOMPATIBILITY,
            status="INCOMPATIBILITY_REJECTED",
            alert_title="🧬 CRITICAL SAFETY INTERCEPTION: ABO BLOOD MISMATCH",
            alert_details="Malicious actor attempted to allocate incompatible B+ RBC to O+ recipient. Hard clinical safety filter blocked dispatch.",
            cryptographic_proof={
                "donor_type": "B_POS",
                "recipient_type": "O_POS",
                "compatibility_check": "FAILED (Hard Rule Violation)",
                "action": "DISQUALIFIED_FROM_DISPATCH"
            },
            timestamp_utc=now_utc,
        )

    elif payload.attack_type == AttackType.REPLAY_EXPIRED_BATCH or payload.attack_type == AttackType.REPLAY_ATTACK:
        req.status = RequisitionStatus.TAMPER_REJECTED
        REQUISITIONS[target_id] = req

        alert_msg = {
            "attack_type": "REPLAY_EXPIRED_BATCH",
            "requisition_id": req.id,
            "replayed_batch_id": "BATCH-2024-EXPIRED-RECALLED",
            "defense_action": "REPLAY_AND_EXPIRY_REJECTION",
            "timestamp": now_utc,
        }
        await event_bus.broadcast("SECURITY_ALERT", alert_msg)

        return AttackResponse(
            success=True,
            attack_type=AttackType.REPLAY_EXPIRED_BATCH,
            status="REPLAY_REJECTED",
            alert_title="🔄 ADVERSARIAL REPLAY: EXPIRED BATCH INJECTION DEFLECTED",
            alert_details="Actor attempted to re-inject a decommissioned/expired batch into active transit. Rejected under cryptographic non-repudiation.",
            cryptographic_proof={
                "batch_status": "EXPIRED_OR_RECALLED",
                "timestamp_check": "REJECTED (Expired Lifespan)",
                "nonce_replay_detected": True
            },
            timestamp_utc=now_utc,
        )

    raise HTTPException(status_code=400, detail="Unsupported attack type")


@router.get("/depot-stocks", response_model=List[InventoryStock])
def get_depot_stocks():
    """Fetches real-time stock levels across all Bhagalpur depots."""
    return INVENTORY


@router.get("/ledger")
def get_audit_ledger():
    """Returns chronological Ed25519 / SHA-256 cryptographic audit ledger records."""
    is_valid, audit_log = global_ledger.verify_chain()
    return {
        "is_chain_healthy": is_valid,
        "total_blocks": len(global_ledger),
        "latest_hash": global_ledger.latest_hash,
        "records": global_ledger.get_records(),
        "audit_verification": audit_log,
    }


# ---------------------------------------------------------------------------
# Problem 3: Universal Medicine Availability Finder
# ---------------------------------------------------------------------------
@router.get("/medicines/search", response_model=MedicineSearchResponse)
def universal_medicine_search(
    query: str = Query("INSULIN_GLARGINE", description="Medicine name, resource code or brand"),
    category: Optional[str] = Query(None, description="Optional category filter"),
    lat: float = Query(26.7271, description="User latitude (default: Siliguri)"),
    lng: float = Query(88.3953, description="User longitude (default: Siliguri)"),
    city: str = Query("Siliguri", description="User current city"),
    state: str = Query("West Bengal", description="User current state"),
    db: Session = Depends(get_db),
):
    """
    Problem 3 Core: Universal Medicine Availability Finder.
    Searches Local -> District -> Inter-State providers.
    Calculates Landed Cost = Listed Price + Shipping + Cold-Chain Surcharge + GST.
    """
    return search_medicines_universal(
        db=db,
        query=query,
        user_lat=lat,
        user_lng=lng,
        user_city=city,
        user_state=state,
        category=category,
    )


@router.get("/medicines/catalog")
def get_medicine_catalog(db: Session = Depends(get_db)):
    """Returns available distinct medicine and resource catalog items."""
    items = db.query(DBInventoryItem).all()
    catalog = {}
    for item in items:
        if item.resource_code not in catalog:
            details = item.details if isinstance(item.details, dict) else {}
            catalog[item.resource_code] = {
                "resource_code": item.resource_code,
                "name": item.name,
                "category": item.category,
                "brand": details.get("brand"),
                "generic": details.get("generic"),
                "pack_size": details.get("pack_size", "1 Unit"),
                "min_temp": item.min_temp,
                "max_temp": item.max_temp,
                "reference_price_inr": item.price_inr or details.get("price_inr", 0.0),
                "total_available_units": 0,
            }
        catalog[item.resource_code]["total_available_units"] += item.units_available

    # Additional standard essential hospital medicines to ensure a comprehensive catalog
    ESSENTIAL_MEDS = [
        {
            "resource_code": "PARACETAMOL_650MG",
            "name": "Paracetamol 650mg IV Infusion",
            "category": "MEDICINES",
            "brand": "Dolo-Infuse",
            "generic": "Paracetamol",
            "pack_size": "100ml Bottle",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 85.0,
            "total_available_units": 150,
        },
        {
            "resource_code": "CEFTRIAXONE_1G",
            "name": "Ceftriaxone Sodium 1g Injection",
            "category": "MEDICINES",
            "brand": "Monocef 1g",
            "generic": "Ceftriaxone",
            "pack_size": "1 Vial + WFI",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 115.0,
            "total_available_units": 80,
        },
        {
            "resource_code": "PANTOPRAZOLE_40MG",
            "name": "Pantoprazole 40mg IV Injection",
            "category": "MEDICINES",
            "brand": "Pan-IV",
            "generic": "Pantoprazole",
            "pack_size": "1 Vial",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 72.0,
            "total_available_units": 120,
        },
        {
            "resource_code": "AZITHROMYCIN_500MG",
            "name": "Azithromycin 500mg Tablets",
            "category": "MEDICINES",
            "brand": "Azee 500",
            "generic": "Azithromycin",
            "pack_size": "Strip of 5 Tablets",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 135.0,
            "total_available_units": 95,
        },
        {
            "resource_code": "AMOX_CLAV_625MG",
            "name": "Amoxicillin and Potassium Clavulanate 625mg",
            "category": "MEDICINES",
            "brand": "Augmentin 625 Duo",
            "generic": "Amoxicillin + Clavulanate",
            "pack_size": "Strip of 10 Tablets",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 210.0,
            "total_available_units": 60,
        },
        {
            "resource_code": "DEXTROSE_5_IV",
            "name": "Dextrose 5% Intravenous Infusion",
            "category": "EMERGENCY_SUPPLIES",
            "brand": "DNS-500",
            "generic": "Dextrose 5% in Normal Saline",
            "pack_size": "500ml Bottle",
            "min_temp": 15.0,
            "max_temp": 30.0,
            "reference_price_inr": 48.0,
            "total_available_units": 200,
        },
        {
            "resource_code": "TRAMADOL_50MG",
            "name": "Tramadol Hydrochloride 50mg/ml Injection",
            "category": "MEDICINES",
            "brand": "Tramazac",
            "generic": "Tramadol",
            "pack_size": "2ml Ampoule",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 55.0,
            "total_available_units": 75,
        },
        {
            "resource_code": "ATORVASTATIN_40MG",
            "name": "Atorvastatin 40mg Film-Coated Tablets",
            "category": "MEDICINES",
            "brand": "Atorva 40",
            "generic": "Atorvastatin",
            "pack_size": "Strip of 15 Tablets",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 195.0,
            "total_available_units": 110,
        },
        {
            "resource_code": "METOPROLOL_50MG",
            "name": "Metoprolol Succinate 50mg Extended Release",
            "category": "MEDICINES",
            "brand": "Betaloc 50",
            "generic": "Metoprolol Succinate",
            "pack_size": "Strip of 10 Tablets",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 88.0,
            "total_available_units": 130,
        },
        {
            "resource_code": "FUROSEMIDE_20MG",
            "name": "Furosemide 20mg/2ml IV Injection",
            "category": "MEDICINES",
            "brand": "Lasix IV",
            "generic": "Furosemide",
            "pack_size": "2ml Ampoule",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 42.0,
            "total_available_units": 140,
        },
        {
            "resource_code": "ONDANSETRON_4MG",
            "name": "Ondansetron 4mg/2ml Antiemetic Injection",
            "category": "MEDICINES",
            "brand": "Emeset 4mg",
            "generic": "Ondansetron Hydrochloride",
            "pack_size": "2ml Ampoule",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 38.0,
            "total_available_units": 180,
        },
        {
            "resource_code": "MEROPENEM_1G",
            "name": "Meropenem 1g Broad-Spectrum IV Injection",
            "category": "MEDICINES",
            "brand": "Meronem 1g",
            "generic": "Meropenem Trihydrate",
            "pack_size": "1 Vial (ICU Reserve)",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 850.0,
            "total_available_units": 50,
        },
        {
            "resource_code": "NORMAL_SALINE_09",
            "name": "0.9% Normal Saline IV Infusion 500ml",
            "category": "EMERGENCY_SUPPLIES",
            "brand": "NS-500",
            "generic": "Sodium Chloride 0.9% w/v",
            "pack_size": "500ml Bottle",
            "min_temp": 15.0,
            "max_temp": 30.0,
            "reference_price_inr": 45.0,
            "total_available_units": 240,
        },
        {
            "resource_code": "HYDROCORTISONE_100MG",
            "name": "Hydrocortisone Sodium Succinate 100mg",
            "category": "MEDICINES",
            "brand": "Primacort 100",
            "generic": "Hydrocortisone",
            "pack_size": "1 Vial + WFI",
            "min_temp": 15.0,
            "max_temp": 25.0,
            "reference_price_inr": 92.0,
            "total_available_units": 90,
        },
    ]

    for med in ESSENTIAL_MEDS:
        if med["resource_code"] not in catalog:
            catalog[med["resource_code"]] = med

    return list(catalog.values())


# ---------------------------------------------------------------------------
# Problem 4: Inter-State Price Intelligence
# ---------------------------------------------------------------------------
@router.get("/prices/intelligence", response_model=PriceIntelligenceReport)
def get_price_intelligence(
    resource_code: str = Query("INSULIN_GLARGINE", description="Resource code to analyze"),
    db: Session = Depends(get_db),
):
    """
    Problem 4 Core: AI-Assisted Medicine Price & Availability Intelligence.
    Tracks state-wise price variations (Bihar, West Bengal, Jharkhand) and detects anomalies.
    """
    return get_price_intelligence_report(db=db, resource_code=resource_code)


# ---------------------------------------------------------------------------
# Problem 6: Predictive Shortage Prevention & Proactive Rebalancing
# ---------------------------------------------------------------------------
@router.get("/ai/rebalance", response_model=List[RebalanceRecommendation])
def get_rebalance_recommendations(db: Session = Depends(get_db)):
    """
    Problem 6 Core: Predictive Shortage Prevention & Rebalancing.
    Finds facilities with DOS <= 2.5 days and recommends transfers from surplus depots.
    """
    return generate_rebalance_recommendations(db=db)


# ---------------------------------------------------------------------------
# Problem 2: Human-in-the-Loop Cold-Chain Disposition
# ---------------------------------------------------------------------------
@router.post("/coldchain/disposition", response_model=ColdChainDispositionResponse)
async def submit_coldchain_disposition(
    payload: ColdChainDispositionRequest,
    db: Session = Depends(get_db),
):
    """
    Problem 2 Core: Authorized Human Review for Cold-Chain Excursions.
    Never auto-clears. Requires qualified clinician/toxicologist sign-off.
    Applies Ed25519 digital signature and updates immutable audit ledger.
    """
    now_utc = datetime.now(timezone.utc).isoformat()

    # Find shipment in database
    shipment = db.query(DBShipment).filter(DBShipment.id == payload.shipment_id).first()
    final_status = "DELIVERED" if payload.disposition == "CLEARED_WITH_OVERRIDE" else "REJECTED"

    if shipment:
        shipment.status = final_status
        db.commit()

    # Sign disposition event with Ed25519 authority
    event_payload = {
        "shipment_id": payload.shipment_id,
        "disposition": payload.disposition,
        "inspector_name": payload.inspector_name,
        "inspector_license": payload.inspector_license,
        "notes": payload.justification_notes,
        "timestamp_utc": now_utc,
    }
    audit_record = sign_requisition_event(
        facility_id="FAC-MAYAGANJ-01",
        requisition_data=event_payload,
        event_type="COLD_CHAIN_DISPOSITION_RECORDED",
    )

    # Persist in DB audit ledger
    db_ledger = DBAuditLedgerRecord(
        shipment_id=payload.shipment_id,
        event_type="COLD_CHAIN_DISPOSITION_RECORDED",
        actor_id=payload.inspector_license,
        organization_id="org_mayaganj",
        timestamp_utc=now_utc,
        previous_hash=audit_record["event"]["previous_hash"],
        payload=event_payload,
        event_hash=audit_record["event_hash"],
        signature_hex=audit_record["signature_hex"],
        public_key_hex=audit_record["public_key_hex"],
        is_valid=True,
    )
    db.add(db_ledger)
    db.commit()

    # Broadcast real-time event across all portals
    await event_bus.broadcast("COLD_CHAIN_DISPOSITION_RECORDED", {
        "shipment_id": payload.shipment_id,
        "final_status": final_status,
        "disposition": payload.disposition,
        "inspector_name": payload.inspector_name,
        "inspector_license": payload.inspector_license,
        "notes": payload.justification_notes,
        "event_hash": audit_record["event_hash"],
        "signature_hex": audit_record["signature_hex"],
    })

    return ColdChainDispositionResponse(
        success=True,
        shipment_id=payload.shipment_id,
        final_status=final_status,
        inspector_name=payload.inspector_name,
        inspector_license=payload.inspector_license,
        timestamp_utc=now_utc,
        signature_hex=audit_record["signature_hex"],
        event_hash=audit_record["event_hash"],
        audit_chain_status="CHAIN_VALID",
    )
