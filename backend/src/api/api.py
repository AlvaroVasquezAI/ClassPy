from fastapi import APIRouter
from .endpoints import teacher, subject, group, schedule

api_router = APIRouter()
api_router.include_router(teacher.router, prefix="/api", tags=["teacher"])
api_router.include_router(subject.router, prefix="/api", tags=["subject"])
api_router.include_router(group.router, prefix="/api", tags=["group"])
api_router.include_router(schedule.router, prefix="/api", tags=["schedule"])