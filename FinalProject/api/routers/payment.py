from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.payment import Payment, PaymentCreate
from api.controllers import payment as controller

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=Payment)
def make_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    return controller.process_payment(db, payment)


@router.get("/", response_model=List[Payment])
def read_payments(db: Session = Depends(get_db)):
    return controller.get_all_payments(db)


@router.get("/order/{order_id}", response_model=Payment)
def read_payment_by_order(order_id: int, db: Session = Depends(get_db)):
    return controller.get_payment_by_order(db, order_id)