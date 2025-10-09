from pydantic import BaseModel, EmailStr
from typing import Optional

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = to_camel
        populate_by_name = True 
        from_attributes = True

class TeacherCreate(CamelCaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class Teacher(CamelCaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    profile_photo_url: Optional[str] = None
    is_google_connected: bool