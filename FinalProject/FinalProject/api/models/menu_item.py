from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from api.dependencies.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    calories = Column(Integer, nullable=True)
    category = Column(String(50), nullable=False)  # e.g., vegetarian, kids, spicy, low fat

    order_items = relationship("OrderItem", back_populates="menu_item")
    ingredients = relationship("MenuItemIngredient", back_populates="menu_item")
    reviews = relationship("Review", back_populates="menu_item")