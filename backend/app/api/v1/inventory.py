from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.inventory import InventoryItem
from backend.app.models.organization import Facility
from backend.app.schemas.core import ResourceCategory, FacilityResponse, FacilityCreate
from backend.app.schemas.inventory import (
    InventoryItemResponse,
    InventoryItemCreate,
    InventoryItemUpdate,
    BatchQuarantineRequest
)
from backend.app.websockets import manager

router = APIRouter(prefix="/inventory", tags=["Medical Resource Inventory"])

@router.get("", response_model=List[InventoryItemResponse])
@router.get("/", response_model=List[InventoryItemResponse])
def get_inventory(
    category: Optional[ResourceCategory] = None,
    facility_id: Optional[str] = None,
    stock_alert: Optional[bool] = Query(None, description="Filter for items with critical stock alert (DOS < 2.0 or units <= 5)"),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/inventory: List medical inventory with optional filters:
    category, facility_id, stock_alert, search query.
    """
    query = db.query(InventoryItem)
    if category:
        query = query.filter(InventoryItem.category == category.value)
    if facility_id:
        query = query.filter(InventoryItem.facility_id == facility_id)
    if search:
        query = query.filter(
            (InventoryItem.name.ilike(f"%{search}%")) |
            (InventoryItem.resource_code.ilike(f"%{search}%")) |
            (InventoryItem.batch_number.ilike(f"%{search}%"))
        )
    
    items = query.all()

    if stock_alert:
        # Filter items where DOS <= 2.0 days or units <= 5
        filtered_items = []
        for it in items:
            dos = (it.units_available / it.daily_consumption) if it.daily_consumption > 0 else 999.0
            if dos <= 2.0 or it.units_available <= 5:
                filtered_items.append(it)
        return filtered_items

    return items

@router.get("/items", response_model=List[InventoryItemResponse])
def list_inventory_items(
    category: Optional[ResourceCategory] = None,
    facility_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return get_inventory(category=category, facility_id=facility_id, search=search, db=db)

@router.get("/facilities", response_model=List[FacilityResponse])
def get_facilities(db: Session = Depends(get_db)):
    return db.query(Facility).all()

@router.post("/facilities", response_model=FacilityResponse)
def create_facility(payload: FacilityCreate, db: Session = Depends(get_db)):
    facility = Facility(
        name=payload.name,
        organization_id=payload.organization_id,
        type=payload.facility_type,
        lat=payload.latitude,
        lng=payload.longitude,
        city=payload.city
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility

@router.get("/items/{item_id}", response_model=InventoryItemResponse)
def get_inventory_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("/items", response_model=InventoryItemResponse)
async def create_inventory_item(payload: InventoryItemCreate, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(Facility.id == payload.facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    units = payload.units_available if payload.units_available is not None else (payload.quantity if payload.quantity is not None else 0)
    now_utc = datetime.now(timezone.utc)
    expiry = payload.expiry_date if payload.expiry_date else now_utc

    item = InventoryItem(
        facility_id=payload.facility_id,
        category=payload.category.value,
        resource_code=payload.resource_code,
        name=payload.name,
        batch_number=payload.batch_number or "BATCH-DEFAULT",
        units_available=units,
        expiry_date=expiry,
        status="QUARANTINED" if payload.is_quarantined else (payload.status or "AVAILABLE"),
        min_temp=payload.min_temp,
        max_temp=payload.max_temp,
        details=payload.details,
        daily_consumption=payload.daily_consumption
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    await manager.broadcast_event("INVENTORY_UPDATED", {
        "item_id": item.id,
        "facility_id": item.facility_id,
        "category": item.category,
        "units_available": item.units_available
    })

    return item

@router.patch("/items/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(item_id: str, payload: InventoryItemUpdate, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    if payload.units_available is not None:
        item.units_available = payload.units_available
    elif payload.quantity is not None:
        item.units_available = payload.quantity

    if payload.status is not None:
        item.status = payload.status
    if payload.is_quarantined is not None:
        item.status = "QUARANTINED" if payload.is_quarantined else "AVAILABLE"

    if payload.daily_consumption is not None:
        item.daily_consumption = payload.daily_consumption
    if payload.details is not None:
        item.details = payload.details

    db.commit()
    db.refresh(item)

    await manager.broadcast_event("INVENTORY_UPDATED", {
        "item_id": item.id,
        "facility_id": item.facility_id,
        "category": item.category,
        "units_available": item.units_available,
        "status": item.status
    })

    return item

@router.post("/quarantine", response_model=InventoryItemResponse)
async def set_batch_quarantine(payload: BatchQuarantineRequest, db: Session = Depends(get_db)):
    item = (
        db.query(InventoryItem)
        .filter(
            (InventoryItem.id == payload.batch_or_item_id) |
            (InventoryItem.batch_number == payload.batch_or_item_id)
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail=f"No resource found with identifier {payload.batch_or_item_id}")

    item.status = "QUARANTINED" if payload.quarantine else "AVAILABLE"
    db.commit()
    db.refresh(item)

    await manager.broadcast_event("BATCH_QUARANTINED", {
        "item_id": item.id,
        "facility_id": item.facility_id,
        "status": item.status,
        "reason": payload.reason
    })

    return item
