import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, synonym
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Shipment(Base):
    __tablename__ = "shipments"

    # Core required fields: id, request_id, sender_id, recipient_id, status, driver_name, current_temp, created_at
    id = Column(String(100), primary_key=True, default=generate_uuid)
    request_id = Column(String(100), ForeignKey("emergency_requests.id"), nullable=True, index=True)
    sender_id = Column(String(100), ForeignKey("facilities.id"), nullable=False, index=True)
    recipient_id = Column(String(100), ForeignKey("facilities.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="ALLOCATED")  # PENDING, ALLOCATED, DISPATCHED, IN_TRANSIT, UNDER_REVIEW, DELIVERED, REJECTED
    driver_name = Column(String(255), nullable=False, default="Emergency Logistics Dispatch Unit")
    current_temp = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    # Temperature threshold constraints & GPS
    min_temp = Column(Float, default=2.0)
    max_temp = Column(Float, default=8.0)
    requires_cold_chain = Column(Boolean, default=True)
    latest_lat = Column(Float, nullable=True)
    latest_lng = Column(Float, nullable=True)
    latest_telemetry_time = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Synonyms for seamless cross-contract usage
    origin_facility_id = synonym("sender_id")
    destination_facility_id = synonym("recipient_id")
    carrier_actor_id = synonym("driver_name")
    current_temp_c = synonym("current_temp")
    min_temp_c = synonym("min_temp")
    max_temp_c = synonym("max_temp")

    request = relationship("MedicalRequest", back_populates="shipments")
    sender_facility = relationship("Facility", foreign_keys=[sender_id])
    recipient_facility = relationship("Facility", foreign_keys=[recipient_id])
    telemetry_records = relationship("TelemetryRecord", back_populates="shipment", cascade="all, delete-orphan")

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(String(100), primary_key=True, default=generate_uuid)
    shipment_id = Column(String(100), ForeignKey("shipments.id"), nullable=False, index=True)
    temperature_c = Column(Float, nullable=False)
    humidity_percent = Column(Float, default=50.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp_utc = Column(String(100), nullable=False)
    is_excursion = Column(Boolean, default=False)
    battery_level = Column(Float, default=98.0)
    created_at = Column(DateTime, default=utc_now)

    shipment = relationship("Shipment", back_populates="telemetry_records")

