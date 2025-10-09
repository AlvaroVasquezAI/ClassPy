import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow

from ...database import SessionLocal
from ...crud import crud_teacher
from ...models import models

router = APIRouter()

SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
]

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/auth/google/login", tags=["auth"])
def auth_google():
    client_secrets = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("REDIRECT_URI")],
        }
    }
    
    flow = Flow.from_client_config(
        client_config=client_secrets,
        scopes=SCOPES,
        redirect_uri=os.getenv("REDIRECT_URI")
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    return RedirectResponse(authorization_url)

@router.get("/auth/google/callback", tags=["auth"])
def auth_google_callback(code: str, db: Session = Depends(get_db)):
    client_secrets = {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("REDIRECT_URI")],
        }
    }

    flow = Flow.from_client_config(
        client_config=client_secrets,
        scopes=SCOPES,
        redirect_uri=os.getenv("REDIRECT_URI")
    )
    
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    teacher = crud_teacher.get_teacher(db)
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher profile not found")

    teacher.google_credentials = credentials.to_json()
    teacher.is_google_connected = True
    db.commit()

    return RedirectResponse(url="http://localhost:3000/classroom")