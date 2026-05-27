from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from services.email_service import send_email

router = APIRouter()

# Request Body Model

class BulkMailRequest(BaseModel):

    emails: List[str]

    message: str


@router.post("/send-bulk-mails")
def send_bulk_mails(data: BulkMailRequest):

    success = []
    failed = []

    for email in data.emails:

        try:

            send_email(email)

            success.append(email)

        except Exception as e:

            failed.append({
                "email": email,
                "error": str(e)
            })

    return {
        "total": len(data.emails),
        "success_count": len(success),
        "failed_count": len(failed),
        "success_emails": success,
        "failed_emails": failed
    }