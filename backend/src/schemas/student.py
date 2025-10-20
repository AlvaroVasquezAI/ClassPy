from pydantic import BaseModel
from typing import List, Optional
from .teacher import CamelCaseModel

class StudentBase(CamelCaseModel):
    first_name: str
    last_name: str
    contact_number: Optional[str] = None
    status: str = 'active'

class StudentCreate(StudentBase):
    group_id: int
    classroom_user_id: Optional[str] = None

class StudentUpdate(CamelCaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = None
    classroom_user_id: Optional[str] = None

class Student(StudentBase):
    id: int
    group_id: int
    qr_code_id: Optional[str] = None
    classroom_user_id: Optional[str] = None

class StudentFromClassroom(CamelCaseModel):
    first_name: str
    last_name: str
    classroom_user_id: str

class StudentBulkCreate(CamelCaseModel):
    students: List[StudentFromClassroom]

class StudentGroup(CamelCaseModel):
    id: int
    name: str
    grade: int

class StudentSubject(CamelCaseModel):
    id: int
    name: str

class StudentDetails(Student):
    group: StudentGroup
    subject: StudentSubject

    class Config:
        from_attributes = True