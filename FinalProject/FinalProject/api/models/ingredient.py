from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from api.dependencies.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    quantity_in_stock = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False)  # e.g., grams, oz, units

    menu_item_links = relationship("MenuItemIngredient", back_populates="ingredient")