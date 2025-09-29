from pydantic import BaseModel
from .teacher import CamelCaseModel

class ScheduleBase(CamelCaseModel):
    group_id: int
    day_of_week: str
    start_time: str
    end_time: str

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int