from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from api.dependencies.database import Base


class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    discount_percentage = Column(Float, nullable=False)
    expiration_date = Column(DateTime, nullable=False)

    orders = relationship("Order", back_populates="promotion")