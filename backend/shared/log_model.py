from shared.db import mongo
from bson import ObjectId
from datetime import datetime


class Log:
    @staticmethod
    def create(user_id, action_type, description, metadata=None):
        """Create a log entry. user_id should be ObjectId or string."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {
            "user_id": user_id,
            "action_type": action_type,
            "description": description,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.logs.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    def get_by_user(user_id, limit=100):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        logs = list(
            mongo.db.logs.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        for log in logs:
            log["id"] = str(log.pop("_id"))
        return logs

    @staticmethod
    def get_all(limit=100):
        logs = list(mongo.db.logs.find({}).sort("created_at", -1).limit(limit))
        for log in logs:
            log["id"] = str(log.pop("_id"))
        return logs
