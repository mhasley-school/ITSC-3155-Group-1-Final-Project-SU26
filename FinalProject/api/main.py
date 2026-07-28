from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.dependencies.database import engine, Base
from api.models import model_loader
from api.routers import menu_items, orders, promotion, review, customer, payment, ingredient

model_loader.index()
Base.metadata.create_all(bind=engine)

from sqlalchemy import text
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE reviews MODIFY order_id INT NULL"))
        conn.commit()
except Exception:
    pass

app = FastAPI(title="Online Restaurant Ordering System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "API is running",
        "docs": "http://127.0.0.1:8000/docs",
        "menu": "http://127.0.0.1:8000/menu-items/",
    }


app.include_router(menu_items.router)
app.include_router(orders.router)
app.include_router(promotion.router)
app.include_router(review.router)
app.include_router(customer.router)
app.include_router(payment.router)
app.include_router(ingredient.router)
