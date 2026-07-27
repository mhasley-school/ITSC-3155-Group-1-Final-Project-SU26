from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class PaymentBase(BaseModel):
    order_id: int
    card_last_four: str
    transaction_status: str
    payment_type: str
    amount: float


class PaymentCreate(PaymentBase):
    pass


class Payment(PaymentBase):
    id: int
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)