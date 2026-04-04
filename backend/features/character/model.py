from shared.db import mongo
from bson import ObjectId
from datetime import datetime

# Default character state
DEFAULT_CHARACTER = {
    "gender": "male",
    "equipped": {
        "head": "base",
        "top": "base",
        "bottom": "base",
        "special": None,
    },
}


class Character:
    @staticmethod
    def get(user_id):
        """Get character data (gender + equipped items)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return DEFAULT_CHARACTER.copy()

        return prefs.get("character", DEFAULT_CHARACTER.copy())

    @staticmethod
    def update(user_id, data):
        """Update character data (gender and/or equipped items)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        updates = {}

        if "gender" in data and data["gender"] in ("male", "female"):
            updates["character.gender"] = data["gender"]

        if "equipped" in data:
            equipped = data["equipped"]
            valid_slots = {"head", "top", "bottom", "special"}
            valid_levels = {"base", "lv1", "lv2", "lv3", "lv4", "lv5"}
            for slot, level in equipped.items():
                if slot in valid_slots:
                    updates[f"character.equipped.{slot}"] = level if level in valid_levels else None

        if not updates:
            return False

        updates["updated_at"] = datetime.utcnow()

        # Ensure character field exists with defaults first
        mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$setOnInsert": {"character": DEFAULT_CHARACTER.copy()}},
            upsert=True,
        )

        mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": updates},
        )
        return True
