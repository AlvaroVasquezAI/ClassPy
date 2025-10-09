import os
from sqlalchemy.orm import Session
from typing import Optional
from ..models import models
from ..schemas import teacher as teacher_schema

def get_teacher(db: Session):
    return db.query(models.Teacher).filter(models.Teacher.id == 1).first()

def create_teacher(db: Session, teacher: teacher_schema.TeacherCreate, profile_photo_url: Optional[str] = None):
    db_teacher = models.Teacher(
        id=1,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=teacher.email,
        profile_photo_url=profile_photo_url,
        is_google_connected=False 
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def update_teacher(db: Session, teacher_update: teacher_schema.TeacherCreate, new_photo_url: Optional[str] = None):
    db_teacher = get_teacher(db)
    if not db_teacher:
        return None

    db_teacher.first_name = teacher_update.first_name
    db_teacher.last_name = teacher_update.last_name
    db_teacher.email = teacher_update.email

    if new_photo_url:
        if db_teacher.profile_photo_url and os.path.exists(db_teacher.profile_photo_url):
            os.remove(db_teacher.profile_photo_url)
        db_teacher.profile_photo_url = new_photo_url
    
    db.commit()
    db.refresh(db_teacher)
    return db_teacher