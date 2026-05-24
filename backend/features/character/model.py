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
    ("special", "quest_lv1"): {"male": None, "female": None},
    ("special", "quest_lv2"): {"male": None, "female": None},
}


def _get_user_badge_types(user_id):
    """Return set of unlocked badge type strings for a user."""
    return {
        doc["badge_type"]
        for doc in mongo.db.badges.find({"user_id": user_id}, {"badge_type": 1})
    }


def _validate_equipped(user_id, gender, equipped):
    """Validate equipped items against user's unlocked badges + quest items.
    Returns corrected dict. If invalid, resets to base."""
    unlocked_badges = _get_user_badge_types(user_id)

    # Also get quest-unlocked items
    prefs_doc = mongo.db.user_preferences.find_one(
        {"user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id},
        {"quest_unlocked_items": 1},
    )
    quest_items = set()
    for item_key in (prefs_doc or {}).get("quest_unlocked_items", []):
        quest_items.add(item_key)

    valid_slots = {"head", "top", "bottom", "special"}
    valid_levels = {"base", "lv1", "lv2", "lv3", "lv4", "lv5", "quest_lv1", "quest_lv2"}
    corrected = {}

    for slot, level in equipped.items():
        if slot not in valid_slots:
            continue
        if level is None:
            corrected[slot] = None
            continue
        if level not in valid_levels:
            corrected[slot] = "base"
            continue

        item_key = f"{slot}:{level}"
        if level.startswith("quest_"):
            if item_key in quest_items:
                corrected[slot] = level
            else:
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
            return {**DEFAULT_CHARACTER.copy(), "quest_unlocked_items": []}

        char = prefs.get("character", DEFAULT_CHARACTER.copy())
        char["quest_unlocked_items"] = prefs.get("quest_unlocked_items", [])
        return char

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

