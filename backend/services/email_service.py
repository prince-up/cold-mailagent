import os

import resend


resend.api_key = os.getenv("RESEND_API_KEY", "")


def send_email(to_email, message=None):

    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY is missing. Set it in your backend environment.")

    email_html = message or """<h1>Hello</h1>

        <p>
        I am Prince Yadav, a Backend & DevOps developer.
        I would love to connect regarding internship opportunities.
        </p>

        <p>Thank You</p>"""

    params = {
        "from": "onboarding@resend.dev",
        "to": [to_email],
        "subject": "Backend Developer Internship",
        "html": email_html
    }

    try:
        return resend.Emails.send(params)
    except Exception as exc:
        raise RuntimeError(f"Resend send failed for {to_email}: {exc}") from exc