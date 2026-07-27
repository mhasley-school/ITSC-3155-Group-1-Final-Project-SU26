from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.order import Order, OrderCreate, OrderStatusUpdate
from api.controllers import orders as controller

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=Order)
def place_order(order: OrderCreate, db: Session = Depends(get_db)):
    return controller.create_order(db, order)


@router.get("/", response_model=List[Order])
def read_orders(db: Session = Depends(get_db)):
    return controller.get_all_orders(db)


@router.get("/track/{tracking_number}", response_model=Order)
def track_order(tracking_number: str, db: Session = Depends(get_db)):
    return controller.get_order_by_tracking(db, tracking_number)


@router.put("/{order_id}/status", response_model=Order)
def change_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    return controller.update_order_status(db, order_id, status_update)