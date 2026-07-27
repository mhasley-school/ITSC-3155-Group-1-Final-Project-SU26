from pydantic import BaseModel, ConfigDict

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    unit_price: float

    class Config:
        model_config = ConfigDict(from_attributes=True)