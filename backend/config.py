import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True")
    PORT = int(os.getenv("PORT", 5001))

    # SMTP Email
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.titan.email")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_FROM = os.getenv("SMTP_FROM", "noreply@gamatutor.id")
