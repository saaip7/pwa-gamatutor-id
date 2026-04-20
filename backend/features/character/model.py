from shared.db import mongo
from bson import ObjectId
from datetime import datetime

DEFAULT_CHARACTER = {
    "gender": "male",
    "equipped": {
        "head": "base",
        "top": "base",
        "bottom": "base",
        "special": None,
    },
}

# Item unlock mapping: (slot, level) -> required badge per gender
# Mirrors FE item-registry.tsx BADGE_DEFINITIONS distribution
ITEM_BADGE_REQUIREMENTS = {
    ("head", "base"): {"male": None, "female": None},
    ("head", "lv1"): {"male": "architect", "female": "deep_diver"},
    ("head", "lv2"): {"male": "marathoner", "female": "ritualist"},
    ("head", "lv3"): {"male": "reflector", "female": "strategist"},
    ("head", "lv4"): {"male": "explorer", "female": "strategist"},
    ("top", "base"): {"male": None, "female": None},
    ("top", "lv1"): {"male": "deep_diver", "female": "architect"},
    ("top", "lv2"): {"male": "marathoner", "female": "ritualist"},
    ("top", "lv3"): {"male": "reflector", "female": "strategist"},
    ("top", "lv4"): {"male": "explorer", "female": "improver"},
    ("top", "lv5"): {"male": "improver", "female": "zenith"},
    ("bottom", "base"): {"male": None, "female": None},
    ("bottom", "lv1"): {"male": "architect", "female": "deep_diver"},
    ("bottom", "lv2"): {"male": "ritualist", "female": "marathoner"},
    ("bottom", "lv3"): {"male": "ritualist", "female": "reflector"},
    ("bottom", "lv4"): {"male": "strategist", "female": "explorer"},
    ("bottom", "lv5"): {"male": "improver", "female": "zenith"},
    ("special", "lv1"): {"male": "reflector", "female": "reflector"},
    ("special", "lv2"): {"male": "improver", "female": "improver"},
    ("special", "lv3"): {"male": "zenith", "female": "zenith"},
}


def _get_user_badge_types(user_id):
    """Return set of unlocked badge type strings for a user."""
    return {
        doc["badge_type"]
        for doc in mongo.db.badges.find({"user_id": user_id}, {"badge_type": 1})
    }


def _validate_equipped(user_id, gender, equipped):
    """Validate equipped items against user's unlocked badges.
    Returns (is_valid, error_message). If invalid, resets to base."""
    unlocked_badges = _get_user_badge_types(user_id)
    valid_slots = {"head", "top", "bottom", "special"}
    valid_levels = {"base", "lv1", "lv2", "lv3", "lv4", "lv5"}
    corrected = {}

    for slot, level in equipped.items():
        if slot not in valid_slots:
            continue
        if level not in valid_levels:
            corrected[slot] = None
            continue

        req = ITEM_BADGE_REQUIREMENTS.get((slot, level))
        if not req:
            corrected[slot] = level
            continue

        required_badge = req.get(gender)
        if required_badge is None:
            corrected[slot] = level
        elif required_badge in unlocked_badges:
            corrected[slot] = level
        else:
            corrected[slot] = "base"

    return corrected


class Character:
    @staticmethod
    def get(user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return DEFAULT_CHARACTER.copy()

        return prefs.get("character", DEFAULT_CHARACTER.copy())

    @staticmethod
    def update(user_id, data):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        updates = {}
        gender = data.get("gender")

        if gender and gender in ("male", "female"):
            updates["character.gender"] = gender
        else:
            current = mongo.db.user_preferences.find_one({"user_id": user_id})
            gender = (current or {}).get("character", DEFAULT_CHARACTER).get("gender", "male")

        if "equipped" in data:
            equipped = data["equipped"]
            validated = _validate_equipped(user_id, gender, equipped)
            for slot, level in validated.items():
                updates[f"character.equipped.{slot}"] = level if level else None

        if not updates:
            return False

        updates["updated_at"] = datetime.utcnow()

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
