from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from api.dependencies.database import get_db
from api.schemas.ingredient import Ingredient, IngredientCreate, IngredientUpdate
from api.controllers import ingredient as controller

router = APIRouter(prefix="/ingredients", tags=["Ingredients"])


@router.post("/", response_model=Ingredient)
def create_ingredient(ing: IngredientCreate, db: Session = Depends(get_db)):
    return controller.create_ingredient(db, ing)


@router.get("/", response_model=List[Ingredient])
def read_ingredients(db: Session = Depends(get_db)):
    return controller.get_all_ingredients(db)


@router.put("/{ing_id}", response_model=Ingredient)
def update_ingredient(ing_id: int, ing: IngredientUpdate, db: Session = Depends(get_db)):
    return controller.update_ingredient(db, ing_id, ing)


@router.delete("/{ing_id}")
def delete_ingredient(ing_id: int, db: Session = Depends(get_db)):
    return controller.delete_ingredient(db, ing_id)