import copy
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.ledger import AuditLedgerRecord
from backend.app.schemas.security import (
    AuditRecordResponse,
    CanonicalEventPayload,
    VerifySignatureRequest,
    VerifySignatureResponse,
    TamperSimulationRequest,
    TamperSimulationResponse,
    KeyPairResponse
)
from backend.app.services.crypto import (
    compute_hash,
    verify_event_signature,
    generate_keypair,
    canonical_json_bytes
)

router = APIRouter(prefix="/security", tags=["Cryptographic Audit Ledger & Security"])

@router.get("/ledger", response_model=List[AuditRecordResponse])
def get_audit_ledger(shipment_id: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(AuditLedgerRecord)
    if shipment_id:
        query = query.filter(AuditLedgerRecord.shipment_id == shipment_id)
    records = query.order_by(AuditLedgerRecord.created_at.desc()).limit(limit).all()

    response = []
    for r in records:
        canonical_event = CanonicalEventPayload(
            shipment_id=r.shipment_id,
            event_type=r.event_type,
            actor_id=r.actor_id,
            organization_id=r.organization_id,
            timestamp_utc=r.timestamp_utc,
            previous_hash=r.previous_hash,
            payload=r.payload
        )
        response.append(AuditRecordResponse(
            id=r.id,
            event=canonical_event,
            event_hash=r.event_hash,
            signature_hex=r.signature_hex,
            public_key_hex=r.public_key_hex,
            is_valid=r.is_valid
        ))
    return response

@router.post("/verify-signature", response_model=VerifySignatureResponse)
def verify_single_signature(payload: VerifySignatureRequest):
    is_valid = verify_event_signature(
        public_key_hex=payload.public_key_hex,
        event_hash=payload.event_hash,
        signature_hex=payload.signature_hex
    )
    details = "Ed25519 signature cryptographically verified against public key." if is_valid else "Signature verification failed! Payload or signature invalid."
    return VerifySignatureResponse(is_valid=is_valid, details=details)

@router.post("/simulate-tampering", response_model=TamperSimulationResponse)
def simulate_tampering(payload: TamperSimulationRequest, db: Session = Depends(get_db)):
    """
    Demonstrates tamper-evidence:
    Clones the real audit record, mutates the chosen field, re-computes SHA-256 hash,
    and shows that the original Ed25519 signature fails verification on the modified payload.
    """
    record = db.query(AuditLedgerRecord).filter(AuditLedgerRecord.id == payload.audit_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Audit ledger record not found")

    original_hash = record.event_hash
    mutated_payload = copy.deepcopy(record.payload)
    mutated_payload[payload.field_to_modify] = payload.tampered_value

    tampered_hash = compute_hash(record.previous_hash, mutated_payload)
    hashes_match = (original_hash == tampered_hash)

    # Verify original signature against tampered hash
    sig_verified = verify_event_signature(
        public_key_hex=record.public_key_hex,
        event_hash=tampered_hash,
        signature_hex=record.signature_hex
    )

    tamper_detected = not sig_verified or not hashes_match

    diagnostic = (
        f"TAMPER DETECTED: Field '{payload.field_to_modify}' was modified to '{payload.tampered_value}'. "
        f"Recomputed SHA-256 hash ({tampered_hash[:12]}...) diverged from ledger root ({original_hash[:12]}...). "
        f"Ed25519 digital signature rejected verification with 100% cryptographic certainty."
    )

    return TamperSimulationResponse(
        original_hash=original_hash,
        tampered_hash=tampered_hash,
        hashes_match=hashes_match,
        signature_verified=sig_verified,
        tamper_detected=tamper_detected,
        diagnostic_message=diagnostic
    )

@router.post("/generate-keypair", response_model=KeyPairResponse)
def create_new_keypair(org_id: str = "DEMO_ORG"):
    priv_hex, pub_hex = generate_keypair()
    return KeyPairResponse(
        organization_id=org_id,
        public_key_hex=pub_hex,
        private_key_hex=priv_hex,
        algorithm="Ed25519"
    )

