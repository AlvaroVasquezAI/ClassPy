import shutil
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ... import models
from ...schemas import teacher as teacher_schema
from ...crud import crud_teacher
from ...database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/teacher", response_model=teacher_schema.Teacher, status_code=status.HTTP_201_CREATED)
def create_teacher_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_teacher = crud_teacher.get_teacher(db)
    if db_teacher:
        raise HTTPException(status_code=400, detail="Teacher profile already exists.")
    
    teacher_data = teacher_schema.TeacherCreate(first_name=first_name, last_name=last_name, email=email)
    
    file_path = None
    if profile_photo:
        save_dir = "uploads/profile_pics"
        file_path = os.path.join(save_dir, profile_photo.filename)
        os.makedirs(save_dir, exist_ok=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)

    return crud_teacher.create_teacher(db=db, teacher=teacher_data, profile_photo_url=file_path)

@router.put("/teacher", response_model=teacher_schema.Teacher)
def update_teacher_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    teacher_data = teacher_schema.TeacherCreate(first_name=first_name, last_name=last_name, email=email)
    
    new_photo_path = None
    if profile_photo:
        save_dir = "uploads/profile_pics"
        new_photo_path = os.path.join(save_dir, profile_photo.filename)
        os.makedirs(save_dir, exist_ok=True)
        with open(new_photo_path, "wb") as buffer:
            shutil.copyfileobj(profile_photo.file, buffer)
            
    updated_teacher = crud_teacher.update_teacher(db, teacher_update=teacher_data, new_photo_url=new_photo_path)
    if not updated_teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")
    
    return updated_teacher

@router.get("/teacher", response_model=Optional[teacher_schema.Teacher])
def read_teacher_profile(db: Session = Depends(get_db)):
    db_teacher = crud_teacher.get_teacher(db)
    return db_teacher