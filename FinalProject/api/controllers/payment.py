from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.payment import Payment
from api.schemas.payment import PaymentCreate


def process_payment(db: Session, payment_data: PaymentCreate):
    db_payment = Payment(**payment_data.model_dump())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_all_payments(db: Session):
    return db.query(Payment).all()


def get_payment_by_order(db: Session, order_id: int):
    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    return payment