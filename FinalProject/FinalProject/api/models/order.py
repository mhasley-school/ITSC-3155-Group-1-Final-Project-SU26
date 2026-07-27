from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.dependencies.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    order_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    order_type = Column(String(20), nullable=False, default="takeout")
    order_status = Column(String(30), nullable=False, default="Pending")
    tracking_number = Column(String(50), unique=True, nullable=False)
    total_price = Column(Float, nullable=False, default=0.0)
    promotion_id = Column(Integer, ForeignKey("promotions.id"), nullable=True)

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    promotion = relationship("Promotion", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)
    reviews = relationship("Review", back_populates="order")