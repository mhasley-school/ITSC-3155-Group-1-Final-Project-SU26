from pydantic import BaseModel
from datetime import datetime


class PromotionBase(BaseModel):
    code: str
    discount_percentage: float
    expiration_date: datetime


class PromotionCreate(PromotionBase):
    pass


class Promotion(PromotionBase):
    id: int

    class Config:
        from_attributes = True