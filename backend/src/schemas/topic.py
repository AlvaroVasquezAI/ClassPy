from pydantic import BaseModel, Field
from typing import Optional
from .teacher import CamelCaseModel

class TopicBase(CamelCaseModel):
    name: str
    exam_weight: float = Field(..., ge=0, le=100)
    practice_weight: float = Field(..., ge=0, le=100)
    notebook_weight: float = Field(..., ge=0, le=100)
    other_weight: float = Field(..., ge=0, le=100)

class TopicCreate(TopicBase):
    period_id: int
    subject_id: int

class TopicUpdate(CamelCaseModel):
    name: Optional[str] = None
    exam_weight: Optional[float] = Field(None, ge=0, le=100)
    practice_weight: Optional[float] = Field(None, ge=0, le=100)
    notebook_weight: Optional[float] = Field(None, ge=0, le=100)
    other_weight: Optional[float] = Field(None, ge=0, le=100)

class Topic(TopicBase):
    id: int
    period_id: int
    subject_id: int