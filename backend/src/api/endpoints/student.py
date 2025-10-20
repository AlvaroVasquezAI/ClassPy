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

@router.post("/students/bulk/{group_id}", response_model=List[student_schema.Student], status_code=status.HTTP_201_CREATED)
def create_students_in_bulk(group_id: int, payload: student_schema.StudentBulkCreate, db: Session = Depends(get_db)):
    """
    Creates multiple students in a group from a Google Classroom roster.
    """
    return crud_student.create_students_from_roster(db=db, group_id=group_id, students=payload.students)

@router.get("/students/all", response_model=List[student_schema.StudentDetails])
def read_all_students_with_details(db: Session = Depends(get_db)):
    """
    Retrieves all students with their group and subject details.
    """
    db_students = crud_student.get_all_students_with_details(db=db)
    
    response = []
    for student in db_students:
        if student.group and student.group.subject:
            student_details = student_schema.StudentDetails(
                id=student.id,
                first_name=student.first_name,
                last_name=student.last_name,
                qr_code_id=student.qr_code_id,
                contact_number=student.contact_number,
                status=student.status,
                group_id=student.group_id,
                classroom_user_id=student.classroom_user_id,
                group=student.group,
                subject=student.group.subject  
            )
            response.append(student_details)
            
    return response