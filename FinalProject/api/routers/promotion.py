from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.promotion import Promotion, PromotionCreate
from api.controllers import promotion as controller

router = APIRouter(prefix="/promotions", tags=["Promotions"])


@router.post("/", response_model=Promotion)
def create_promo(promo: PromotionCreate, db: Session = Depends(get_db)):
    return controller.create_promotion(db, promo)


@router.get("/", response_model=List[Promotion])
def read_promos(db: Session = Depends(get_db)):
    return controller.get_all_promotions(db)


@router.get("/{code}", response_model=Promotion)
def read_promo(code: str, db: Session = Depends(get_db)):
    return controller.get_promotion_by_code(db, code)