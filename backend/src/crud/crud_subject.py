from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import models
from ..schemas import subject as subject_schema

def create_subject(db: Session, subject: subject_schema.SubjectCreate, teacher_id: int):
    existing_name = db.query(models.Subject).filter(models.Subject.name == subject.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="A subject with this name already exists.")
    existing_color = db.query(models.Subject).filter(models.Subject.color == subject.color).first()
    if existing_color:
        raise HTTPException(status_code=400, detail="This color is already in use by another subject.")
        
    db_subject = models.Subject(**subject.model_dump(), teacher_id=teacher_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def get_subjects_by_teacher(db: Session, teacher_id: int):
    return db.query(models.Subject).filter(models.Subject.teacher_id == teacher_id).all()

def update_subject(db: Session, subject_id: int, subject: subject_schema.SubjectUpdate):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if subject.name:
        existing_name = db.query(models.Subject).filter(models.Subject.name == subject.name, models.Subject.id != subject_id).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Another subject with this name already exists.")
        db_subject.name = subject.name
    
    if subject.color:
        existing_color = db.query(models.Subject).filter(models.Subject.color == subject.color, models.Subject.id != subject_id).first()
        if existing_color:
            raise HTTPException(status_code=400, detail="This color is already in use by another subject.")
        db_subject.color = subject.color

    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(db_subject)
    db.commit()
    return db_subject