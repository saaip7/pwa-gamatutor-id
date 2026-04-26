from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta


class StudySession:
    @staticmethod
    def create(user_id, card_id):
        existing = mongo.db.study_sessions.find_one({
            "user_id": ObjectId(user_id),
            "card_id": card_id,
            "end_time": None,
        })
        if existing:
            existing["_id"] = str(existing["_id"])
            existing["user_id"] = str(existing["user_id"])
            return existing
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
    def end(session_id, hidden_ms=0):
        now = datetime.utcnow()
        result = mongo.db.study_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"end_time": now, "hidden_ms": hidden_ms}},
        )
        if result.modified_count == 0:
            return None
        doc = mongo.db.study_sessions.find_one({"_id": ObjectId(session_id)})
        duration_ms = 0
        if doc and doc.get("start_time"):
            wall_ms = int((now - doc["start_time"]).total_seconds() * 1000)
            duration_ms = max(0, wall_ms - hidden_ms)
        return {"duration_ms": duration_ms}

    @staticmethod
    def get_by_card(card_id):
        sessions = list(mongo.db.study_sessions.find({"card_id": card_id}))
        for s in sessions:
            s["_id"] = str(s["_id"])
            s["user_id"] = str(s["user_id"])
        return sessions

    @staticmethod
    def cleanup_orphan_sessions(max_age_hours=24, max_age_minutes=None):
        """End orphan sessions that have been running longer than max_age_hours."""
        from datetime import timedelta
        if max_age_minutes is not None:
            cutoff = datetime.utcnow() - timedelta(minutes=max_age_minutes)
        else:
            cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        result = mongo.db.study_sessions.update_many(
            {"end_time": None, "start_time": {"$lt": cutoff}},
            {"$set": {"end_time": cutoff, "orphan": True, "hidden_ms": int(max_age_hours * 3600000) if max_age_minutes is None else int(max_age_minutes * 60000)}},
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
        import logging
        logger = logging.getLogger(__name__)
        now = datetime.utcnow()
        result = mongo.db.study_sessions.update_one(
            {"_id": ObjectId(session_id), "end_time": None},
            {"$set": {"last_heartbeat": now}},
        )
        logger.info(f"[Heartbeat] session={session_id}, matched={result.matched_count}, modified={result.modified_count}")
        return result.modified_count > 0

    @staticmethod
    def auto_end_stale(user_id=None, minutes_threshold=60):
        import logging
        logger = logging.getLogger(__name__)

        cutoff = datetime.utcnow() - timedelta(minutes=minutes_threshold)

        query = {
            "end_time": None,
            "last_heartbeat": {"$exists": True, "$lt": cutoff},
        }
        if user_id:
            query["user_id"] = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

        stale_sessions = list(mongo.db.study_sessions.find(query))
        logger.info(f"[AutoEndStale] threshold={minutes_threshold}min, found={len(stale_sessions)} stale sessions")

        ended = []
        for session in stale_sessions:
            grace_end = session["last_heartbeat"] + timedelta(minutes=5)  # [FLAG STUDY] prod: 5min, test: 1min
            idle_ms = int((grace_end - session["start_time"]).total_seconds() * 1000)
            active_ms = int((session["last_heartbeat"] - session["start_time"]).total_seconds() * 1000)
            hidden_ms = max(0, idle_ms - active_ms)
            result = mongo.db.study_sessions.update_one(
                {"_id": session["_id"], "end_time": None},
                {"$set": {"end_time": grace_end, "auto_ended": True, "hidden_ms": hidden_ms}},
            )
            logger.info(f"[AutoEndStale] session {session['_id']}: matched={result.matched_count}, modified={result.modified_count}")
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
                "wall_minutes": {
                    "$sum": {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 60000]}
                },
                "hidden_minutes": {
                    "$sum": {"$divide": [{"$ifNull": ["$hidden_ms", 0]}, 60000]}
                }
            }},
        ]
        result = list(mongo.db.study_sessions.aggregate(pipeline))
        if not result:
            return 0
        total = round(result[0]["wall_minutes"]) - round(result[0]["hidden_minutes"])
        return max(0, total)
