import io
from fastapi import APIRouter, HTTPException, Depends
from starlette.responses import StreamingResponse
from sqlalchemy.orm import Session
import qrcode
from ...database import SessionLocal
from ...models import models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/qr-code/{student_qr_id}.png", tags=["qr_code"])
def generate_qr_code(student_qr_id: str, db: Session = Depends(get_db)):
    student = db.query(models.Student).filter(models.Student.qr_code_id == student_qr_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student with this QR ID not found")

    img = qrcode.make(student_qr_id)
    
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0) 

    return StreamingResponse(buf, media_type="image/png")