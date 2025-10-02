from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_student
from ...schemas import student as student_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/students", response_model=List[student_schema.Student])
def read_students_by_group(group_id: int, db: Session = Depends(get_db)):
    return crud_student.get_students_by_group(db=db, group_id=group_id)

@router.post("/students", response_model=student_schema.Student, status_code=status.HTTP_201_CREATED)
def create_student(student: student_schema.StudentCreate, db: Session = Depends(get_db)):
    return crud_student.create_student(db=db, student=student)

@router.put("/students/{student_id}", response_model=student_schema.Student)
def update_student(student_id: int, student: student_schema.StudentUpdate, db: Session = Depends(get_db)):
    return crud_student.update_student(db=db, student_id=student_id, student_update=student)

@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    crud_student.delete_student(db=db, student_id=student_id)
    return {"ok": True}