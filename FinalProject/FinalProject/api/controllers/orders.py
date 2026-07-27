import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from api.models.order import Order
from api.models.order_item import OrderItem
from api.models.customer import Customer
from api.models.menu_item import MenuItem
from api.models.promotion import Promotion
from api.models.menu_item_ingredient import MenuItemIngredient
from api.models.ingredient import Ingredient
from api.models.payment import Payment      # <-- Added Payment
from api.models.review import Review        # <-- Added Review
from api.schemas.order import OrderCreate, OrderStatusUpdate

def create_order(db: Session, order_data: OrderCreate):
    # 1. Ingredient inventory check
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

    # 2. Save Customer (Guest support)
    customer = Customer(**order_data.customer.model_dump())
    db.add(customer)
    db.flush()

    # 3. Calculate total price and deduct stock
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

    # Promo processing
    promo_id = None
    if order_data.promo_code:
        promo = db.query(Promotion).filter(Promotion.code == order_data.promo_code).first()
        if promo:
            total_price -= ((promo.discount_percentage / 100.0) * total_price)
            promo_id = promo.id

    # Create Order
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