from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database import SessionLocal
from ...crud import crud_topic
from ...schemas import topic as topic_schema

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/topics", response_model=topic_schema.Topic, status_code=status.HTTP_201_CREATED)
def create_topic(topic: topic_schema.TopicCreate, db: Session = Depends(get_db)):
    return crud_topic.create_topic(db=db, topic=topic)

@router.get("/topics/by-period-subject", response_model=List[topic_schema.Topic])
def read_topics(period_id: int, subject_id: int, db: Session = Depends(get_db)):
    return crud_topic.get_topics_by_period_and_subject(db=db, period_id=period_id, subject_id=subject_id)

@router.put("/topics/{topic_id}", response_model=topic_schema.Topic)
def update_topic(topic_id: int, topic: topic_schema.TopicUpdate, db: Session = Depends(get_db)):
    return crud_topic.update_topic(db=db, topic_id=topic_id, topic_update=topic)

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    crud_topic.delete_topic(db=db, topic_id=topic_id)
    return {"ok": True}