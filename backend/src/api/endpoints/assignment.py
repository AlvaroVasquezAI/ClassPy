from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_assignment
from ...schemas import assignment as assignment_schema
from ...models import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- GET Endpoint ---
@router.get("/assignments/by-topic/{topic_id}", response_model=assignment_schema.AllAssignmentsResponse)
def get_all_assignments_for_topic(topic_id: int, db: Session = Depends(get_db)):
    return {
        "notebook_assignments": db.query(models.NotebookAssignment).filter(models.NotebookAssignment.topic_id == topic_id).all(),
        "practice_assignments": db.query(models.PracticeAssignment).filter(models.PracticeAssignment.topic_id == topic_id).all(),
        "exam_assignments": db.query(models.ExamAssignment).filter(models.ExamAssignment.topic_id == topic_id).all(),
        "other_assignments": db.query(models.OtherAssignment).filter(models.OtherAssignment.topic_id == topic_id).all()
    }

# --- POST Endpoints ---
@router.post("/assignments/notebook", response_model=assignment_schema.Assignment)
def create_notebook_assignment(assignment: assignment_schema.NotebookAssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.create_notebook_assignment(db=db, assignment=assignment)

@router.post("/assignments/practice", response_model=assignment_schema.Assignment)
def create_practice_assignment(assignment: assignment_schema.PracticeAssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.create_practice_assignment(db=db, assignment=assignment)

@router.post("/assignments/exam", response_model=assignment_schema.Assignment)
def create_exam_assignment(assignment: assignment_schema.ExamAssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.create_exam_assignment(db=db, assignment=assignment)

@router.post("/assignments/other", response_model=assignment_schema.Assignment)
def create_other_assignment(assignment: assignment_schema.OtherAssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.create_other_assignment(db=db, assignment=assignment)

# --- PUT Endpoints ---
@router.put("/assignments/notebook/{assignment_id}", response_model=assignment_schema.Assignment)
def update_notebook_assignment(assignment_id: int, assignment: assignment_schema.AssignmentUpdate, db: Session = Depends(get_db)):
    return crud_assignment.update_notebook_assignment(db, assignment_id, assignment)

@router.put("/assignments/practice/{assignment_id}", response_model=assignment_schema.Assignment)
def update_practice_assignment(assignment_id: int, assignment: assignment_schema.AssignmentUpdate, db: Session = Depends(get_db)):
    return crud_assignment.update_practice_assignment(db, assignment_id, assignment)

@router.put("/assignments/exam/{assignment_id}", response_model=assignment_schema.Assignment)
def update_exam_assignment(assignment_id: int, assignment: assignment_schema.AssignmentUpdate, db: Session = Depends(get_db)):
    return crud_assignment.update_exam_assignment(db, assignment_id, assignment)

@router.put("/assignments/other/{assignment_id}", response_model=assignment_schema.Assignment)
def update_other_assignment(assignment_id: int, assignment: assignment_schema.AssignmentUpdate, db: Session = Depends(get_db)):
    return crud_assignment.update_other_assignment(db, assignment_id, assignment)

# --- DELETE Endpoints ---
@router.delete("/assignments/notebook/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notebook_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return crud_assignment.delete_notebook_assignment(db, assignment_id=assignment_id)

@router.delete("/assignments/practice/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_practice_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return crud_assignment.delete_practice_assignment(db, assignment_id=assignment_id)

@router.delete("/assignments/exam/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return crud_assignment.delete_exam_assignment(db, assignment_id=assignment_id)

@router.delete("/assignments/other/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_other_assignment(assignment_id: int, db: Session = Depends(get_db)):
    return crud_assignment.delete_other_assignment(db, assignment_id=assignment_id)