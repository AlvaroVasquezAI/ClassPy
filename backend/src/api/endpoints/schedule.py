from fastapi import APIRouter, Depends, status 
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_schedule
from ...schemas import schedule as schedule_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/schedule", response_model=schedule_schema.Schedule)
def create_schedule_entry(entry: schedule_schema.ScheduleCreate, db: Session = Depends(get_db)):
    return crud_schedule.create_or_update_schedule_entry(db=db, schedule_entry=entry)

@router.get("/schedule", response_model=List[schedule_schema.Schedule])
def read_schedule(db: Session = Depends(get_db)):
    return crud_schedule.get_schedule(db=db)

@router.delete("/schedule/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule_entry(schedule_id: int, db: Session = Depends(get_db)):
    crud_schedule.delete_schedule_entry(db=db, schedule_id=schedule_id)
    return {"ok": True}