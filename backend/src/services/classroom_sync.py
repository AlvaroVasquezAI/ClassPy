"""
Parse Google Classroom course titles and bootstrap Subjects + Groups.
"""
import re
import json
import unicodedata
from typing import Optional, Dict, List, Set
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from ..models import models
from ..crud import crud_student
from ..schemas import student as student_schema

# Distinct palettes so subjects/groups look varied in the Workspace.
SUBJECT_COLORS = [
    "#749280", "#5B8A72", "#4A7C6F", "#3D6B5E",
    "#6B9AC4", "#5C7CFA", "#7C6BC4", "#9B6BC4",
]

GROUP_COLORS = [
    "#8FBC8F", "#6A9A8B", "#3B82F6", "#6366F1",
    "#8B5CF6", "#EC4899", "#F97316", "#EAB308",
    "#14B8A6", "#0EA5E9", "#84CC16", "#F43F5E",
    "#A855F7", "#22C55E", "#64748B", "#D97706",
    "#0891B2", "#4F46E5", "#DB2777", "#65A30D",
]

GRADE_PATTERN = re.compile(r"^[1-3]$")
LETTER_PATTERN = re.compile(r"^[A-E]$")


def normalize_text(text: str) -> str:
    """Uppercase, strip accents/tildes, trim. 'Química' -> 'QUIMICA'."""
    if not text:
        return ""
    nfkd = unicodedata.normalize("NFD", text.strip())
    without_accents = "".join(c for c in nfkd if not unicodedata.combining(c))
    return without_accents.upper()


def parse_classroom_course_title(title: str) -> Optional[Dict]:
    """
    Extract subject, grade (1-3), and group letter (A-E) from a course title.

    Accepts any order, e.g.:
      - BIOLOGÍA 1° "D"
      - 3 QUIMICA A
      - Química 3° "B"
    """
    if not title or not isinstance(title, str):
        return None

    normalized = normalize_text(title)
    # Degree marks, quotes, and punctuation become separators.
    cleaned = re.sub(r'[°º"\'«»]', " ", normalized)
    cleaned = re.sub(r"[^\w\s]", " ", cleaned)
    tokens = [t for t in cleaned.split() if t]

    grade = None
    letter = None
    subject_tokens: List[str] = []

    for token in tokens:
        if grade is None and GRADE_PATTERN.fullmatch(token):
            grade = int(token)
        elif letter is None and LETTER_PATTERN.fullmatch(token):
            letter = token
        elif len(token) > 1:
            # Multi-letter tokens form the subject name (case-insensitive / accent-free).
            subject_tokens.append(token)
        # Lone letters outside A-E are ignored.

    if grade is None or letter is None or not subject_tokens:
        return None

    return {
        "subject_name": " ".join(subject_tokens),
        "grade": grade,
        "group_letter": letter,
    }


def _next_color(used: Set[str], palette: List[str], index: int) -> str:
    for offset in range(len(palette) * 3):
        color = palette[(index + offset) % len(palette)]
        # Slightly vary if the whole palette is exhausted.
        if color not in used:
            return color
        # Generate a fallback hex if palette is fully used.
        fallback = f"#{(hash(f'{color}-{offset}') & 0xFFFFFF):06X}"
        if fallback not in used and fallback != "#000000":
            return fallback
    return f"#{(index * 37) % 256:02X}{(index * 59) % 256:02X}{(index * 83) % 256:02X}"


def _parse_full_name(full_name: str) -> Dict[str, str]:
    if not full_name or not isinstance(full_name, str):
        return {"first_name": "", "last_name": ""}
    parts = [p for p in full_name.strip().split(" ") if p]
    if len(parts) <= 1:
        return {"first_name": parts[0] if parts else "", "last_name": ""}
    if len(parts) == 2:
        return {"first_name": parts[0], "last_name": parts[1]}
    return {
        "first_name": " ".join(parts[:-2]),
        "last_name": " ".join(parts[-2:]),
    }


def _fetch_active_courses(credentials: Credentials) -> List[dict]:
    service = build("classroom", "v1", credentials=credentials)
    results = service.courses().list(
        pageSize=100,
        fields="courses(id,name,courseState),nextPageToken",
    ).execute()
    courses = results.get("courses", [])
    # Paginate if needed
    page_token = results.get("nextPageToken")
    while page_token:
        results = service.courses().list(
            pageSize=100,
            pageToken=page_token,
            fields="courses(id,name,courseState),nextPageToken",
        ).execute()
        courses.extend(results.get("courses", []))
        page_token = results.get("nextPageToken")

    return [c for c in courses if c.get("courseState") == "ACTIVE"]


def _fetch_roster(credentials: Credentials, course_id: str) -> List[dict]:
    service = build("classroom", "v1", credentials=credentials)
    students = []
    page_token = None
    while True:
        response = service.courses().students().list(
            courseId=course_id,
            pageSize=100,
            pageToken=page_token,
            fields="students(userId,profile(name(fullName))),nextPageToken",
        ).execute()
        students.extend(response.get("students", []))
        page_token = response.get("nextPageToken")
        if not page_token:
            break
    return students


def sync_workspace_from_classroom(
    db: Session,
    teacher: models.Teacher,
    credentials: Optional[Credentials] = None,
) -> dict:
    """
    Create subjects and groups from Active Classroom courses.
    Idempotent: skips already-linked courses and existing grade+letter+subject groups.
    Also imports Classroom rosters into newly created/linked groups.
    """
    if credentials is None:
        if not teacher.google_credentials:
            raise ValueError("Teacher has no Google credentials.")
        creds_info = json.loads(teacher.google_credentials)
        credentials = Credentials.from_authorized_user_info(creds_info)

    courses = _fetch_active_courses(credentials)

    used_subject_colors = {s.color for s in db.query(models.Subject).all()}
    used_group_colors = {g.color for g in db.query(models.Group).all()}

    subjects_by_name: Dict[str, models.Subject] = {
        s.name: s
        for s in db.query(models.Subject).filter(models.Subject.teacher_id == teacher.id).all()
    }

    created_subjects = 0
    created_groups = 0
    linked_groups = 0
    imported_students = 0
    skipped = 0
    unparsed = []

    subject_color_index = len(subjects_by_name)
    group_color_index = db.query(models.Group).count()

    for course in courses:
        course_id = course.get("id")
        course_name = course.get("name") or ""
        parsed = parse_classroom_course_title(course_name)

        if not parsed:
            unparsed.append(course_name)
            skipped += 1
            continue

        subject_name = parsed["subject_name"]
        grade = parsed["grade"]
        letter = parsed["group_letter"]

        # --- Subject (get or create) ---
        subject = subjects_by_name.get(subject_name)
        if not subject:
            color = _next_color(used_subject_colors, SUBJECT_COLORS, subject_color_index)
            subject_color_index += 1
            used_subject_colors.add(color)

            subject = models.Subject(
                name=subject_name,
                color=color,
                teacher_id=teacher.id,
            )
            db.add(subject)
            db.flush()
            subjects_by_name[subject_name] = subject
            created_subjects += 1

        # --- Already linked to this Classroom course? ---
        existing_link = (
            db.query(models.ClassroomGroup)
            .filter(models.ClassroomGroup.classroom_course_id == course_id)
            .first()
        )
        if existing_link:
            skipped += 1
            continue

        # --- Group (get or create by subject + grade + letter) ---
        db_group = (
            db.query(models.Group)
            .filter(
                models.Group.subject_id == subject.id,
                models.Group.grade == grade,
                models.Group.name == letter,
            )
            .first()
        )

        if not db_group:
            color = _next_color(used_group_colors, GROUP_COLORS, group_color_index)
            group_color_index += 1
            used_group_colors.add(color)

            db_group = models.Group(
                name=letter,
                grade=grade,
                subject_id=subject.id,
                color=color,
            )
            db.add(db_group)
            db.flush()
            created_groups += 1
        else:
            linked_groups += 1

        # Link Classroom course
        db.add(
            models.ClassroomGroup(
                group_id=db_group.id,
                classroom_course_id=course_id,
            )
        )
        db.flush()

        # Import roster (same as manual group create)
        try:
            roster = _fetch_roster(credentials, course_id)
            students_payload = []
            for roster_student in roster:
                full_name = (
                    roster_student.get("profile", {})
                    .get("name", {})
                    .get("fullName", "")
                )
                names = _parse_full_name(full_name)
                students_payload.append(
                    student_schema.StudentFromClassroom(
                        first_name=names["first_name"] or "Student",
                        last_name=names["last_name"] or "",
                        classroom_user_id=roster_student.get("userId"),
                    )
                )
            if students_payload:
                created = crud_student.create_students_from_roster(
                    db=db,
                    group_id=db_group.id,
                    students=students_payload,
                )
                imported_students += len(created)
        except Exception as roster_err:
            print(f"Roster import failed for course {course_id}: {roster_err}")

    db.commit()

    return {
        "courses_seen": len(courses),
        "subjects_created": created_subjects,
        "groups_created": created_groups,
        "groups_linked": linked_groups,
        "students_imported": imported_students,
        "skipped": skipped,
        "unparsed_titles": unparsed,
    }
