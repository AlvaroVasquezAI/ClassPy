from pydantic import BaseModel, Field
from typing import Optional, List
from .teacher import CamelCaseModel

class Assignment(CamelCaseModel):
    id: int
    name: str
    classroom_asg_id: Optional[str] = None
    class Config:
        from_attributes = True

class AssignmentCreateBase(CamelCaseModel):
    name: str
    topic_id: int
    classroom_asg_id: Optional[str] = None

class NotebookAssignmentCreate(AssignmentCreateBase):
    pass

class PracticeAssignmentCreate(AssignmentCreateBase):
    pass

class ExamAssignmentCreate(AssignmentCreateBase):
    pass

class OtherAssignmentCreate(AssignmentCreateBase):
    pass

class AssignmentUpdate(CamelCaseModel):
    name: Optional[str] = None
    classroom_asg_id: Optional[str] = None

class AllAssignmentsResponse(CamelCaseModel):
    notebook_assignments: List[Assignment]
    practice_assignments: List[Assignment]
    exam_assignments: List[Assignment]
    other_assignments: List[Assignment]