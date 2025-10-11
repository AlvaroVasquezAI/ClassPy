from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ... import models 
from ...crud import crud_group
from ...schemas import group as group_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/groups", response_model=group_schema.Group)
def create_group(group: group_schema.GroupCreate, db: Session = Depends(get_db)):
    return crud_group.create_group(db=db, group=group)

@router.get("/groups", response_model=List[group_schema.Group])
def read_groups(db: Session = Depends(get_db)):
    return crud_group.get_groups_by_teacher(db=db, teacher_id=1)

@router.get("/groups/{group_id}", response_model=group_schema.GroupDetails)
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.models.Group).filter(models.models.Group.id == group_id).first()
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    crud_group.delete_group(db=db, group_id=group_id)
    return {"ok": True}

@router.put("/groups/{group_id}", response_model=group_schema.Group)
def update_group(group_id: int, group: group_schema.GroupUpdate, db: Session = Depends(get_db)):
    return crud_group.update_group(db=db, group_id=group_id, group_update=group)