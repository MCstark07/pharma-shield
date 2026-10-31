from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.organization import Facility
from backend.app.models.inventory import InventoryItem
from backend.app.models.logistics import EmergencyRequest
from backend.app.schemas.core import ResourceCategory, UrgencyLevel
from backend.app.schemas.ai import MatchingResponse, CandidateMatch, ShortagePrediction
from backend.app.services.matching import evaluate_candidate, rank_candidates
from backend.app.services.forecasting import predict_shortage

router = APIRouter(prefix="/ai", tags=["AI Matching & Forecasting"])

@router.post("/match/{request_id}", response_model=MatchingResponse)
def get_candidate_matches(request_id: str, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    req_facility = db.query(Facility).filter(Facility.id == req.requesting_facility_id).first()
    if not req_facility:
        raise HTTPException(status_code=404, detail="Requesting facility not found")

    # Find candidate facilities having this resource code (excluding requesting facility)
    candidate_items = (
        db.query(InventoryItem)
        .filter(
            InventoryItem.resource_code == req.resource_code,
            InventoryItem.facility_id != req.requesting_facility_id
        )
        .all()
    )

    matches: List[CandidateMatch] = []
    category_enum = ResourceCategory(req.category)
    urgency_enum = UrgencyLevel(req.urgency)

    for item in candidate_items:
        fac = db.query(Facility).filter(Facility.id == item.facility_id).first()
        if not fac or not fac.is_active:
            continue

        match = evaluate_candidate(
            req_facility_lat=req_facility.latitude,
            req_facility_lon=req_facility.longitude,
            candidate_facility=fac,
            candidate_item=item,
            category=category_enum,
            requested_code=req.resource_code,
            requested_units=req.quantity,
            urgency=urgency_enum,
            vehicle_has_cold_chain=True
        )
        matches.append(match)

    ranked_matches = rank_candidates(matches)
    best = ranked_matches[0] if (ranked_matches and ranked_matches[0].is_eligible) else None

    return MatchingResponse(
        request_id=req.id,
        resource_code=req.resource_code,
        candidates=ranked_matches,
        best_match=best
    )

@router.get("/forecasts", response_model=List[ShortagePrediction])
def get_inventory_forecasts(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(InventoryItem)
    if facility_id:
        query = query.filter(InventoryItem.facility_id == facility_id)
    items = query.all()

    predictions: List[ShortagePrediction] = []
    for item in items:
        fac = db.query(Facility).filter(Facility.id == item.facility_id).first()
        fac_name = fac.name if fac else "Unknown Center"
        
        pred = predict_shortage(
            facility_id=item.facility_id,
            facility_name=fac_name,
            resource_code=item.resource_code,
            resource_name=item.name,
            current_stock=item.quantity,
            daily_consumption=item.daily_consumption,
            lead_time_days=2.0
        )
        predictions.append(pred)

    # Sort critical shortages first
    alert_order = {"CRITICAL": 0, "WARNING": 1, "SAFE": 2}
    predictions.sort(key=lambda p: (alert_order.get(p.alert_level, 3), p.dos_days))

    return predictions

