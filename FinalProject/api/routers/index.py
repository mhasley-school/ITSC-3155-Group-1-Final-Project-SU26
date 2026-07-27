from fastapi import FastAPI
from api.routers import orders, menu_items, promotion, review, customer


def load_routes(app: FastAPI):
    app.include_router(menu_items.router)
    app.include_router(orders.router)
    app.include_router(promotion.router)
    app.include_router(review.router)
    app.include_router(customer.router)