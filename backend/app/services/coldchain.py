from typing import Tuple, Optional
from datetime import datetime, timezone
from backend.app.schemas.core import ShipmentStatus

MIN_SAFE_TEMP_C = 2.0
MAX_SAFE_TEMP_C = 8.0

def evaluate_temperature_reading(
    temp_c: float,
    min_safe: float = MIN_SAFE_TEMP_C,
    max_safe: float = MAX_SAFE_TEMP_C
) -> Tuple[bool, Optional[str]]:
    """
    Returns (is_excursion, excursion_detail_message)
    """
    if temp_c < min_safe:
        return True, f"SUB-COOLING EXCURSION: Temperature {temp_c:.1f}°C dropped below threshold {min_safe:.1f}°C"
    elif temp_c > max_safe:
        return True, f"THERMAL SPIKE EXCURSION: Temperature {temp_c:.1f}°C exceeded threshold {max_safe:.1f}°C"
    return False, None

def determine_shipment_status_on_telemetry(
    current_status: ShipmentStatus,
    is_excursion: bool
) -> ShipmentStatus:
    """
    If excursion occurs, transition to UNDER_REVIEW immediately.
    Once UNDER_REVIEW, it CANNOT be auto-cleared back to IN_TRANSIT.
    """
    if is_excursion:
        return ShipmentStatus.UNDER_REVIEW
    if current_status == ShipmentStatus.UNDER_REVIEW:
        return ShipmentStatus.UNDER_REVIEW
    return current_status

