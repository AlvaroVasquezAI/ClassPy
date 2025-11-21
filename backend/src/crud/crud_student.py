import unicodedata 
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import models
from ..schemas import student as student_schema
from typing import List
from sqlalchemy.orm import Session, joinedload

def capitalize_name(name: str) -> str:
    if not name:
        return ""
    return " ".join(part.capitalize() for part in name.strip().split())

def normalize_text(text: str) -> str:
    nfkd_form = unicodedata.normalize('NFKD', text)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

def get_students_by_group(db: Session, group_id: int):
    return db.query(models.Student).filter(models.Student.group_id == group_id).order_by(models.Student.last_name).all()

def create_student(db: Session, student: student_schema.StudentCreate):
    db_student = models.Student(
        first_name=capitalize_name(student.first_name),
        last_name=capitalize_name(student.last_name),
        contact_number=student.contact_number,
        status=student.status,
        group_id=student.group_id,
        classroom_user_id=student.classroom_user_id
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    normalized_first_name = normalize_text(student.first_name).upper()
    normalized_last_name = normalize_text(student.last_name).upper()

    first_initial = normalized_first_name[0]
    last_name_parts = normalized_last_name.split()

    first_last_name = last_name_parts[0]
    
    second_last_name_initial = ''

    if len(last_name_parts) > 1:
        second_last_name_initial = last_name_parts[1][0]

    qr_code = f"{first_initial}{first_last_name}{second_last_name_initial}{db_student.id}"
    
    db_student.qr_code_id = qr_code
    db.commit()
    db.refresh(db_student)
    
    return db_student

def update_student(db: Session, student_id: int, student_update: student_schema.StudentUpdate):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found") 

    if student_update.classroom_user_id:
        existing_student = db.query(models.Student).filter(
            models.Student.group_id == db_student.group_id,
            models.Student.classroom_user_id == student_update.classroom_user_id,
            models.Student.id != student_id
        ).first()
        if existing_student:
            raise HTTPException(status_code=400, detail="This Classroom student is already linked to another student in this group.")

    update_data = student_update.model_dump(exclude_unset=True)
    if 'first_name' in update_data and update_data['first_name']:
        update_data['first_name'] = capitalize_name(update_data['first_name'])
    if 'last_name' in update_data and update_data['last_name']:
        update_data['last_name'] = capitalize_name(update_data['last_name'])

    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(db_student)
    db.commit()
    return {"ok": True}

def create_students_from_roster(db: Session, group_id: int, students: List[student_schema.StudentFromClassroom]):
    db_students_to_add = []
    for student_data in students:
        existing_student = db.query(models.Student).filter(
            models.Student.group_id == group_id,
            models.Student.classroom_user_id == student_data.classroom_user_id
        ).first()

        if not existing_student:
            new_student = models.Student(
                first_name=capitalize_name(student_data.first_name),
                last_name=capitalize_name(student_data.last_name),
                classroom_user_id=student_data.classroom_user_id,
                group_id=group_id,
                status='active'
            )
            db_students_to_add.append(new_student)

    if not db_students_to_add:
        return []

    db.add_all(db_students_to_add)
    db.commit()

    for student in db_students_to_add:
        db.refresh(student) 
        
        normalized_first_name = normalize_text(student.first_name).upper()
        normalized_last_name = normalize_text(student.last_name).upper()
        first_initial = normalized_first_name[0] if normalized_first_name else ''
        last_name_parts = normalized_last_name.split()
        first_last_name = last_name_parts[0] if last_name_parts else ''
        second_last_name_initial = ''
        if len(last_name_parts) > 1:
            second_last_name_initial = last_name_parts[1][0] if last_name_parts[1] else ''
        
        qr_code = f"{first_initial}{first_last_name}{second_last_name_initial}{student.id}"
        student.qr_code_id = qr_code

    db.commit() 
    return db_students_to_add

def get_all_students_with_details(db: Session):
    return db.query(models.Student).options(
        joinedload(models.Student.group).joinedload(models.Group.subject)
    ).order_by(models.Student.last_name).all()