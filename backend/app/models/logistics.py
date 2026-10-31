from backend.app.models.requests import MedicalRequest, EmergencyRequest
from backend.app.models.shipments import Shipment, TelemetryRecord

# Re-exports for clean modular access
__all__ = ["MedicalRequest", "EmergencyRequest", "Shipment", "TelemetryRecord"]
