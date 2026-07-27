from pydantic import BaseModel
from typing import Optional


class ReviewBase(BaseModel):
    order_id: int
    menu_item_id: int
    score: int
    review_text: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int

    class Config:
        from_attributes = True