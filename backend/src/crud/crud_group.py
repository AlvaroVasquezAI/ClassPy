from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from ..models import models
from ..schemas import group as group_schema

def create_group(db: Session, group: group_schema.GroupCreate):
    existing_color = db.query(models.Group).filter(models.Group.color == group.color).first()
    if existing_color:
        raise HTTPException(status_code=400, detail="This color is already in use by another group.")

    db_group = models.Group(
        name=group.name,
        grade=group.grade,
        subject_id=group.subject_id,
        color=group.color
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    if group.classroom_course_id:
        existing_link = db.query(models.ClassroomGroup).filter(models.ClassroomGroup.classroom_course_id == group.classroom_course_id).first()
        if existing_link:
            db.delete(db_group)
            db.commit()
            raise HTTPException(status_code=400, detail="This Google Classroom course is already linked to another group.")

        db_classroom_link = models.ClassroomGroup(
            group_id=db_group.id,
            classroom_course_id=group.classroom_course_id
        )
        db.add(db_classroom_link)
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
    return db.query(models.Group).join(models.Subject).filter(models.Subject.teacher_id == teacher_id).options(joinedload(models.Group.classroom_group)).all()

def delete_group(db: Session, group_id: int):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(db_group)
    db.commit()
    return db_group