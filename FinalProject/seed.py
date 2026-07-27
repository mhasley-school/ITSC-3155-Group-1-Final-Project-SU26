from api.dependencies.database import SessionLocal, engine, Base
from api.models import model_loader
from api.models.menu_item import MenuItem
from api.models.ingredient import Ingredient
from api.models.menu_item_ingredient import MenuItemIngredient
from api.models.promotion import Promotion
from api.models.customer import Customer
from api.models.order import Order
from api.models.order_item import OrderItem
from api.models.payment import Payment
from api.models.review import Review
from datetime import datetime, timedelta

model_loader.index()
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
    Base.metadata.drop_all(bind=conn)
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    conn.commit()

Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        if db.query(MenuItem).first():
            print("Database already contains data.")
            return

        ing_cheese = Ingredient(name="Mozzarella", quantity_in_stock=5000.0, unit="grams")
        ing_sauce = Ingredient(name="Tomato Sauce", quantity_in_stock=10000.0, unit="ml")
        ing_dough = Ingredient(name="Pizza Dough", quantity_in_stock=100.0, unit="units")
        db.add_all([ing_cheese, ing_sauce, ing_dough])
        db.flush()

        pizza = MenuItem(name="Margherita Pizza", price=12.99, category="Vegetarian", calories=800, description="cheese pizza")
        pasta = MenuItem(name="Penne Pasta", price=10.99, category="Italian", calories=650, description="pasta with sauce")
        db.add_all([pizza, pasta])
        db.flush()

        db.add_all([
            MenuItemIngredient(menu_item_id=pizza.id, ingredient_id=ing_cheese.id, quantity_required=200.0),
            MenuItemIngredient(menu_item_id=pizza.id, ingredient_id=ing_sauce.id, quantity_required=150.0),
            MenuItemIngredient(menu_item_id=pizza.id, ingredient_id=ing_dough.id, quantity_required=1.0)
        ])

        # 4. Seed Promotion
        promo = Promotion(code="SUMMER20", discount_percentage=20.0, expiration_date=datetime.now() + timedelta(days=30))
        db.add(promo)
        db.flush()

        # 5. Seed Customer & Order
        cust = Customer(name="Michael J", email="mj@gmail.com", phone_number="555-123-4567", address="123 Main St")
        db.add(cust)
        db.flush()

        order = Order(
            customer_id=cust.id,
            order_type="Takeout",
            order_status="Completed",
            tracking_number="TRK-SEED1234",
            total_price=12.99,
            promotion_id=promo.id
        )
        db.add(order)
        db.flush()

        db.add(OrderItem(order_id=order.id, menu_item_id=pizza.id, quantity=1, unit_price=12.99))
        db.add(Payment(order_id=order.id, card_last_four="4242", transaction_status="Success", payment_type="Credit Card", amount=12.99))
        db.add(Review(order_id=order.id, menu_item_id=pizza.id, score=5, review_text="Delicious!"))

        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()