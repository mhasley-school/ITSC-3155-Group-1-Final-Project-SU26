from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from api.dependencies.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    card_last_four = Column(String(4), nullable=False)
    transaction_status = Column(String(30), nullable=False)  # Success, Failed, Pending
    payment_type = Column(String(30), nullable=False)  # Credit Card, Debit Card
    payment_date = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float, nullable=False)

    order = relationship("Order", back_populates="payment")