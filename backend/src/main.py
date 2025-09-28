from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles 

from .database import engine
from .models import models
from .api.api import api_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClassPy API",
    description="The backend API for the ClassPy application.",
    version="1.0.0"
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

CLIENT_IP_ORIGIN = "http://192.168.1.79:3000" 

origins = [
    "http://localhost:3000",
]

if CLIENT_IP_ORIGIN:
    origins.append(CLIENT_IP_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the ClassPy API"}