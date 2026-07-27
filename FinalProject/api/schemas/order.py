from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from api.schemas.customer import CustomerCreate
from api.schemas.order_item import OrderItemCreate, OrderItem


class OrderCreate(BaseModel):
    customer: CustomerCreate
    order_type: str  # "takeout" or "delivery"
    order_items: List[OrderItemCreate]
    promo_code: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    order_status: str


class Order(BaseModel):
    id: int
    customer_id: Optional[int] = None
    order_date: datetime
    order_type: str
    order_status: str
    tracking_number: str
    total_price: float
    promotion_id: Optional[int] = None
    order_items: List[OrderItem] = []

    class Config:
        model_config = ConfigDict(from_attributes=True)