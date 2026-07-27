from fastapi import FastAPI
from api.routers import menu_items, orders, promotion, review, customer, payment, ingredient

app = FastAPI(title="Online Restaurant Ordering System")

app.include_router(menu_items.router)
app.include_router(orders.router)
app.include_router(promotion.router)
app.include_router(review.router)
app.include_router(customer.router)
app.include_router(payment.router)
app.include_router(ingredient.router)