from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.organization import Facility, Organization
from backend.app.models.inventory import InventoryItem
from backend.app.models.requests import MedicalRequest
from backend.app.models.shipments import Shipment
from backend.app.models.ledger import AuditLedgerRecord
from backend.app.schemas.requests import (
    MedicalRequestCreate,
    MedicalRequestResponse,
    AllocationCreate,
    AllocationResponse
)
from backend.app.schemas.core import ResourceCategory, UrgencyLevel, ShipmentStatus
from backend.app.services.crypto import compute_hash, GENESIS_HASH
from backend.app.websockets import manager
from cryptography.hazmat.primitives.asymmetric import ed25519

router = APIRouter(prefix="/requests", tags=["Emergency Requests & Allocations"])

@router.get("", response_model=List[MedicalRequestResponse])
def list_emergency_requests(
    status: Optional[str] = None,
    facility_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MedicalRequest)
    if status:
        query = query.filter(MedicalRequest.status == status)
    if facility_id:
        query = query.filter(MedicalRequest.requesting_facility_id == facility_id)
    return query.order_by(MedicalRequest.created_at.desc()).all()

@router.post("", response_model=MedicalRequestResponse)
async def create_emergency_request(payload: MedicalRequestCreate, db: Session = Depends(get_db)):
    req_facility = db.query(Facility).filter(Facility.id == payload.requesting_facility_id).first()
    if not req_facility:
        raise HTTPException(status_code=404, detail="Requesting facility not found")

    new_req = MedicalRequest(
        requesting_facility_id=payload.requesting_facility_id,
        category=payload.category.value,
        resource_code=payload.resource_code,
        quantity=payload.quantity,
        urgency=payload.urgency.value,
        required_by=payload.required_by or datetime.now(timezone.utc),
        clinical_note_redacted=payload.clinical_note_redacted,
        status="OPEN"
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    await manager.broadcast_event("NEW_EMERGENCY_REQUEST", {
        "request_id": new_req.id,
        "facility_name": req_facility.name,
        "category": new_req.category,
        "resource_code": new_req.resource_code,
        "quantity": new_req.quantity,
        "urgency": new_req.urgency
    })

    return new_req

@router.post("/allocate", response_model=AllocationResponse)
async def allocate_resource(payload: AllocationCreate, db: Session = Depends(get_db)):
    # Concurrency safe allocation using SELECT ... FOR UPDATE
    emergency_req = db.query(MedicalRequest).filter(MedicalRequest.id == payload.request_id).first()
    if not emergency_req:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    if emergency_req.status in ["ALLOCATED", "FULFILLED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail=f"Request is already in {emergency_req.status} status")

    fulfilling_fac = db.query(Facility).filter(Facility.id == payload.fulfilling_facility_id).first()
    if not fulfilling_fac:
        raise HTTPException(status_code=404, detail="Fulfilling facility not found")

    # Lock inventory row with FOR UPDATE
    inv_item = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.facility_id == payload.fulfilling_facility_id,
            InventoryItem.resource_code == emergency_req.resource_code
        )
        .with_for_update()
        .first()
    )

    if not inv_item:
        raise HTTPException(status_code=404, detail="Resource not found at fulfilling facility")

    if inv_item.status == "QUARANTINED":
        raise HTTPException(status_code=400, detail="Resource is currently quarantined and cannot be allocated")

    if inv_item.units_available < payload.allocated_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory: requested {payload.allocated_quantity}, available {inv_item.units_available}"
        )

    # 1. Atomic inventory deduction
    inv_item.units_available -= payload.allocated_quantity

    # 2. Update Emergency Request status
    emergency_req.status = "ALLOCATED"

    # 3. Create Shipment record
    driver_tag = f"AMBULANCE_DISPATCH_{fulfilling_fac.name[:6].upper().replace(' ', '_')}"
    shipment = Shipment(
        request_id=emergency_req.id,
        sender_id=payload.fulfilling_facility_id,
        recipient_id=emergency_req.requesting_facility_id,
        driver_name=driver_tag,
        status=ShipmentStatus.ALLOCATED.value,
        requires_cold_chain=payload.cold_chain_required or (emergency_req.category == ResourceCategory.VACCINES.value),
        min_temp=2.0 if payload.cold_chain_required else None,
        max_temp=8.0 if payload.cold_chain_required else None,
        current_temp=4.0 if payload.cold_chain_required else None,
        latest_lat=fulfilling_fac.lat,
        latest_lng=fulfilling_fac.lng,
        latest_telemetry_time=datetime.now(timezone.utc)
    )
    db.add(shipment)
    db.flush()

    # 4. Append Canonical Cryptographic Ledger Record
    last_record = db.query(AuditLedgerRecord).order_by(AuditLedgerRecord.created_at.desc()).first()
    prev_hash = last_record.event_hash if last_record else GENESIS_HASH

    now_iso = datetime.now(timezone.utc).isoformat()
    canonical_payload = {
        "shipment_id": shipment.id,
        "request_id": emergency_req.id,
        "allocated_quantity": payload.allocated_quantity,
        "resource_code": emergency_req.resource_code,
        "origin_facility": fulfilling_fac.name,
        "destination_facility_id": emergency_req.requesting_facility_id,
        "cold_chain_required": shipment.requires_cold_chain
    }

    event_hash = compute_hash(prev_hash, canonical_payload)
    demo_priv = ed25519.Ed25519PrivateKey.generate()
    sig_hex = demo_priv.sign(event_hash.encode('utf-8')).hex()
    demo_pub_hex = demo_priv.public_key().public_bytes_raw().hex()

    ledger_entry = AuditLedgerRecord(
        shipment_id=shipment.id,
        event_type="DISPATCHED",
        actor_id=shipment.driver_name,
        organization_id=fulfilling_fac.organization_id or "DISPATCH_ORG",
        timestamp_utc=now_iso,
        previous_hash=prev_hash,
        payload=canonical_payload,
        event_hash=event_hash,
        signature_hex=sig_hex,
        public_key_hex=demo_pub_hex,
        is_valid=True
    )
    db.add(ledger_entry)

    db.commit()

    allocation_resp = AllocationResponse(
        id=shipment.id,
        request_id=emergency_req.id,
        fulfilling_facility_id=payload.fulfilling_facility_id,
        allocated_quantity=payload.allocated_quantity,
        transport_mode=payload.transport_mode,
        cold_chain_required=payload.cold_chain_required,
        status="CONFIRMED",
        created_at=datetime.now(timezone.utc)
    )

    await manager.broadcast_event("RESOURCE_ALLOCATED", {
        "allocation_id": allocation_resp.id,
        "shipment_id": shipment.id,
        "request_id": emergency_req.id,
        "quantity": payload.allocated_quantity,
        "origin": fulfilling_fac.name
    })

    return allocation_resp
