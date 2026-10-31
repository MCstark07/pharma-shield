from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from backend.app.schemas.ai import ShortagePrediction

DEFAULT_LEAD_TIME_DAYS = 2.0  # Estimated replenishment lead time in Bhagalpur zone

def calculate_days_of_stock(current_units: int, daily_consumption: float) -> float:
    if daily_consumption <= 0:
        return 999.0
    return round(float(current_units) / float(daily_consumption), 2)

def predict_shortage(
    facility_id: str,
    facility_name: str,
    resource_code: str,
    resource_name: str,
    current_stock: int,
    daily_consumption: float,
    lead_time_days: float = DEFAULT_LEAD_TIME_DAYS
) -> ShortagePrediction:
    dos = calculate_days_of_stock(current_stock, daily_consumption)
    now = datetime.now(timezone.utc)
    
    if dos <= lead_time_days:
        status = "CRITICAL_SHORTAGE_PREDICTED"
        alert_level = "CRITICAL"
    elif dos <= lead_time_days * 1.75:
        status = "LOW_STOCK_WARNING"
        alert_level = "WARNING"
    else:
        status = "NORMAL"
        alert_level = "SAFE"

    exhaustion_date = None
    if daily_consumption > 0 and dos < 365:
        exhaustion_dt = now + timedelta(days=dos)
        exhaustion_date = exhaustion_dt.strftime("%Y-%m-%d %H:%M UTC")

    return ShortagePrediction(
        facility_id=facility_id,
        facility_name=facility_name,
        resource_code=resource_code,
        resource_name=resource_name,
        current_stock=current_stock,
        daily_consumption=round(daily_consumption, 2),
        dos_days=dos,
        lead_time_days=lead_time_days,
        status=status,
        predicted_exhaustion_date=exhaustion_date,
        alert_level=alert_level
    )

