from pydantic import BaseModel, ConfigDict
from typing import Optional


class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone_number: str
    address: str


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int

    class Config:
        model_config = ConfigDict(from_attributes=True)