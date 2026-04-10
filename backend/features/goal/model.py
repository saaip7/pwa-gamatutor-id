from shared.db import mongo
from bson import ObjectId
from datetime import datetime


class Goal:
    @staticmethod
    def get_general_goal(user_id):
        """Get user's general (main) goal."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.goals.find_one({"user_id": user_id, "type": "general"})

    @staticmethod
    def set_general_goal(user_id, text_pre, text_highlight):
        """Create or update the general goal. Returns the doc."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        existing = mongo.db.goals.find_one({"user_id": user_id, "type": "general"})
        if existing:
            mongo.db.goals.update_one(
                {"_id": existing["_id"]},
                {"$set": {"text_pre": text_pre, "text_highlight": text_highlight, "updated_at": datetime.utcnow()}}
            )
            existing["text_pre"] = text_pre
            existing["text_highlight"] = text_highlight
            return existing
        else:
            doc = {
                "user_id": user_id,
                "type": "general",
                "text_pre": text_pre,
                "text_highlight": text_highlight,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            result = mongo.db.goals.insert_one(doc)
            doc["_id"] = result.inserted_id
            return doc

    @staticmethod
    def get_task_goal(user_id, card_id):
        """Get a task-level goal for a specific card."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return mongo.db.goals.find_one({"user_id": user_id, "type": "task", "card_id": card_id})

    @staticmethod
    def set_task_goal(user_id, card_id, text):
        """Create or update a task goal. Returns the doc."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        existing = mongo.db.goals.find_one({"user_id": user_id, "type": "task", "card_id": card_id})
        if existing:
            mongo.db.goals.update_one(
                {"_id": existing["_id"]},
                {"$set": {"text": text, "updated_at": datetime.utcnow()}}
            )
            existing["text"] = text
            return existing
        else:
            doc = {
                "user_id": user_id,
                "type": "task",
                "card_id": card_id,
                "text": text,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            result = mongo.db.goals.insert_one(doc)
            doc["_id"] = result.inserted_id
            return doc

    @staticmethod
    def get_all_task_goals(user_id):
        """Get all task goals for a user."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        goals = list(mongo.db.goals.find({"user_id": user_id, "type": "task"}))
        return goals

    @staticmethod
    def delete_task_goal(user_id, card_id):
        """Delete a task goal."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        result = mongo.db.goals.delete_one({"user_id": user_id, "type": "task", "card_id": card_id})
        return result.deleted_count > 0

    @staticmethod
    def get_course_progress(user_id):
        """Derive course progress from cards collection. Returns list of {course_name, completed, total}."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        card_query = {"user_id": user_id, "course_name": {"$exists": True, "$ne": None}, "deleted": {"$ne": True}}

        # Get total cards per course
        total_pipeline = [
            {"$match": card_query},
            {"$group": {"_id": "$course_name", "total": {"$sum": 1}}},
        ]
        totals = {r["_id"]: r["total"] for r in mongo.db.cards.aggregate(total_pipeline)}

        if not totals:
            return []

        # Get done cards per course (column == list4)
        done_pipeline = [
            {"$match": {**card_query, "column": "list4"}},
            {"$group": {"_id": "$course_name", "completed": {"$sum": 1}}},
        ]
        dones = {r["_id"]: r["completed"] for r in mongo.db.cards.aggregate(done_pipeline)}

        courses = {}
        for name, total in totals.items():
            courses[name] = {"completed": dones.get(name, 0), "total": total}

        return [{"course_name": name, "completed": data["completed"], "total": data["total"]} for name, data in courses.items()]
