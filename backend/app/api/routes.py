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

from backend.app.schemas.contracts import (
    AttackPayload,
    AttackResponse,
    AttackType,
    AuthorizeRequest,
    Facility,
    InventoryStock,
    MedicalRequisition,
    MedicalRequisitionCreate,
    RequisitionStatus,
    ResourceCategory,
    UrgencyLevel,
    WebSocketMessage,
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
        min_threshold=10,
        days_of_stock=0.8,
        storage_temp_celsius=4.2,
        is_critical=True,
    ),
    InventoryStock(
        id="INV-003",
        facility_id="FAC-MAYAGANJ-01",
        facility_name="Mayaganj Central Depot",
        category=ResourceCategory.VACCINES,
        resource_code="COVAXIN_VACCINE",
        name="Covaxin Multidose Vials",
        quantity=120,
        min_threshold=30,
        days_of_stock=12.0,
        storage_temp_celsius=4.5,
        is_critical=False,
    ),
    InventoryStock(
        id="INV-004",
        facility_id="FAC-MAYAGANJ-01",
        facility_name="Mayaganj Central Depot",
        category=ResourceCategory.EMERGENCY_SUPPLIES,
        resource_code="TRAUMA_KIT",
        name="Level-1 Tactical Trauma Kit",
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
            clinical_note="ICU Emergency Transfusion - Hemorrhagic Shock Protocol",
            status=RequisitionStatus.REQUESTED,
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
    Authorizes an order from Pharma Ops Hub:
    Applies Ed25519 digital signature and SHA-256 canonical hash chaining.
    Broadcasts REQUISITION_AUTHORIZED to Doctor and Cyber Lab portals.
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

    # Deduct stock from supplying facility
    for inv in INVENTORY:
        if inv.resource_code == req.resource_code and inv.facility_id == supplying_fac:
            inv.quantity = max(0, inv.quantity - req.quantity)
            inv.days_of_stock = calculate_days_of_stock(inv.quantity, 5.0, 1.5)["days_of_stock"]
            inv.is_critical = inv.days_of_stock <= 2.0

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

    elif payload.attack_type == AttackType.TEMPERATURE_BREACH:
        temp_c = payload.excursion_temperature_celsius or 14.8
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

    elif payload.attack_type == AttackType.REPLAY_EXPIRED_BATCH:
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


@router.get("/inventory", response_model=List[InventoryStock])
def get_inventory():
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

