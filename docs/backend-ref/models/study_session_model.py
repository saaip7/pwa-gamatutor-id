from datetime import datetime
from utils.db import mongo
from bson import ObjectId

class StudySession:
    def __init__(self, _id, user_id, card_id, start_time, end_time=None):
        self._id = _id
        self.user_id = user_id
        self.card_id = card_id
        self.start_time = start_time
        self.end_time = end_time

    @staticmethod
    def create_session(user_id, card_id):
        db = mongo.db
        session_data = {
            "user_id": user_id,
            "card_id": card_id,
            "start_time": datetime.utcnow(),
            "end_time": None
        }
        result = db.study_sessions.insert_one(session_data)
        session_data["_id"] = str(result.inserted_id)
        return session_data

    @staticmethod
    def end_session(session_id):
        db = mongo.db
        result = db.study_sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"end_time": datetime.utcnow()}}
        )
        return result.modified_count > 0

    @staticmethod
    def get_sessions_by_card(card_id):
        db = mongo.db
        sessions = list(db.study_sessions.find({"card_id": card_id}))
        for session in sessions:
            session["_id"] = str(session["_id"])
        return sessions

    @staticmethod
    def get_total_study_time(card_id):
        db = mongo.db
        pipeline = [
            {"$match": {"card_id": card_id}},
            {"$group": {
                "_id": None,
                "total_minutes": {
                    "$sum": {
                        "$divide": [
                            {"$subtract": ["$end_time", "$start_time"]},
                            60000  # Convert milliseconds to minutes
                        ]
                    }
                }
            }}
        ]
        result = list(db.study_sessions.aggregate(pipeline))
        return result[0]["total_minutes"] if result else 0 