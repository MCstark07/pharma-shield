from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict

class CanonicalEvent(BaseModel):
    shipment_id: str
    event_type: str                     # DISPATCHED, CUSTODY_TRANSFERRED, SENSOR_EXCURSION, DELIVERED
    actor_id: str
    organization_id: str
    timestamp_utc: str                  # Strict ISO-8601
    previous_hash: str                  # 64-character SHA-256 hex string
    payload: Dict[str, Any]             # Deterministic JSON payload

# Synonym alias matching GEMINI.md
CanonicalEventPayload = CanonicalEvent

class AuditRecordResponse(BaseModel):
    id: Optional[str] = None
    event: CanonicalEvent
    event_hash: str
    signature_hex: str
    public_key_hex: str
    is_valid: bool

class VerifySignatureRequest(BaseModel):
    public_key_hex: str
    event_hash: str
    signature_hex: str

class VerifySignatureResponse(BaseModel):
    is_valid: bool
    details: str

class TamperSimulationRequest(BaseModel):
    audit_record_id: str
    field_to_modify: str                # e.g., "temperature_c" or "quantity" or "destination"
    tampered_value: Any

class TamperSimulationResponse(BaseModel):
    original_hash: str
    tampered_hash: str
    hashes_match: bool
    signature_verified: bool
    tamper_detected: bool
    diagnostic_message: str

class KeyPairResponse(BaseModel):
    organization_id: str
    public_key_hex: str
    private_key_hex: str
    algorithm: str = "Ed25519"
