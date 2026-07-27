from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.customer import Customer, CustomerCreate
from api.controllers import customer as controller

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=Customer)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    return controller.create_customer(db, customer)


@router.get("/", response_model=List[Customer])
def read_customers(db: Session = Depends(get_db)):
    return controller.get_all_customers(db)


@router.get("/{customer_id}", response_model=Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    return controller.get_customer_by_id(db, customer_id)