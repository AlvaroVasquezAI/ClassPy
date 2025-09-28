from fastapi import APIRouter
from .endpoints import teacher

api_router = APIRouter()
api_router.include_router(teacher.router, prefix="/api", tags=["teacher"])