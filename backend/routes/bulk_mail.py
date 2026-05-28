from fastapi import APIRouter, Form, UploadFile, File
import json
from typing import List, Optional

from services.email_service import send_email

router = APIRouter()

@router.post("/send-bulk-mails")
async def send_bulk_mails(
    emails: str = Form(...),
    message: str = Form(...),
    access_token: str = Form(...),
    from_email: str = Form(...),
    subject: str = Form("Backend Developer Internship"),
    resume: Optional[UploadFile] = File(None)
):
    try:
        emails_list = json.loads(emails)
    except json.JSONDecodeError:
        return {"error": "Invalid emails format"}

    attachment_data = None
    attachment_name = None
    if resume:
        attachment_data = await resume.read()
        attachment_name = resume.filename

    success = []
    failed = []

    for email in emails_list:
        try:
            send_email(
                to_email=email,
                access_token=access_token,
                from_email=from_email,
                message=message,
                subject=subject,
                attachment_data=attachment_data,
                attachment_name=attachment_name
            )
            success.append(email)
        except Exception as e:
            failed.append({
                "email": email,
                "error": str(e)
            })

    return {
        "total": len(emails_list),
        "success_count": len(success),
        "failed_count": len(failed),
        "success_emails": success,
        "failed_emails": failed,
        "message": "Bulk mail attempt finished",
    }