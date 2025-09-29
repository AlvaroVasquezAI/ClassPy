from pydantic import BaseModel
from typing import Optional
from .teacher import to_camel, CamelCaseModel

class SubjectBase(CamelCaseModel):
    name: str
    color: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(CamelCaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

class Subject(SubjectBase):
    id: int
    teacher_id: int