from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .teacher import CamelCaseModel

class PeriodForAttendance(CamelCaseModel):
    name: str

class SubjectForAttendance(CamelCaseModel):
    name: str

class GroupForAttendance(CamelCaseModel):
    id: int
    grade: int
    name: str
    subject: SubjectForAttendance

class StudentForAttendance(CamelCaseModel):
    id: int
    first_name: str
    last_name: str
    qr_code_id: Optional[str] = None
    group: GroupForAttendance

class AttendanceRecord(CamelCaseModel):
    id: int
    timestamp: datetime
    student: StudentForAttendance
    period: PeriodForAttendance 

    class Config:
        from_attributes = True

class AttendanceCreate(CamelCaseModel):
    student_qr_id: str
    period_id: int