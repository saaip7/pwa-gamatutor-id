from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta


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
        now = datetime.utcnow()
        result = mongo.db.study_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"end_time": now}},
        )
        if result.modified_count == 0:
            return None
        doc = mongo.db.study_sessions.find_one({"_id": ObjectId(session_id)})
        duration_ms = 0
        if doc and doc.get("start_time"):
            duration_ms = int((now - doc["start_time"]).total_seconds() * 1000)
        return {"duration_ms": duration_ms}

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
    def update_heartbeat(session_id):
        """Update last_heartbeat timestamp on an active session."""
        now = datetime.utcnow()
        result = mongo.db.study_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"last_heartbeat": now, "idle_notified": False}},
        )
        return result.modified_count > 0

    @staticmethod
    def auto_end_stale(user_id=None, minutes_threshold=60):
        """End stale sessions inactive beyond minutes_threshold.

        Sets end_time to last_heartbeat + 5min grace, marks auto_ended=True.
        Returns list of dicts with user_id and card_id of auto-ended sessions.
        """
        cutoff = datetime.utcnow() - timedelta(minutes=minutes_threshold)

        query = {
            "end_time": None,
            "last_heartbeat": {"$exists": True, "$lt": cutoff},
        }
        if user_id:
            query["user_id"] = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        stale_sessions = list(mongo.db.study_sessions.find(query))

        ended = []
        for session in stale_sessions:
            grace_end = session["last_heartbeat"] + timedelta(minutes=5)
            mongo.db.study_sessions.update_one(
                {"_id": session["_id"]},
                {"$set": {"end_time": grace_end, "auto_ended": True}},
            )
            ended.append({
                "user_id": str(session["user_id"]),
                "card_id": session["card_id"],
                "session_id": str(session["_id"]),
            })

        return ended

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
