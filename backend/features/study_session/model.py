from shared.db import mongo
from bson import ObjectId
from datetime import datetime


class StudySession:
    @staticmethod
    def create(user_id, card_id):
        doc = {
            "user_id": ObjectId(user_id),
            "card_id": card_id,
            "start_time": datetime.utcnow(),
            "end_time": None,
        }
        result = mongo.db.study_sessions.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        doc["user_id"] = str(doc["user_id"])
        return doc

    @staticmethod
    def end(session_id):
        result = mongo.db.study_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"end_time": datetime.utcnow()}},
        )
        return result.modified_count > 0

    @staticmethod
    def get_by_card(card_id):
        sessions = list(mongo.db.study_sessions.find({"card_id": card_id}))
        for s in sessions:
            s["_id"] = str(s["_id"])
            s["user_id"] = str(s["user_id"])
        return sessions

    @staticmethod
    def cleanup_orphan_sessions(max_age_hours=24):
        """End orphan sessions that have been running longer than max_age_hours."""
        from datetime import timedelta
        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        result = mongo.db.study_sessions.update_many(
            {"end_time": None, "start_time": {"$lt": cutoff}},
            {"$set": {"end_time": cutoff, "orphan": True}},
        )
        return result.modified_count

    @staticmethod
    def get(session_id):
        """Get a single session by ID. Returns None if not found."""
        doc = mongo.db.study_sessions.find_one({"_id": ObjectId(session_id)})
        if not doc:
            return None
        doc["_id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
        return doc

    @staticmethod
    def get_total_time(card_id):
        pipeline = [
            {"$match": {"card_id": card_id, "end_time": {"$ne": None}, "orphan": {"$ne": True}}},
            {"$group": {
                "_id": None,
                "total_minutes": {
                    "$sum": {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 60000]}
                }
            }},
        ]
        result = list(mongo.db.study_sessions.aggregate(pipeline))
        return round(result[0]["total_minutes"]) if result else 0
