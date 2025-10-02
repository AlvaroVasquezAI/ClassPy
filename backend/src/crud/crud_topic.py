from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models import models
from ..schemas import topic as topic_schema

def create_topic(db: Session, topic: topic_schema.TopicCreate):
    if (topic.exam_weight + topic.practice_weight + topic.notebook_weight + topic.other_weight) != 100:
        raise HTTPException(status_code=400, detail="The sum of all weights must be 100.")

    db_topic = models.Topic(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def get_topics_by_period_and_subject(db: Session, period_id: int, subject_id: int):
    return db.query(models.Topic).filter(
        models.Topic.period_id == period_id,
        models.Topic.subject_id == subject_id
    ).all()

def update_topic(db: Session, topic_id: int, topic_update: topic_schema.TopicUpdate):
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    update_data = topic_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_topic, key, value)

    total_weight = (db_topic.exam_weight + db_topic.practice_weight + 
                    db_topic.notebook_weight + db_topic.other_weight)
    if total_weight != 100:
        db.rollback() 
        raise HTTPException(status_code=400, detail="The sum of all weights must be 100.")

    db.commit()
    db.refresh(db_topic)
    return db_topic

def delete_topic(db: Session, topic_id: int):
    db_topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(db_topic)
    db.commit()
    return {"ok": True}