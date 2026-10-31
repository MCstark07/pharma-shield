import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class MedicalRequest(Base):
    __tablename__ = "emergency_requests"

    # Core required fields: id, requesting_facility_id, category, resource_code, quantity, urgency, status, created_at
    id = Column(String(100), primary_key=True, default=generate_uuid)
    requesting_facility_id = Column(String(100), ForeignKey("facilities.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    resource_code = Column(String(100), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    urgency = Column(String(50), nullable=False, default="STANDARD")  # LOW, STANDARD, URGENT, CRITICAL
    status = Column(String(50), nullable=False, default="OPEN")  # OPEN, ALLOCATED, DISPATCHED, DELIVERED, CANCELLED
    created_at = Column(DateTime, default=utc_now)

    # Optional clinical context & timestamp
    required_by = Column(DateTime, nullable=True)
    clinical_note_redacted = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    requesting_facility = relationship("Facility", back_populates="requests")
    shipments = relationship("Shipment", back_populates="request", cascade="all, delete-orphan")

# Alias for backward-compatibility
EmergencyRequest = MedicalRequest

