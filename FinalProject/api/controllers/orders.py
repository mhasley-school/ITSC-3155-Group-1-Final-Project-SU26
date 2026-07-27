import uuid
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from api.models.order import Order
from api.models.order_item import OrderItem
from api.models.customer import Customer
from api.models.menu_item import MenuItem
from api.models.promotion import Promotion
from api.models.menu_item_ingredient import MenuItemIngredient
from api.models.ingredient import Ingredient
from api.schemas.order import OrderCreate, OrderStatusUpdate


def create_order(db: Session, order_data: OrderCreate):
    for item in order_data.order_items:
        recipe_links = db.query(MenuItemIngredient).filter(MenuItemIngredient.menu_item_id == item.menu_item_id).all()
        for link in recipe_links:
            ing = db.query(Ingredient).filter(Ingredient.id == link.ingredient_id).first()
            required_qty = link.quantity_required * item.quantity
            if not ing or ing.quantity_in_stock < required_qty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient ingredient stock for menu item ID {item.menu_item_id}"
                )

    customer = Customer(**order_data.customer.model_dump())
    db.add(customer)
    db.flush()

    total_price = 0.0
    order_items_to_create = []

    for item in order_data.order_items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")

        total_price += (menu_item.price * item.quantity)
        order_items_to_create.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                unit_price=menu_item.price
            )
        )

        recipe_links = db.query(MenuItemIngredient).filter(MenuItemIngredient.menu_item_id == item.menu_item_id).all()
        for link in recipe_links:
            ing = db.query(Ingredient).filter(Ingredient.id == link.ingredient_id).first()
            ing.quantity_in_stock -= (link.quantity_required * item.quantity)

    promo_id = None
    if order_data.promo_code:
        promo = db.query(Promotion).filter(Promotion.code == order_data.promo_code).first()
        if promo:
            total_price -= ((promo.discount_percentage / 100.0) * total_price)
            promo_id = promo.id

    tracking_num = f"TRK-{uuid.uuid4().hex[:8].upper()}"
    new_order = Order(
        customer_id=customer.id,
        order_type=order_data.order_type,
        order_status="Pending",
        tracking_number=tracking_num,
        total_price=round(total_price, 2),
        promotion_id=promo_id,
        order_items=order_items_to_create
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


def get_all_orders(db: Session):
    return db.query(Order).all()


def get_order_by_tracking(db: Session, tracking_number: str):
    order = db.query(Order).filter(Order.tracking_number == tracking_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def update_order_status(db: Session, order_id: int, status_data: OrderStatusUpdate):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.order_status = status_data.order_status
    db.commit()
    db.refresh(order)
    return order


def get_daily_revenue(db: Session, query_date: date):
    total = db.query(func.sum(Order.total_price))\
        .filter(func.date(Order.order_date) == query_date).scalar()
    return {"date": query_date, "total_revenue": total or 0.0}


def get_orders_by_date_range(db: Session, start_date: datetime, end_date: datetime):
    return db.query(Order).filter(Order.order_date.between(start_date, end_date)).all()


def delete_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}