from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
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


@router.get("/revenue")
def get_daily_revenue(query_date: date = Query(..., description="Date formatted as YYYY-MM-DD"), db: Session = Depends(get_db)):
    return controller.get_daily_revenue(db, query_date)


@router.get("/filter/date-range", response_model=List[Order])
def read_orders_by_date_range(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    return controller.get_orders_by_date_range(db, start_date, end_date)


@router.put("/{order_id}/status", response_model=Order)
def change_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    return controller.update_order_status(db, order_id, status_update)


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    return controller.delete_order(db, order_id)