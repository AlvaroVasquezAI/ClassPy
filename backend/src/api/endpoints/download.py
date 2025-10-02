from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
from ...database import SessionLocal
from ...crud import crud_student
from ...models import models
from ...services.pdf_generator import generate_qr_cards_pdf

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/download/qr-codes/{group_id}.pdf")
def download_qr_codes_pdf(group_id: int, db: Session = Depends(get_db)):
    students = crud_student.get_students_by_group(db, group_id=group_id)
    if not students:
        raise HTTPException(status_code=404, detail="No students found for this group.")

    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found.")
    
    group_name_text = f"{group.grade}{group.name}"
    subject_name_text = group.subject.name

    pdf_buffer = generate_qr_cards_pdf(students, group_name_text, subject_name_text)

    return StreamingResponse(
        pdf_buffer,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="qr_codes_{group_name_text}.pdf"'}
    )