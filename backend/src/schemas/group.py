from pydantic import BaseModel
from .teacher import to_camel, CamelCaseModel
from typing import Optional

class GroupBase(CamelCaseModel):
    name: str
    grade: int
    color: str

class GroupCreate(GroupBase):
    subject_id: int

class Group(GroupBase):
    id: int
    subject_id: int

class GroupUpdate(CamelCaseModel):
    color: Optional[str] = None