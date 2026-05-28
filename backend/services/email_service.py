import base64
import html
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

import requests

GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


def _build_message(from_email: str, to_email: str, subject: str, message: str, attachment_data: bytes = None, attachment_name: str = None):
    if not from_email:
        raise RuntimeError("Sender email is missing. Pass the signed-in Google email address.")

    body = message or "Hello,\n\nI am Prince Yadav, a Backend & DevOps developer interested in internship opportunities.\n\nThank You."
    html_body = html.escape(body).replace("\n", "<br>")

    mime_message = MIMEMultipart()
    mime_message["to"] = to_email
    mime_message["from"] = from_email
    mime_message["subject"] = subject

    mime_message.attach(MIMEText(html_body, "html"))
    
    if attachment_data and attachment_name:
        part = MIMEApplication(attachment_data)
        part.add_header('Content-Disposition', 'attachment', filename=attachment_name)
        mime_message.attach(part)

    return {"raw": base64.urlsafe_b64encode(mime_message.as_bytes()).decode("utf-8")}


def send_email(to_email, access_token, from_email, message=None, subject="Backend Developer Internship", attachment_data=None, attachment_name=None):
    if not access_token:
        raise RuntimeError("Google access token is missing. Sign in with Google first.")

    payload = _build_message(from_email, to_email, subject, message or "", attachment_data, attachment_name)

    try:
        response = requests.post(
            GMAIL_SEND_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            json=payload,
            timeout=30,
        )
        if response.status_code >= 400:
            raise RuntimeError(response.text)
        return response.json()
    except Exception as exc:
        raise RuntimeError(f"Gmail send failed for {to_email}: {exc}") from exc
