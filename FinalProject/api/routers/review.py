from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.review import Review, ReviewCreate
from api.controllers import review as controller

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("/", response_model=Review)
def submit_review(review: ReviewCreate, db: Session = Depends(get_db)):
    return controller.create_review(db, review)


@router.get("/", response_model=List[Review])
def read_reviews(db: Session = Depends(get_db)):
    return controller.get_all_reviews(db)


@router.get("/complaints", response_model=List[Review])
def read_complaints(max_score: int = Query(2, description="Maximum review score to consider a complaint"), db: Session = Depends(get_db)):
    return controller.get_dissatisfied_reviews(db, max_score)


@router.get("/item/{menu_item_id}", response_model=List[Review])
def read_item_reviews(menu_item_id: int, db: Session = Depends(get_db)):
    return controller.get_reviews_by_item(db, menu_item_id)


@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    return controller.delete_review(db, review_id)