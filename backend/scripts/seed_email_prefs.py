"""One-time migration: Seed default email preferences for existing users.

Opt-out model: by default all email categories are ENABLED.
This script adds the email prefs to user_preferences that were created
before the email preference feature existed.

Usage:
    python scripts/seed_email_prefs.py
"""
import sys
import os

# Ensure backend root is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/gamatutor")

DEFAULT_EMAIL_PREFS = {
    "deadline": True,
    "smart_reminder": True,
    "streak_nudge": True,
    "social": True,
    "study_session": True,
}


def main():
    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]

    # Find all user_preferences without email prefs
    query = {
        "$or": [
            {"notifications.email": {"$exists": False}},
            {"notifications.email": None},
            {"notifications.email": {}},
        ]
    }

    result = db.user_preferences.update_many(
        query,
        {"$set": {"notifications.email": DEFAULT_EMAIL_PREFS}},
    )

    print(f"Matched: {result.matched_count}")
    print(f"Modified: {result.modified_count}")
    print("Done.")


if __name__ == "__main__":
    main()
