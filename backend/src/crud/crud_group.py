from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import models
from ..schemas import group as group_schema

def create_group(db: Session, group: group_schema.GroupCreate):
    existing_color = db.query(models.Group).filter(models.Group.color == group.color).first()
    if existing_color:
        raise HTTPException(status_code=400, detail="This color is already in use by another group.")

    db_group = models.Group(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def update_group(db: Session, group_id: int, group_update: group_schema.GroupUpdate):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")

    if group_update.color:
        existing_color = db.query(models.Group).filter(
            models.Group.color == group_update.color,
            models.Group.id != group_id
        ).first()
        if existing_color:
            raise HTTPException(status_code=400, detail="This color is already in use by another group.")
        db_group.color = group_update.color
    
    db.commit()
    db.refresh(db_group)
    return db_group

def get_groups_by_teacher(db: Session, teacher_id: int):
    return db.query(models.Group).join(models.Subject).filter(models.Subject.teacher_id == teacher_id).all()

def delete_group(db: Session, group_id: int):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(db_group)
    db.commit()
    return db_group