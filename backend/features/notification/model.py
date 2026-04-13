from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta


class Notification:
    @staticmethod
    def create(user_id, type, title, description):
        """Create a notification. type must be: award, social, reminder, insight."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {
            "user_id": user_id,
            "type": type,
            "title": title,
            "description": description,
            "is_unread": True,
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.notifications.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    @staticmethod
    def get_all(user_id, page=1, per_page=20):
        """Get notifications paginated, newest first."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        skip = (page - 1) * per_page
        notifications = list(
            mongo.db.notifications.find({"user_id": user_id})
            .sort("created_at", -1)
            .skip(skip)
            .limit(per_page)
        )
        for n in notifications:
            n["_id"] = str(n["_id"])
            n["user_id"] = str(n["user_id"])
            # Convert is_unread → read for FE compatibility
            n["read"] = not n.get("is_unread", True)
            # Ensure created_at is ISO string with timezone
            created = n.get("created_at")
            if isinstance(created, datetime):
                n["created_at"] = created.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        return notifications

    @staticmethod
    def count_all(user_id):
        """Total notification count for a user."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.notifications.count_documents({"user_id": user_id})

    @staticmethod
    def get_unread_count(user_id):
        """Count unread notifications."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.notifications.count_documents({"user_id": user_id, "is_unread": True})

    @staticmethod
    def mark_read(user_id, notification_id):
        """Mark a single notification as read."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        try:
            result = mongo.db.notifications.update_one(
                {"_id": ObjectId(notification_id), "user_id": user_id},
                {"$set": {"is_unread": False}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    @staticmethod
    def delete(user_id, notification_id):
        """Delete a single notification."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        try:
            result = mongo.db.notifications.delete_one(
                {"_id": ObjectId(notification_id), "user_id": user_id}
            )
            return result.deleted_count > 0
        except Exception:
            return False

    @staticmethod
    def mark_all_read(user_id):
        """Mark all notifications as read."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        result = mongo.db.notifications.update_many(
            {"user_id": user_id, "is_unread": True},
            {"$set": {"is_unread": False}}
        )
        return result.modified_count

    @staticmethod
    def format_with_group(notifications):
        """Add 'group' field based on time: today = 'terbaru', older = 'sebelumnya'."""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        for n in notifications:
            created = n.get("created_at")
            if isinstance(created, datetime):
                n["group"] = "terbaru" if created >= today_start else "sebelumnya"
            else:
                n["group"] = "sebelumnya"
        return notifications
