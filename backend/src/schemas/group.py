from pydantic import BaseModel
from .teacher import to_camel, CamelCaseModel
from typing import Optional

class ClassroomGroupLink(CamelCaseModel):
    classroom_course_id: str

class GroupBase(CamelCaseModel):
    name: str
    grade: int
    color: str

class GroupCreate(GroupBase):
    subject_id: int
    classroom_course_id: Optional[str] = None

class Group(GroupBase):
    id: int
    subject_id: int

class GroupDetails(Group):
    classroom_group: Optional[ClassroomGroupLink] = None

class GroupUpdate(CamelCaseModel):
    color: Optional[str] = None