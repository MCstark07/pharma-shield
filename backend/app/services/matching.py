import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from backend.app.schemas.core import ResourceCategory, UrgencyLevel
from backend.app.schemas.ai import CandidateMatch

BLOOD_COMPATIBILITY_RBC: Dict[str, List[str]] = {
    # Donor -> List of compatible recipients
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"]
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Great Circle distance between two coordinates in kilometers."""
    R = 6371.0  # Earth's mean radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def is_blood_compatible(donor_blood: str, recipient_blood: str) -> bool:
    donor = donor_blood.strip().upper()
    recipient = recipient_blood.strip().upper()
    allowed = BLOOD_COMPATIBILITY_RBC.get(donor, [])
    return recipient in allowed

def get_urgency_score(urgency: UrgencyLevel) -> float:
    scores = {
        UrgencyLevel.CRITICAL: 100.0,
        UrgencyLevel.URGENT: 85.0,
        UrgencyLevel.STANDARD: 70.0,
        UrgencyLevel.LOW: 50.0,
    }
    return scores.get(urgency, 70.0)

def evaluate_candidate(
    req_facility_lat: float,
    req_facility_lon: float,
    candidate_facility: Any,  # Facility model or dict
    candidate_item: Any,      # InventoryItem model or dict
    category: ResourceCategory,
    requested_code: str,
    requested_units: int,
    urgency: UrgencyLevel,
    vehicle_has_cold_chain: bool = True
) -> CandidateMatch:
    """
    Applies Hard Safety Filters, computes 5-factor score if eligible,
    and returns CandidateMatch.
    """
    now = datetime.now(timezone.utc)
    dist_km = haversine_distance_km(
        req_facility_lat, req_facility_lon,
        candidate_facility.latitude, candidate_facility.longitude
    )
    
    details = candidate_item.details if hasattr(candidate_item, "details") else candidate_item.get("details", {})
    available_units = candidate_item.quantity if hasattr(candidate_item, "quantity") else candidate_item.get("quantity", 0)
    is_quarantined = candidate_item.is_quarantined if hasattr(candidate_item, "is_quarantined") else candidate_item.get("is_quarantined", False)
    reliability = candidate_facility.reliability_score if hasattr(candidate_facility, "reliability_score") else candidate_facility.get("reliability_score", 90.0)

    # 1. HARD SAFETY FILTERS
    disqualification_reason: Optional[str] = None
    is_eligible = True

    if is_quarantined:
        is_eligible = False
        disqualification_reason = "DISQUALIFIED: Stock Quarantined"
    elif available_units < requested_units:
        is_eligible = False
        disqualification_reason = "DISQUALIFIED: Insufficient Units"
    elif category == ResourceCategory.MEDICINES:
        expiry_raw = details.get("expiry_date")
        if expiry_raw:
            if isinstance(expiry_raw, str):
                expiry_dt = datetime.fromisoformat(expiry_raw.replace("Z", "+00:00"))
            else:
                expiry_dt = expiry_raw
            if expiry_dt.tzinfo is None:
                expiry_dt = expiry_dt.replace(tzinfo=timezone.utc)
            if expiry_dt <= now:
                is_eligible = False
                disqualification_reason = "DISQUALIFIED: Expired Batch"
        if details.get("recall_status") is True:
            is_eligible = False
            disqualification_reason = "DISQUALIFIED: Recall Notice Active"
    elif category == ResourceCategory.BLOOD_COMPONENTS:
        donor_blood = details.get("blood_group")
        # requested_code might be like "O_POS_RBC" or "O+"
        target_group = requested_code.replace("_POS", "+").replace("_NEG", "-").split("_")[0]
        if donor_blood and not is_blood_compatible(donor_blood, target_group):
            is_eligible = False
            disqualification_reason = f"DISQUALIFIED: Blood Incompatibility ({donor_blood} cannot donate to {target_group})"
    elif category == ResourceCategory.MEDICAL_EQUIPMENT:
        if details.get("calibration_valid") is False:
            is_eligible = False
            disqualification_reason = "DISQUALIFIED: Calibration Invalid"
    elif category == ResourceCategory.DIAGNOSTIC_SAMPLES:
        max_transit_hours = details.get("max_transit_hours", 4.0)
        # Average transport speed 40 km/h in urban/suburban Bhagalpur
        travel_hours = dist_km / 40.0
        if travel_hours > max_transit_hours:
            is_eligible = False
            disqualification_reason = "DISQUALIFIED: Transit exceeds sample viability"

    # 2. 5-FACTOR SCORING FOR ELIGIBLE CANDIDATES
    # Score = 0.30*U + 0.25*A + 0.20*T + 0.15*S + 0.10*R
    U = get_urgency_score(urgency)
    A = min(100.0, (available_units / requested_units) * 100.0) if requested_units > 0 else 100.0
    T = max(0.0, 100.0 - (dist_km * 2.0))
    S = 100.0 if vehicle_has_cold_chain else 50.0
    R = max(0.0, min(100.0, reliability))

    score = 0.0
    if is_eligible:
        score = round((0.30 * U) + (0.25 * A) + (0.20 * T) + (0.15 * S) + (0.10 * R), 2)

    return CandidateMatch(
        facility_id=candidate_facility.id if hasattr(candidate_facility, "id") else candidate_facility.get("id"),
        facility_name=candidate_facility.name if hasattr(candidate_facility, "name") else candidate_facility.get("name"),
        latitude=candidate_facility.latitude if hasattr(candidate_facility, "latitude") else candidate_facility.get("latitude"),
        longitude=candidate_facility.longitude if hasattr(candidate_facility, "longitude") else candidate_facility.get("longitude"),
        distance_km=dist_km,
        available_units=available_units,
        score=score,
        rank=0,
        score_breakdown={
            "urgency": round(0.30 * U, 2),
            "availability": round(0.25 * A, 2),
            "transport": round(0.20 * T, 2),
            "safety": round(0.15 * S, 2),
            "reliability": round(0.10 * R, 2),
        },
        is_eligible=is_eligible,
        disqualification_reason=disqualification_reason
    )

def rank_candidates(matches: List[CandidateMatch]) -> List[CandidateMatch]:
    """Sort eligible candidates by score descending, followed by ineligible."""
    eligible = [m for m in matches if m.is_eligible]
    ineligible = [m for m in matches if not m.is_eligible]

    eligible.sort(key=lambda x: x.score, reverse=True)
    ineligible.sort(key=lambda x: x.distance_km)

    ranked = eligible + ineligible
    for idx, candidate in enumerate(ranked):
        candidate.rank = idx + 1
    return ranked

