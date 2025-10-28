from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from fastapi import HTTPException, status
from datetime import date, datetime, timedelta
from ..models import models

def create_attendance_record(db: Session, student_qr_id: str, period_id: int):
    db_student = db.query(models.Student).filter(models.Student.qr_code_id == student_qr_id).first()
    if not db_student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student with this QR ID not found")

    subject_id = db_student.group.subject_id
    if not subject_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student is not enrolled in a subject")

    db_attendance = models.AttendanceRecord(
        student_id=db_student.id,
        subject_id=subject_id,
        period_id=period_id
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    created_record = db.query(models.AttendanceRecord).options(
        joinedload(models.AttendanceRecord.student)
        .joinedload(models.Student.group)
        .joinedload(models.Group.subject),
        joinedload(models.AttendanceRecord.period) 
    ).filter(models.AttendanceRecord.id == db_attendance.id).one()
    
    return created_record

def get_attendance_by_date(db: Session, query_date: date):
    start_of_day = datetime.combine(query_date, datetime.min.time())
    end_of_day = datetime.combine(query_date, datetime.max.time())
    
    return db.query(models.AttendanceRecord)\
        .options(
            joinedload(models.AttendanceRecord.student)
            .joinedload(models.Student.group)
            .joinedload(models.Group.subject),
            joinedload(models.AttendanceRecord.period) 
        )\
        .filter(models.AttendanceRecord.timestamp.between(start_of_day, end_of_day))\
        .order_by(desc(models.AttendanceRecord.timestamp))\
        .all()