
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.upload import router as upload_router
from routes.send_mail import router as send_router
from routes.bulk_mail import router as bulk_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(send_router)
app.include_router(bulk_router)

@app.get("/")
def home():
    return {
        "message": "Cold Mail AI Agent Running"
    }