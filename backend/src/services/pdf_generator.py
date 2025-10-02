import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
import qrcode

def generate_qr_cards_pdf(students: list, group_name: str, subject_name: str):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    CARD_WIDTH = 2.25 * inch
    CARD_HEIGHT = 3.25 * inch
    H_MARGIN = (width - 3 * CARD_WIDTH) / 2
    V_MARGIN = (height - 3 * CARD_HEIGHT) / 2
    
    for i, student in enumerate(students):
        page_index = i % 9
        if i > 0 and page_index == 0:
            p.showPage()

        row = page_index // 3
        col = page_index % 3

        card_x = H_MARGIN + col * CARD_WIDTH
        card_y = height - V_MARGIN - (row + 1) * CARD_HEIGHT

        p.roundRect(card_x, card_y, CARD_WIDTH, CARD_HEIGHT, radius=12)

        # HEADER
        first_name = student.first_name
        name_y = card_y + CARD_HEIGHT - 0.4 * inch
        p.setFont("Helvetica-Bold", 12) 
        p.drawCentredString(card_x + CARD_WIDTH / 2, name_y, first_name)

        group_subject = f"{group_name} - {subject_name}"
        group_y = name_y - (0.2 * inch) 
        p.setFont("Helvetica", 7) 
        p.drawCentredString(card_x + CARD_WIDTH / 2, group_y, group_subject)

        # QR CODE
        qr_img = qrcode.make(student.qr_code_id, box_size=10, border=2)
        qr_pil_img = qr_img.convert("RGB")
        qr_image_reader = ImageReader(qr_pil_img)
        
        QR_SIZE = 1.9 * inch
        qr_x = card_x + (CARD_WIDTH - QR_SIZE) / 2

        qr_y = card_y + (CARD_HEIGHT - QR_SIZE) / 2 - (0.05 * inch)
        p.drawImage(qr_image_reader, qr_x, qr_y, width=QR_SIZE, height=QR_SIZE, mask='auto')

        # QR ID TEXT
        p.setFont("Helvetica", 8)
        p.drawCentredString(card_x + CARD_WIDTH / 2, qr_y - 0.25 * inch, student.qr_code_id)

    p.save()
    buffer.seek(0)
    return buffer