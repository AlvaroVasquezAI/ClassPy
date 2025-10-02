from fastapi import APIRouter
from .endpoints import teacher, subject, group, schedule, topic, student, qr_code, download

api_router = APIRouter()
api_router.include_router(teacher.router, prefix="/api", tags=["teacher"])
api_router.include_router(subject.router, prefix="/api", tags=["subject"])
api_router.include_router(group.router, prefix="/api", tags=["group"])
api_router.include_router(schedule.router, prefix="/api", tags=["schedule"])
api_router.include_router(topic.router, prefix="/api", tags=["topic"])
api_router.include_router(student.router, prefix="/api", tags=["student"])
api_router.include_router(qr_code.router, prefix="/api", tags=["qr_code"])
api_router.include_router(download.router, prefix="/api", tags=["download"])