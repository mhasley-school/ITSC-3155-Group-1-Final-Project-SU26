from fastapi import FastAPI
from api.routers import orders, menu_items


def load_routes(app: FastAPI):
    app.include_router(menu_items.router)
    app.include_router(orders.router)