from fastapi import APIRouter, UploadFile, File
import csv
from io import StringIO
import fitz
import re

router = APIRouter()

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")


def _extract_emails_from_csv_rows(rows):
    values = []
    for row in rows:
        values.extend(str(value) for value in row.values())
    return sorted(set(email for value in values for email in EMAIL_PATTERN.findall(value)))

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):

    filename = file.filename.lower()

    # CSV SUPPORT
    if filename.endswith(".csv"):

        content = await file.read()

        csv_data = content.decode("utf-8")

        reader = csv.DictReader(StringIO(csv_data))

        data = list(reader)

        emails = _extract_emails_from_csv_rows(data)

        return {
            "type": "csv",
            "message": "CSV Uploaded Successfully",
            "total_records": len(data),
            "data": data
            ,"emails_found": emails,
            "total_emails": len(emails),
        }

    # PDF SUPPORT
    elif filename.endswith(".pdf"):

        content = await file.read()

        pdf = fitz.open(stream=content, filetype="pdf")

        text = ""

        for page in pdf:
            text += page.get_text()

        emails = EMAIL_PATTERN.findall(text)

        return {
            "type": "pdf",
            "message": "PDF Uploaded Successfully",
            "emails_found": emails,
            "total_emails": len(emails)
        }

    else:
        return {
            "error": "Only CSV and PDF files are supported"
        }