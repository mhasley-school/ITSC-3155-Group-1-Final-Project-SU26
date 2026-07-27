from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from api.dependencies.database import get_db
from api.schemas.menu_item import MenuItem, MenuItemCreate, MenuItemUpdate
from api.controllers import menu_items as controller

router = APIRouter(prefix="/menu-items", tags=["Menu Items"])


@router.post("/", response_model=MenuItem)
def create_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    return controller.create_menu_item(db, item)


@router.get("/", response_model=List[MenuItem])
def read_items(category: Optional[str] = Query(None, description="Filter by food category (e.g., vegetarian)"), db: Session = Depends(get_db)):
    return controller.get_all_menu_items(db, category)


@router.get("/{item_id}", response_model=MenuItem)
def read_item(item_id: int, db: Session = Depends(get_db)):
    return controller.get_menu_item_by_id(db, item_id)


@router.put("/{item_id}", response_model=MenuItem)
def update_item(item_id: int, item: MenuItemUpdate, db: Session = Depends(get_db)):
    return controller.update_menu_item(db, item_id, item)


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    return controller.delete_menu_item(db, item_id)