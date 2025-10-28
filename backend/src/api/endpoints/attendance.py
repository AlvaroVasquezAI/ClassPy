from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_attendance
from ...schemas import attendance as attendance_schema
from datetime import date

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/attendance", response_model=attendance_schema.AttendanceRecord, status_code=status.HTTP_201_CREATED)
def record_attendance(attendance: attendance_schema.AttendanceCreate, db: Session = Depends(get_db)):
    """
    Records attendance for a student via their QR code ID.
    """
    return crud_attendance.create_attendance_record(db=db, student_qr_id=attendance.student_qr_id, period_id=attendance.period_id)

@router.get("/attendance/today", response_model=List[attendance_schema.AttendanceRecord])
def get_todays_attendance(db: Session = Depends(get_db)):
    """
    Retrieves all attendance records for the current day.
    """
    return crud_attendance.get_todays_attendance(db=db)

@router.get("/attendance/by-date", response_model=List[attendance_schema.AttendanceRecord])
def get_attendance_for_date(query_date: date, db: Session = Depends(get_db)):
    """
    Retrieves all attendance records for a specific date.
    """
    return crud_attendance.get_attendance_by_date(db=db, query_date=query_date)