import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, synonym
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(100), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    org_type = Column(String(50), nullable=False, default="HOSPITAL_NETWORK")  # HOSPITAL_NETWORK, BLOOD_COUNCIL, HEALTH_DEPT, LOGISTICS
    public_key_hex = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    facilities = relationship("Facility", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class Facility(Base):
    __tablename__ = "facilities"

    # Core required fields: id, name, type, lat, lng, contact, is_verified
    id = Column(String(100), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    organization_id = Column(String(100), ForeignKey("organizations.id"), nullable=True)
    type = Column(String(50), nullable=False, default="HOSPITAL")  # HOSPITAL, BLOOD_BANK, WAREHOUSE, LAB
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    contact = Column(String(100), nullable=False, default="+91-641-2401078")
    is_verified = Column(Boolean, default=True)

    # Compatible aliases / helpers
    city = Column(String(100), default="Bhagalpur")
    state = Column(String(100), default="Bihar")
    district = Column(String(100), default="Bhagalpur")
    reliability_score = Column(Float, default=92.0)
    created_at = Column(DateTime, default=utc_now)

    # Synonyms for seamless access across schemas/APIs
    facility_type = synonym("type")
    latitude = synonym("lat")
    longitude = synonym("lng")
    is_active = synonym("is_verified")

    organization = relationship("Organization", back_populates="facilities")
    inventory_items = relationship("InventoryItem", back_populates="facility", cascade="all, delete-orphan")
    requests = relationship("MedicalRequest", back_populates="requesting_facility", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    organization_id = Column(String(100), ForeignKey("organizations.id"), nullable=True)
    facility_id = Column(String(100), ForeignKey("facilities.id"), nullable=True)
    role = Column(String(50), default="OPERATOR")  # ADMIN, CLINICIAN, DISPATCHER, OPERATOR
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    organization = relationship("Organization", back_populates="users")
