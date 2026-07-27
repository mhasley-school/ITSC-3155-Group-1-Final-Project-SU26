from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.ingredient import Ingredient
from api.schemas.ingredient import IngredientCreate, IngredientUpdate


def create_ingredient(db: Session, ingredient: IngredientCreate):
    db_ing = Ingredient(**ingredient.model_dump())
    db.add(db_ing)
    db.commit()
    db.refresh(db_ing)
    return db_ing


def get_all_ingredients(db: Session):
    return db.query(Ingredient).all()


def update_ingredient(db: Session, ing_id: int, ing_update: IngredientUpdate):
    db_ing = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
    if not db_ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    for key, val in ing_update.model_dump(exclude_unset=True).items():
        setattr(db_ing, key, val)
    db.commit()
    db.refresh(db_ing)
    return db_ing


def delete_ingredient(db: Session, ing_id: int):
    db_ing = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
    if not db_ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(db_ing)
    db.commit()
    return {"message": "Ingredient deleted successfully"}