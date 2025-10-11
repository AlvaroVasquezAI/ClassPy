from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models import models
from ..schemas import assignment as assignment_schema

# Generic helper 

def get_assignment_by_id(db: Session, model, assignment_id: int):
    """Fetches an assignment by its ID from a given table model."""
    assignment = db.query(model).filter(model.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

def update_assignment(db: Session, model, assignment_id: int, update_data: assignment_schema.AssignmentUpdate):
    """Updates an assignment record."""
    db_assignment = get_assignment_by_id(db, model, assignment_id)
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_assignment, key, value)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def delete_assignment(db: Session, model, assignment_id: int):
    """Deletes an assignment record."""
    db_assignment = get_assignment_by_id(db, model, assignment_id)
    db.delete(db_assignment)
    db.commit()
    return {"ok": True}


# Creator Functions

def create_notebook_assignment(db: Session, assignment: assignment_schema.NotebookAssignmentCreate):
    db_assignment = models.NotebookAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def create_practice_assignment(db: Session, assignment: assignment_schema.PracticeAssignmentCreate):
    db_assignment = models.PracticeAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def create_exam_assignment(db: Session, assignment: assignment_schema.ExamAssignmentCreate):
    db_assignment = models.ExamAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def create_other_assignment(db: Session, assignment: assignment_schema.OtherAssignmentCreate):
    db_assignment = models.OtherAssignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


# CRUD Functions

# Notebook
def update_notebook_assignment(db: Session, assignment_id: int, assignment: assignment_schema.AssignmentUpdate):
    return update_assignment(db, models.NotebookAssignment, assignment_id, assignment)
def delete_notebook_assignment(db: Session, assignment_id: int):
    return delete_assignment(db, models.NotebookAssignment, assignment_id)

# Practice
def update_practice_assignment(db: Session, assignment_id: int, assignment: assignment_schema.AssignmentUpdate):
    return update_assignment(db, models.PracticeAssignment, assignment_id, assignment)
def delete_practice_assignment(db: Session, assignment_id: int):
    return delete_assignment(db, models.PracticeAssignment, assignment_id)

# Exam
def update_exam_assignment(db: Session, assignment_id: int, assignment: assignment_schema.AssignmentUpdate):
    return update_assignment(db, models.ExamAssignment, assignment_id, assignment)
def delete_exam_assignment(db: Session, assignment_id: int):
    return delete_assignment(db, models.ExamAssignment, assignment_id)

# Other
def update_other_assignment(db: Session, assignment_id: int, assignment: assignment_schema.AssignmentUpdate):
    return update_assignment(db, models.OtherAssignment, assignment_id, assignment)
def delete_other_assignment(db: Session, assignment_id: int):
    return delete_assignment(db, models.OtherAssignment, assignment_id)