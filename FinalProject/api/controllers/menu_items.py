from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.menu_item import MenuItem
from api.schemas.menu_item import MenuItemCreate, MenuItemUpdate


def create_menu_item(db: Session, item: MenuItemCreate):
    db_item = MenuItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_all_menu_items(db: Session, category: str = None):
    query = db.query(MenuItem)
    if category:
        query = query.filter(MenuItem.category.ilike(f"%{category}%"))
    return query.all()


def get_menu_item_by_id(db: Session, item_id: int):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


def update_menu_item(db: Session, item_id: int, item_update: MenuItemUpdate):
    db_item = get_menu_item_by_id(db, item_id)
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_menu_item(db: Session, item_id: int):
    db_item = get_menu_item_by_id(db, item_id)
    db.delete(db_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}