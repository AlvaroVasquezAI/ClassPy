from sqlalchemy.orm import Session
from sqlalchemy import and_
from ..models import models
from ..schemas import schedule as schedule_schema
from fastapi import HTTPException

def create_or_update_schedule_entry(db: Session, schedule_entry: schedule_schema.ScheduleCreate):
    db_existing_entry = db.query(models.WeeklySchedule).filter(
        and_(
            models.WeeklySchedule.day_of_week == schedule_entry.day_of_week,
            models.WeeklySchedule.start_time == schedule_entry.start_time
        )
    ).first()

    if db_existing_entry:
        db_existing_entry.group_id = schedule_entry.group_id
        db.commit()
        db.refresh(db_existing_entry)
        return db_existing_entry
    else:
        db_schedule_entry = models.WeeklySchedule(**schedule_entry.model_dump())
        db.add(db_schedule_entry)
        db.commit()
        db.refresh(db_schedule_entry)
        return db_schedule_entry

def get_schedule(db: Session):
    return db.query(models.WeeklySchedule).all()

def delete_schedule_entry(db: Session, schedule_id: int):
    db_entry = db.query(models.WeeklySchedule).filter(models.WeeklySchedule.id == schedule_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    db.delete(db_entry)
    db.commit()
    return db_entry
