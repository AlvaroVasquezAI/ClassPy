from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from fastapi import HTTPException, status
from datetime import date, datetime, timedelta
from ..models import models

def get_mexico_time():
    utc_now = datetime.utcnow()
    return utc_now - timedelta(hours=6)

def create_attendance_record(db: Session, student_qr_id: str, period_id: int, strict_mode: bool = False, late_threshold: int = 5):
    db_student = db.query(models.Student).filter(models.Student.qr_code_id == student_qr_id).first()
    if not db_student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="attendance_error_student_not_found")

    subject_id = db_student.group.subject_id
    attendance_status = 'present' 

    if strict_mode:
        now_mx = get_mexico_time()
        current_day_english = now_mx.strftime('%A')
        current_time_str = now_mx.strftime('%H:%M')

        active_schedule = db.query(models.WeeklySchedule).filter(
            models.WeeklySchedule.day_of_week == current_day_english,
            models.WeeklySchedule.start_time <= current_time_str,
            models.WeeklySchedule.end_time > current_time_str
        ).first()

        if not active_schedule:
            raise HTTPException(status_code=403, detail="attendance_error_strict_no_class")

        if db_student.group_id != active_schedule.group_id:
            active_group = db.query(models.Group).filter(models.Group.id == active_schedule.group_id).first()
            active_name = f"{active_group.grade}{active_group.name}"
            raise HTTPException(status_code=403, detail=f"attendance_error_strict_wrong_group||{active_name}")

        class_start = datetime.strptime(active_schedule.start_time, '%H:%M')
        current_scan_time = datetime.strptime(current_time_str, '%H:%M')
        
        diff = (current_scan_time - class_start).total_seconds() / 60
        
        if diff > late_threshold:
            attendance_status = 'late'

    today = datetime.now().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    existing_record = db.query(models.AttendanceRecord).filter(
        and_(
            models.AttendanceRecord.student_id == db_student.id,
            models.AttendanceRecord.period_id == period_id,
            models.AttendanceRecord.timestamp.between(start_of_day, end_of_day)
        )
    ).first()

    if existing_record:
        existing_record.timestamp = datetime.now()
        existing_record.status = attendance_status 
        db.commit()
        db.refresh(existing_record)
        return get_record_with_relations(db, existing_record.id)
    else:
        db_attendance = models.AttendanceRecord(
            student_id=db_student.id,
            subject_id=subject_id,
            period_id=period_id,
            status=attendance_status
        )
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        return get_record_with_relations(db, db_attendance.id)

def get_record_with_relations(db: Session, record_id: int):
    return db.query(models.AttendanceRecord).options(
        joinedload(models.AttendanceRecord.student)
        .joinedload(models.Student.group)
        .joinedload(models.Group.subject),
        joinedload(models.AttendanceRecord.period) 
    ).filter(models.AttendanceRecord.id == record_id).one()

def get_todays_attendance(db: Session):
    today = date.today()
    return get_attendance_by_date(db, today)

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