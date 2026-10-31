import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Text
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class AuditLedgerRecord(Base):
    __tablename__ = "audit_ledger_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    shipment_id = Column(String(255), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # DISPATCHED, CUSTODY_TRANSFERRED, SENSOR_EXCURSION, DELIVERED
    actor_id = Column(String(255), nullable=False)
    organization_id = Column(String(255), nullable=False)
    timestamp_utc = Column(String(100), nullable=False)
    previous_hash = Column(String(64), nullable=False)
    payload = Column(JSON, nullable=False)
    event_hash = Column(String(64), nullable=False, index=True)
    signature_hex = Column(String(256), nullable=False)
    public_key_hex = Column(String(128), nullable=False)
    is_valid = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

