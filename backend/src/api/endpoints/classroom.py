import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ...database import SessionLocal
from ...crud import crud_teacher

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_classroom_service(db: Session = Depends(get_db)):
    teacher = crud_teacher.get_teacher(db)
    if not teacher or not teacher.google_credentials:
        raise HTTPException(status_code=401, detail="Google account not connected.")
    
    creds_info = json.loads(teacher.google_credentials)
    credentials = Credentials.from_authorized_user_info(creds_info)
    
    try:
        service = build('classroom', 'v1', credentials=credentials)
        return service
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build Google Classroom service: {e}")

@router.get("/classroom/courses", tags=["classroom"])
def get_courses(service=Depends(get_classroom_service)):
    try:
        results = service.courses().list(
            pageSize=20,
            fields='courses(id,name,enrollmentCode,courseState)'
        ).execute()
        active_courses = [c for c in results.get('courses', []) if c.get('courseState') == 'ACTIVE']
        return active_courses
    except HttpError as error:
        raise HTTPException(status_code=error.resp.status, detail=f"An error occurred: {error}")

@router.get("/classroom/courses/{course_id}/coursework", tags=["classroom"])
def get_coursework(course_id: str, service=Depends(get_classroom_service)):
    try:
        results = service.courses().courseWork().list(courseId=course_id).execute()
        return results.get('courseWork', [])
    except HttpError as error:
        raise HTTPException(status_code=error.resp.status, detail=f"An error occurred: {error}")

@router.get("/classroom/courses/{course_id}/coursework/{coursework_id}/submissions", tags=["classroom"])
def get_submissions(course_id: str, coursework_id: str, service=Depends(get_classroom_service)):
    try:
        results = service.courses().courseWork().studentSubmissions().list(
            courseId=course_id,
            courseWorkId=coursework_id
        ).execute()
        return results.get('studentSubmissions', [])
    except HttpError as error:
        raise HTTPException(status_code=error.resp.status, detail=f"An error occurred: {error}")
    
@router.get("/classroom/courses/{course_id}/students", tags=["classroom"])
def get_roster(course_id: str, service=Depends(get_classroom_service)):
    try:
        students = []
        page_token = None
        while True:
            response = service.courses().students().list(
                courseId=course_id,
                pageSize=100,
                pageToken=page_token,
                fields='students(userId,profile(name(fullName))),nextPageToken'
            ).execute()
            students.extend(response.get('students', []))
            page_token = response.get('nextPageToken', None)
            if not page_token:
                break
        return students
    except HttpError as error:
        raise HTTPException(status_code=error.resp.status, detail=f"An error occurred: {error}")
    
@router.get("/classroom/user/profile", tags=["classroom"])
def get_user_profile(service=Depends(get_classroom_service)):
    try:
        user_profile = service._http.request('https://www.googleapis.com/oauth2/v2/userinfo')
        return json.loads(user_profile[1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {e}")