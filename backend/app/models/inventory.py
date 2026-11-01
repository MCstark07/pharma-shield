import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship, synonym
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    # Core required fields: id, facility_id, category [6 categories], resource_code, batch_number, units_available, expiry_date, status, min_temp, max_temp
    id = Column(String(100), primary_key=True, default=generate_uuid)
    facility_id = Column(String(100), ForeignKey("facilities.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # MEDICINES, BLOOD_COMPONENTS, MEDICAL_EQUIPMENT, VACCINES, DIAGNOSTIC_SAMPLES, EMERGENCY_SUPPLIES
    resource_code = Column(String(100), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=False, default="BATCH-DEFAULT")
    units_available = Column(Integer, nullable=False, default=0)
    expiry_date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="AVAILABLE")  # AVAILABLE, QUARANTINED, DEPLETED, RESERVED
    min_temp = Column(Float, nullable=True)
    max_temp = Column(Float, nullable=True)

    # Additional metadata fields for extended domain rules
    details = Column(JSON, nullable=False, default=dict)
    daily_consumption = Column(Float, default=1.0)
    price_inr = Column(Float, nullable=True, default=0.0)
    stock_confidence = Column(String(50), nullable=False, default="CONFIRMED")  # CONFIRMED, LAST_REPORTED, INDICATIVE
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Synonyms for seamless compatibility
    quantity = synonym("units_available")
    batch_id = synonym("batch_number")

    @property
    def is_quarantined(self) -> bool:
        return self.status == "QUARANTINED"

    @is_quarantined.setter
    def is_quarantined(self, val: bool):
        self.status = "QUARANTINED" if val else "AVAILABLE"

    facility = relationship("Facility", back_populates="inventory_items")
