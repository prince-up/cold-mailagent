import resend

resend.api_key = "re_J2nJoL8Z_FTfRyRuHqhD8kU7F9pHLGT4w"

def send_email(to_email):

    params = {
        "from": "onboarding@resend.dev",
        "to": [to_email],
        "subject": "Backend Developer Internship",
        "html": """
        <h1>Hello</h1>

        <p>
        I am Prince Yadav, a Backend & DevOps developer.
        I would love to connect regarding internship opportunities.
        </p>

        <p>Thank You</p>
        """
    }

    email = resend.Emails.send(params)

    return email