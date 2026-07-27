from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.promotion import Promotion
from api.schemas.promotion import PromotionCreate


def create_promotion(db: Session, promo: PromotionCreate):
    db_promo = Promotion(**promo.model_dump())
    db.add(db_promo)
    db.commit()
    db.refresh(db_promo)
    return db_promo


def get_all_promotions(db: Session):
    return db.query(Promotion).all()


def get_promotion_by_code(db: Session, code: str):
    promo = db.query(Promotion).filter(Promotion.code == code).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion code not found")
    return promo