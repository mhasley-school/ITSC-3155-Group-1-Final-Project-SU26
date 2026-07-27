from fastapi import FastAPI
from api.dependencies.database import engine, Base
from api.models import model_loader
from api.routers import index as router_loader

# Initialize DB tables
model_loader.index()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Online Restaurant Ordering System API", version="1.0.0")

# Load registered routes
router_loader.load_routes(app)