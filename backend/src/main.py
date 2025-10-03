from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles 
from datetime import date

from .database import engine, SessionLocal
from .models import models

models.Base.metadata.create_all(bind=engine)

from .api.api import api_router

app = FastAPI(
    title="ClassPy API",
    description="The backend API for the ClassPy application.",
    version="1.0.0"
)

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        existing_period = db.query(models.Period).first()
        if not existing_period:
            print("Seeding initial data: Creating Periods...")
            period1 = models.Period(id=1, name="Period 1", start_date=date(2025, 9, 1), end_date=date(2025, 11, 30))
            period2 = models.Period(id=2, name="Period 2", start_date=date(2025, 12, 1), end_date=date(2026, 3, 15))
            period3 = models.Period(id=3, name="Period 3", start_date=date(2026, 3, 16), end_date=date(2026, 6, 20))
            
            db.add_all([period1, period2, period3])
            db.commit()
            print("Periods created successfully.")
        else:
            print("Initial data (Periods) already exists. Skipping seed.")
    finally:
        db.close()


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Regex to allow connections from any device on the local network.
# This pattern matches http://localhost:3000, http://127.0.0.1:3000,
# and any IP address in the 192.168.x.x range on port 3000.
origin_regex = r"http://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}):3000"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassPy API"}