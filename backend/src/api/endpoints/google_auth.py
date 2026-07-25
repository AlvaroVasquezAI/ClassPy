import os
from typing import Tuple
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from ...database import SessionLocal
from ...crud import crud_teacher
from ...schemas import teacher as teacher_schema
from ...services.classroom_sync import sync_workspace_from_classroom

router = APIRouter()

SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly'
]

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _client_secrets():
    return {
        "web": {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.getenv("REDIRECT_URI")],
        }
    }


def _names_from_google(user_info: dict) -> Tuple[str, str]:
    first_name = (user_info.get("given_name") or "").strip()
    last_name = (user_info.get("family_name") or "").strip()

    if not first_name and not last_name:
        full_name = (user_info.get("name") or "").strip()
        if full_name:
            parts = full_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

    if not first_name:
        first_name = "Teacher"

    return first_name, last_name


@router.get("/auth/google/login", tags=["auth"])
def auth_google():
    flow = Flow.from_client_config(
        client_config=_client_secrets(),
        scopes=SCOPES,
        redirect_uri=os.getenv("REDIRECT_URI")
    )

    authorization_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
    )

    return RedirectResponse(authorization_url)


@router.get("/auth/google/callback", tags=["auth"])
def auth_google_callback(
    code: str,
    db: Session = Depends(get_db),
):
    flow = Flow.from_client_config(
        client_config=_client_secrets(),
        scopes=SCOPES,
        redirect_uri=os.getenv("REDIRECT_URI")
    )

    flow.fetch_token(code=code)
    credentials = flow.credentials

    try:
        oauth2_service = build('oauth2', 'v2', credentials=credentials)
        user_info = oauth2_service.userinfo().get().execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Google user profile: {e}"
        )

    email = user_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not return an email address."
        )

    first_name, last_name = _names_from_google(user_info)

    teacher = crud_teacher.get_teacher(db)
    is_new_signup = teacher is None

    if is_new_signup:
        teacher_data = teacher_schema.TeacherCreate(
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        teacher = crud_teacher.create_teacher(db=db, teacher=teacher_data)

    teacher.google_credentials = credentials.to_json()
    teacher.is_google_connected = True
    db.commit()
    db.refresh(teacher)

    if is_new_signup:
        try:
            sync_result = sync_workspace_from_classroom(db, teacher, credentials)
            print(f"Classroom workspace sync completed: {sync_result}")
        except Exception as sync_err:
            # Signup still succeeds; workspace can be synced later via API.
            print(f"Classroom workspace sync failed: {sync_err}")
        return RedirectResponse(url=f"{FRONTEND_URL}/?google_setup=1")

    return RedirectResponse(url=f"{FRONTEND_URL}/classroom")
