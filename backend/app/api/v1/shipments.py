from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.shipments import Shipment, TelemetryRecord
from backend.app.models.organization import Facility
from backend.app.models.ledger import AuditLedgerRecord
from backend.app.schemas.core import ShipmentStatus
from backend.app.schemas.logistics import (
    ShipmentResponse,
    ShipmentCreate,
    SensorTelemetry,
    TelemetryRecordResponse,
    CustodyTransferCreate
)
from backend.app.services.coldchain import evaluate_temperature_reading, determine_shipment_status_on_telemetry
from backend.app.services.crypto import compute_hash, GENESIS_HASH
from backend.app.websockets import manager
from cryptography.hazmat.primitives.asymmetric import ed25519

router = APIRouter(prefix="/shipments", tags=["Logistics & Cold Chain Telemetry"])

@router.get("", response_model=List[ShipmentResponse])
@router.get("/", response_model=List[ShipmentResponse])
def list_shipments(
    status: Optional[ShipmentStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Shipment)
    if status:
        query = query.filter(Shipment.status == status.value)
    return query.order_by(Shipment.created_at.desc()).all()

@router.post("", response_model=ShipmentResponse)
@router.post("/", response_model=ShipmentResponse)
async def create_shipment_dispatch(payload: ShipmentCreate, db: Session = Depends(get_db)):
    sender = db.query(Facility).filter(Facility.id == payload.sender_id).first()
    recipient = db.query(Facility).filter(Facility.id == payload.recipient_id).first()
    if not sender or not recipient:
        raise HTTPException(status_code=404, detail="Sender or Recipient facility not found")

    shipment = Shipment(
        request_id=payload.request_id,
        sender_id=payload.sender_id,
        recipient_id=payload.recipient_id,
        driver_name=payload.driver_name or "Emergency Logistics Driver",
        status=ShipmentStatus.DISPATCHED.value,
        requires_cold_chain=payload.requires_cold_chain,
        min_temp=payload.min_temp if payload.min_temp is not None else 2.0,
        max_temp=payload.max_temp if payload.max_temp is not None else 8.0,
        current_temp=4.0 if payload.requires_cold_chain else None,
        latest_lat=sender.lat,
        latest_lng=sender.lng,
        latest_telemetry_time=datetime.now(timezone.utc)
    )
    db.add(shipment)
    db.flush()

    # Append Dispatched event to cryptographic ledger
    last_rec = db.query(AuditLedgerRecord).order_by(AuditLedgerRecord.created_at.desc()).first()
    prev_hash = last_rec.event_hash if last_rec else GENESIS_HASH

    ledger_payload = {
        "shipment_id": shipment.id,
        "sender": sender.name,
        "recipient": recipient.name,
        "driver_name": shipment.driver_name,
        "requires_cold_chain": shipment.requires_cold_chain,
        "min_temp": shipment.min_temp,
        "max_temp": shipment.max_temp
    }
    event_hash = compute_hash(prev_hash, ledger_payload)

    demo_priv = ed25519.Ed25519PrivateKey.generate()
    sig_hex = demo_priv.sign(event_hash.encode('utf-8')).hex()
    demo_pub_hex = demo_priv.public_key().public_bytes_raw().hex()

    ledger_entry = AuditLedgerRecord(
        shipment_id=shipment.id,
        event_type="DISPATCHED",
        actor_id=shipment.driver_name,
        organization_id=sender.organization_id or "SENDER_ORG",
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
        previous_hash=prev_hash,
        payload=ledger_payload,
        event_hash=event_hash,
        signature_hex=sig_hex,
        public_key_hex=demo_pub_hex,
        is_valid=True
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(shipment)

    await manager.broadcast_event("SHIPMENT_DISPATCHED", {
        "shipment_id": shipment.id,
        "sender": sender.name,
        "recipient": recipient.name,
        "driver_name": shipment.driver_name
    })

    return shipment

@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.get("/{shipment_id}/telemetry", response_model=List[TelemetryRecordResponse])
def get_shipment_telemetry(shipment_id: str, limit: int = 100, db: Session = Depends(get_db)):
    records = (
        db.query(TelemetryRecord)
        .filter(TelemetryRecord.shipment_id == shipment_id)
        .order_by(TelemetryRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return records

@router.post("/{shipment_id}/telemetry", response_model=TelemetryRecordResponse)
async def ingest_shipment_telemetry_by_id(
    shipment_id: str,
    payload: SensorTelemetry,
    db: Session = Depends(get_db)
):
    """
    POST /api/v1/shipments/{id}/telemetry: Ingest sensor temperature.
    Flags EXCURSION and transitions status to UNDER_REVIEW if temp < 2°C or > 8°C.
    """
    payload.shipment_id = shipment_id
    return await process_telemetry_ingestion(shipment_id, payload, db)

@router.post("/telemetry", response_model=TelemetryRecordResponse)
async def ingest_telemetry_generic(payload: SensorTelemetry, db: Session = Depends(get_db)):
    return await process_telemetry_ingestion(payload.shipment_id, payload, db)

async def process_telemetry_ingestion(shipment_id: str, payload: SensorTelemetry, db: Session):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    min_safe = shipment.min_temp if shipment.min_temp is not None else 2.0
    max_safe = shipment.max_temp if shipment.max_temp is not None else 8.0

    # Cold chain excursion check: flag EXCURSION if temp < 2°C or > 8°C
    is_excursion, excursion_detail = evaluate_temperature_reading(
        payload.temperature_c, min_safe, max_safe
    )

    timestamp_str = payload.timestamp_utc or datetime.now(timezone.utc).isoformat()

    record = TelemetryRecord(
        shipment_id=shipment.id,
        temperature_c=payload.temperature_c,
        humidity_percent=payload.humidity_percent or 50.0,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timestamp_utc=timestamp_str,
        is_excursion=is_excursion,
        battery_level=payload.battery_level or 98.0
    )
    db.add(record)

    # Update shipment current state
    shipment.current_temp = payload.temperature_c
    shipment.latest_lat = payload.latitude
    shipment.latest_lng = payload.longitude
    shipment.latest_telemetry_time = datetime.now(timezone.utc)

    # State machine transition
    if is_excursion:
        shipment.status = ShipmentStatus.UNDER_REVIEW.value
        
        # Append SENSOR_EXCURSION event to cryptographic audit ledger
        last_rec = db.query(AuditLedgerRecord).order_by(AuditLedgerRecord.created_at.desc()).first()
        prev_hash = last_rec.event_hash if last_rec else GENESIS_HASH

        ledger_payload = {
            "shipment_id": shipment.id,
            "event": "SENSOR_EXCURSION",
            "temperature_c": payload.temperature_c,
            "min_safe_temp": min_safe,
            "max_safe_temp": max_safe,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "alert": excursion_detail
        }
        event_hash = compute_hash(prev_hash, ledger_payload)
        
        demo_priv = ed25519.Ed25519PrivateKey.generate()
        sig_hex = demo_priv.sign(event_hash.encode('utf-8')).hex()
        demo_pub_hex = demo_priv.public_key().public_bytes_raw().hex()

        ledger_entry = AuditLedgerRecord(
            shipment_id=shipment.id,
            event_type="SENSOR_EXCURSION",
            actor_id=shipment.driver_name,
            organization_id="SYSTEM_MONITOR",
            timestamp_utc=timestamp_str,
            previous_hash=prev_hash,
            payload=ledger_payload,
            event_hash=event_hash,
            signature_hex=sig_hex,
            public_key_hex=demo_pub_hex,
            is_valid=True
        )
        db.add(ledger_entry)

        # Broadcast critical excursion alert
        await manager.broadcast_event("COLD_CHAIN_EXCURSION", {
            "shipment_id": shipment.id,
            "temperature_c": payload.temperature_c,
            "detail": excursion_detail,
            "latitude": payload.latitude,
            "longitude": payload.longitude
        })
    elif shipment.status in [ShipmentStatus.ALLOCATED.value, ShipmentStatus.DISPATCHED.value]:
        shipment.status = ShipmentStatus.IN_TRANSIT.value

    db.commit()
    db.refresh(record)

    await manager.broadcast_event("TELEMETRY_RECEIVED", {
        "shipment_id": record.shipment_id,
        "temperature_c": record.temperature_c,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "is_excursion": record.is_excursion,
        "status": shipment.status
    })

    return record

@router.post("/custody-transfer", response_model=ShipmentResponse)
async def transfer_custody(payload: CustodyTransferCreate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == payload.shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    shipment.driver_name = payload.to_actor_id
    shipment.latest_lat = payload.transfer_location_lat
    shipment.latest_lng = payload.transfer_location_lng
    shipment.status = ShipmentStatus.IN_TRANSIT.value

    last_rec = db.query(AuditLedgerRecord).order_by(AuditLedgerRecord.created_at.desc()).first()
    prev_hash = last_rec.event_hash if last_rec else GENESIS_HASH

    transfer_data = {
        "shipment_id": shipment.id,
        "from_actor": payload.from_actor_id,
        "to_actor": payload.to_actor_id,
        "lat": payload.transfer_location_lat,
        "lng": payload.transfer_location_lng,
        "notes": payload.notes
    }
    event_hash = compute_hash(prev_hash, transfer_data)

    demo_priv = ed25519.Ed25519PrivateKey.generate()
    sig_hex = demo_priv.sign(event_hash.encode('utf-8')).hex()
    demo_pub_hex = demo_priv.public_key().public_bytes_raw().hex()

    ledger_entry = AuditLedgerRecord(
        shipment_id=shipment.id,
        event_type="CUSTODY_TRANSFERRED",
        actor_id=payload.to_actor_id,
        organization_id="LOGISTICS_DISPATCH",
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
        previous_hash=prev_hash,
        payload=transfer_data,
        event_hash=event_hash,
        signature_hex=sig_hex,
        public_key_hex=demo_pub_hex,
        is_valid=True
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(shipment)

    await manager.broadcast_event("CUSTODY_TRANSFERRED", {
        "shipment_id": shipment.id,
        "new_carrier": payload.to_actor_id,
        "lat": payload.transfer_location_lat,
        "lng": payload.transfer_location_lng
    })

    return shipment

@router.post("/{shipment_id}/deliver", response_model=ShipmentResponse)
async def confirm_delivery(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    if shipment.status == ShipmentStatus.UNDER_REVIEW.value:
        raise HTTPException(
            status_code=400,
            detail="Shipment is UNDER REVIEW due to cold-chain excursion and cannot be delivered without QA clearance"
        )

    shipment.status = ShipmentStatus.DELIVERED.value

    last_rec = db.query(AuditLedgerRecord).order_by(AuditLedgerRecord.created_at.desc()).first()
    prev_hash = last_rec.event_hash if last_rec else GENESIS_HASH

    delivery_data = {
        "shipment_id": shipment.id,
        "delivered_at": datetime.now(timezone.utc).isoformat(),
        "final_status": "DELIVERED"
    }
    event_hash = compute_hash(prev_hash, delivery_data)

    demo_priv = ed25519.Ed25519PrivateKey.generate()
    sig_hex = demo_priv.sign(event_hash.encode('utf-8')).hex()
    demo_pub_hex = demo_priv.public_key().public_bytes_raw().hex()

    ledger_entry = AuditLedgerRecord(
        shipment_id=shipment.id,
        event_type="DELIVERED",
        actor_id=shipment.driver_name,
        organization_id="RECEIVING_FACILITY",
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
        previous_hash=prev_hash,
        payload=delivery_data,
        event_hash=event_hash,
        signature_hex=sig_hex,
        public_key_hex=demo_pub_hex,
        is_valid=True
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(shipment)

    await manager.broadcast_event("SHIPMENT_DELIVERED", {
        "shipment_id": shipment.id,
        "destination_facility_id": shipment.recipient_id
    })

    return shipment
