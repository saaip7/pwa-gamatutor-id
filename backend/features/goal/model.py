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
        """Derive course progress from board data. Returns list of {course_name, completed, total}."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        board = mongo.db.boards.find_one({"user_id": user_id})
        if not board:
            return []

        courses = {}
        for lst in board.get("lists", []):
            for card in lst.get("cards", []):
                course = card.get("course_name")
                if not course:
                    continue
                if course not in courses:
                    courses[course] = {"completed": 0, "total": 0}
                courses[course]["total"] += 1
                # Card is "done" if it's in the last list (Reflection/Done)
                if lst.get("id") == "list4":
                    courses[course]["completed"] += 1

        return [{"course_name": name, "completed": data["completed"], "total": data["total"]} for name, data in courses.items()]
