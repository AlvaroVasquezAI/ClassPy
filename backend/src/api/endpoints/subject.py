from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_subject
from ...schemas import subject as subject_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/subjects", response_model=subject_schema.Subject)
def create_subject(subject: subject_schema.SubjectCreate, db: Session = Depends(get_db)):
    return crud_subject.create_subject(db=db, subject=subject, teacher_id=1)

@router.get("/subjects", response_model=List[subject_schema.Subject])
def read_subjects(db: Session = Depends(get_db)):
    return crud_subject.get_subjects_by_teacher(db=db, teacher_id=1)

@router.put("/subjects/{subject_id}", response_model=subject_schema.Subject)
def update_subject(subject_id: int, subject: subject_schema.SubjectUpdate, db: Session = Depends(get_db)):
    return crud_subject.update_subject(db=db, subject_id=subject_id, subject=subject)

@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    crud_subject.delete_subject(db=db, subject_id=subject_id)
    return {"ok": True}