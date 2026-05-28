from fastapi import APIRouter, Query
from services.email_service import send_email

router = APIRouter()

@router.get("/send-test-mail")
def send_test_mail(
    access_token: str = Query(...),
    from_email: str = Query(...),
):

    try:

        response = send_email(
            "thestudent.7600@gmail.com",
            access_token,
            from_email,
        )

        return {
            "message": "Mail Sent Successfully",
            "response": response
        }

    except Exception as e:

        return {
            "error": str(e)
        }