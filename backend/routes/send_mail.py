from fastapi import APIRouter
from services.email_service import send_email

router = APIRouter()

@router.get("/send-test-mail")
def send_test_mail():

    try:

        response = send_email("thestudent.7600@gmail.com")

        return {
            "message": "Mail Sent Successfully",
            "response": response
        }

    except Exception as e:

        return {
            "error": str(e)
        }