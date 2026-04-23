from shared.db import mongo
from bson import ObjectId
from datetime import datetime


class Announcement:
    @staticmethod
    def create(title, body):
        doc = {
            "title": title,
            "body": body,
            "is_active": True,
            "dismissed_by": [],
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.announcements.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    @staticmethod
    def get_active(user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        announcements = list(
            mongo.db.announcements.find({
                "is_active": True,
                "dismissed_by": {"$ne": user_id},
            }).sort("created_at", -1)
        )
        for a in announcements:
            a["_id"] = str(a["_id"])
            created = a.get("created_at")
            if isinstance(created, datetime):
                a["created_at"] = created.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return announcements

    @staticmethod
    def dismiss(announcement_id, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        try:
            result = mongo.db.announcements.update_one(
                {"_id": ObjectId(announcement_id)},
                {"$addToSet": {"dismissed_by": user_id}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def toggle_active(announcement_id, is_active):
        try:
            result = mongo.db.announcements.update_one(
                {"_id": ObjectId(announcement_id)},
                {"$set": {"is_active": is_active}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def list_all(page=1, per_page=20):
        skip = (page - 1) * per_page
        total = mongo.db.announcements.count_documents({})
        announcements = list(
            mongo.db.announcements.find({})
            .sort("created_at", -1)
            .skip(skip)
            .limit(per_page)
        )
        for a in announcements:
            a["_id"] = str(a["_id"])
            a["dismissed_count"] = len(a.get("dismissed_by", []))
            a.pop("dismissed_by", None)
            created = a.get("created_at")
            if isinstance(created, datetime):
                a["created_at"] = created.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return announcements, total

    @staticmethod
    def delete(announcement_id):
        try:
            result = mongo.db.announcements.delete_one(
                {"_id": ObjectId(announcement_id)}
            )
            return result.deleted_count > 0
        except Exception:
            return False
