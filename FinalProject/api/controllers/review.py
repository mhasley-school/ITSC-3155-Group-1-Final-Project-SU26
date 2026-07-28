from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.review import Review
from api.schemas.review import ReviewCreate


def create_review(db: Session, review_data: ReviewCreate):
    if not (1 <= review_data.score <= 5):
        raise HTTPException(status_code=400, detail="Score must be between 1 and 5")
    payload = review_data.model_dump()
    if not payload.get("order_id"):
        payload["order_id"] = None
    db_review = Review(**payload)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_all_reviews(db: Session):
    return db.query(Review).all()


def get_reviews_by_item(db: Session, menu_item_id: int):
    return db.query(Review).filter(Review.menu_item_id == menu_item_id).all()


def get_dissatisfied_reviews(db: Session, max_score: int = 2):
    return db.query(Review).filter(Review.score <= max_score).all()


def delete_review(db: Session, review_id: int):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}