from pydantic import BaseModel
from typing import Optional
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