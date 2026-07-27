from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.customer import Customer
from api.schemas.customer import CustomerCreate


def create_customer(db: Session, customer_data: CustomerCreate):
    db_customer = Customer(**customer_data.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_all_customers(db: Session):
    return db.query(Customer).all()


def get_customer_by_id(db: Session, customer_id: int):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer