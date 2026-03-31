from shared.db import mongo
from bson import ObjectId
from datetime import datetime

BADGE_DEFINITIONS = [
    # Foundation
    {"type": "initiator", "name": "Initiator", "category": "foundation", "shape": "diamond", "description": "Buat task pertamamu", "condition": "first_task"},
    {"type": "architect", "name": "Architect", "category": "foundation", "shape": "diamond", "description": "Buat 5 rencana belajar detail", "condition": "five_plans"},
    # Performance
    {"type": "deep_diver", "name": "Deep Diver", "category": "performance", "shape": "hexagon", "description": "Selesaikan 3 sesi fokus", "condition": "three_sessions"},
    {"type": "marathoner", "name": "Marathoner", "category": "performance", "shape": "hexagon", "description": "Riwayat 14 hari berturut-turut", "condition": "streak_14"},
    {"type": "ritualist", "name": "Ritualist", "category": "performance", "shape": "hexagon", "description": "Riwayat 7 hari berturut-turut", "condition": "streak_7"},
    # Mindset
    {"type": "reflector", "name": "Reflector", "category": "mindset", "shape": "circle", "description": "Selesaikan 5 refleksi diri", "condition": "five_reflections"},
    {"type": "strategist", "name": "Strategist", "category": "mindset", "shape": "circle", "description": "Gunakan 3 strategi belajar berbeda", "condition": "three_strategies"},
    {"type": "explorer", "name": "Explorer", "category": "mindset", "shape": "circle", "description": "Selesaikan task di 3 mata kuliah berbeda", "condition": "three_courses"},
    # Mastery
    {"type": "improver", "name": "Improver", "category": "mastery", "shape": "shield", "description": "Tingkatkan confidence rating 3 kali", "condition": "confidence_improve_3"},
    {"type": "zenith", "name": "Zenith", "category": "mastery", "shape": "shield", "description": "Buka 7 badge lainnya", "condition": "seven_badges"},
]


class Badge:
    @staticmethod
    def get_all_badges(user_id):
        """Get all badge definitions with user's unlock status."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        unlocked = list(mongo.db.badges.find({"user_id": user_id}))
        unlocked_map = {b["badge_type"]: b for b in unlocked}

        result = []
        for defn in BADGE_DEFINITIONS:
            badge_data = {**defn}
            if defn["type"] in unlocked_map:
                u = unlocked_map[defn["type"]]
                badge_data["unlocked"] = True
                badge_data["unlocked_at"] = u.get("unlocked_at")
                badge_data["displayed"] = u.get("displayed", False)
            else:
                badge_data["unlocked"] = False
                badge_data["unlocked_at"] = None
                badge_data["displayed"] = False
            result.append(badge_data)
        return result

    @staticmethod
    def get_stats(user_id):
        """Get badge unlock stats."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        unlocked_count = mongo.db.badges.count_documents({"user_id": user_id})
        return {"unlocked": unlocked_count, "total": len(BADGE_DEFINITIONS)}

    @staticmethod
    def unlock(user_id, badge_type):
        """Unlock a badge for a user. Returns (doc, already_had)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": badge_type})
        if existing:
            return existing, True

        doc = {
            "user_id": user_id,
            "badge_type": badge_type,
            "displayed": False,
            "unlocked_at": datetime.utcnow(),
        }
        result = mongo.db.badges.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc, False

    @staticmethod
    def mark_displayed(user_id, badge_type):
        """Mark a badge as displayed (celebration shown)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        result = mongo.db.badges.update_one(
            {"user_id": user_id, "badge_type": badge_type},
            {"$set": {"displayed": True}}
        )
        return result.modified_count > 0

    @staticmethod
    def count_unlocked(user_id):
        """Count how many badges a user has unlocked."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.badges.count_documents({"user_id": user_id})
