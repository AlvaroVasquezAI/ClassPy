from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from googleapiclient.errors import HttpError

from ...database import SessionLocal
from ...models import models
from .classroom import get_classroom_service 

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/grades/topic/{topic_id}", response_model=Dict[str, Any])
def get_grades_for_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    service=Depends(get_classroom_service)
):
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    if not db_topic.subject.groups:
        raise HTTPException(status_code=404, detail="No group associated with this topic's subject")
    db_group = db_topic.subject.groups[0]

    if not db_group.classroom_group or not db_group.classroom_group.classroom_course_id:
        raise HTTPException(status_code=400, detail="The group for this topic is not linked to Google Classroom.")
    
    classroom_course_id = db_group.classroom_group.classroom_course_id

    db_students = db.query(models.Student).filter(models.Student.group_id == db_group.id).all()
    student_map = {student.classroom_user_id: student for student in db_students if student.classroom_user_id}
    
    if not student_map:
        return {"assignments": [], "grades": {}} 

    all_assignments = []
    assignment_types = [
        (models.NotebookAssignment, "Notebook"),
        (models.PracticeAssignment, "Practices"),
        (models.ExamAssignment, "Exam"),
        (models.OtherAssignment, "Others")
    ]
    for model, category in assignment_types:
        linked_assignments = db.query(model).filter(
            model.topic_id == topic_id,
            model.classroom_asg_id.isnot(None)
        ).all()
        for asg in linked_assignments:
            all_assignments.append({"db_asg": asg, "category": category})

    if not all_assignments:
        return {"assignments": [], "grades": {}} 

    grades_by_student_id = {student.id: {} for student in db_students}

    try:
        for asg_info in all_assignments:
            db_asg = asg_info['db_asg']
            submissions_result = service.courses().courseWork().studentSubmissions().list(
                courseId=classroom_course_id,
                courseWorkId=db_asg.classroom_asg_id,
                fields='studentSubmissions(userId,assignedGrade)'
            ).execute()

            submissions = submissions_result.get('studentSubmissions', [])

            for sub in submissions:
                classroom_user_id = sub.get('userId')
                student_in_db = student_map.get(classroom_user_id)
                
                if student_in_db:
                    grade = sub.get('assignedGrade', None)
                    grades_by_student_id[student_in_db.id][db_asg.id] = grade

    except HttpError as error:
        raise HTTPException(status_code=error.resp.status, detail=f"An error occurred with the Google Classroom API: {error}")
    
    response_assignments = [
        {"id": asg_info['db_asg'].id, "name": asg_info['db_asg'].name, "category": asg_info['category']}
        for asg_info in all_assignments
    ]

    return {"assignments": response_assignments, "grades": grades_by_student_id}