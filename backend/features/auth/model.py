from werkzeug.security import generate_password_hash, check_password_hash
from shared.db import mongo
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Default user_preferences template
DEFAULT_PREFERENCES = {
    "notifications": {
        "push_enabled": True,
        "smart_reminder_enabled": True,
        "reminder_time": "09:00",
        "quiet_hours": {"enabled": False, "start": "22:00", "end": "07:00"},
        "social_presence_enabled": False,
    },
    "theme": {
        "mode": "auto",
        "color_scheme": "purple",
        "custom_colors": {"primary": "#8B5CF6", "secondary": "#EC4899"},
    },
    "onboarding": {
        "completed": False,
        "current_step": 0,
        "skipped_tour": False,
        "completed_at": None,
    },
    "fcm_token": None,
    "streak": {
        "current": 0,
        "longest": 0,
        "last_active_date": None,
        "updated_at": None,
    },
}


class User:
    @staticmethod
    def create(name, email, username, password, role="user"):
        hashed = generate_password_hash(password)
        doc = {
            "name": name,
            "email": email,
            "username": username,
            "password": hashed,
            "role": role,
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.users.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_username(username):
        return mongo.db.users.find_one({"username": username})

    @staticmethod
    def find_by_email(email):
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        try:
            return mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def validate_password(user, password):
        try:
            return check_password_hash(user["password"], password)
        except Exception:
            return False

    @staticmethod
    def update(user_id, updates):
        result = mongo.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
        return result.modified_count > 0

    @staticmethod
    def update_password(user_id, new_password):
        hashed = generate_password_hash(new_password)
        result = mongo.db.users.update_one(
            {"_id": ObjectId(user_id)}, {"$set": {"password": hashed}}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(user_id):
        result = mongo.db.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    @staticmethod
    def create_default_preferences(user_id):
        """Create default user_preferences document for a new user."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {**DEFAULT_PREFERENCES, "user_id": user_id, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
        mongo.db.user_preferences.insert_one(doc)
