from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from backend.app.schemas.core import ShipmentStatus

class SensorTelemetry(BaseModel):
    shipment_id: str
    temperature_c: float
    humidity_percent: Optional[float] = 50.0
    latitude: float = 25.2445
    longitude: float = 87.0125
    timestamp_utc: Optional[str] = None
    is_excursion: bool = False
    battery_level: Optional[float] = 98.0

# Synonym alias matching earlier contract
TelemetryPayload = SensorTelemetry

class TelemetryRecordResponse(SensorTelemetry):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime

class ShipmentCreate(BaseModel):
    request_id: Optional[str] = None
    sender_id: str
    recipient_id: str
    driver_name: Optional[str] = "Emergency Dispatch Unit"
    min_temp: Optional[float] = 2.0
    max_temp: Optional[float] = 8.0
    requires_cold_chain: bool = True

class CustodyTransferCreate(BaseModel):
    shipment_id: str
    from_actor_id: str
    to_actor_id: str
    transfer_location_lat: float
    transfer_location_lng: float
    notes: Optional[str] = None

class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    request_id: Optional[str] = None
    sender_id: str
    recipient_id: str
    status: ShipmentStatus
    driver_name: str
    current_temp: Optional[float] = None
    min_temp: Optional[float] = 2.0
    max_temp: Optional[float] = 8.0
    requires_cold_chain: bool = True
    latest_lat: Optional[float] = None
    latest_lng: Optional[float] = None
    latest_telemetry_time: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
