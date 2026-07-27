from pydantic import BaseModel
from datetime import datetime


class PaymentCreate(BaseModel):
    order_id: int
    card_number: str  # Send full card number; API will store last 4 digits
    payment_type: str


class Payment(BaseModel):
    id: int
    order_id: int
    card_last_four: str
    transaction_status: str
    payment_type: str
    payment_date: datetime
    amount: float

    class Config:
        from_attributes = True