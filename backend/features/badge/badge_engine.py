from shared.db import mongo
from bson import ObjectId
from features.badge.model import Badge, BADGE_DEFINITIONS


class BadgeEngine:
    """Evaluates badge unlock conditions based on trigger actions."""

    @staticmethod
    def evaluate(user_id, trigger):
        """Check all badges relevant to this trigger. Returns list of newly unlocked badge types."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        newly_unlocked = []

        checks = {
            "task_created": [BadgeEngine._check_initiator, BadgeEngine._check_architect, BadgeEngine._check_explorer],
            "reflection_completed": [BadgeEngine._check_reflector, BadgeEngine._check_improver],
            "strategy_used": [BadgeEngine._check_strategist],
            "session_completed": [BadgeEngine._check_deep_diver],
            "streak_updated": [BadgeEngine._check_ritualist, BadgeEngine._check_marathoner],
            "badge_unlocked": [BadgeEngine._check_zenith],
        }

        evaluators = checks.get(trigger, [])
        for check_fn in evaluators:
            badge_type = check_fn(user_id)
            if badge_type:
                newly_unlocked.append(badge_type)

        return newly_unlocked

    @staticmethod
    def _check_initiator(user_id):
        """First task created."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "initiator"})
        if existing:
            return None
        board = mongo.db.boards.find_one({"user_id": user_id})
        if board:
            total_cards = sum(len(lst.get("cards", [])) for lst in board.get("lists", []))
            if total_cards >= 1:
                Badge.unlock(user_id, "initiator")
                return "initiator"
        return None

    @staticmethod
    def _check_architect(user_id):
        """5 tasks with descriptions created."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "architect"})
        if existing:
            return None
        board = mongo.db.boards.find_one({"user_id": user_id})
        if board:
            detailed = 0
            for lst in board.get("lists", []):
                for card in lst.get("cards", []):
                    if card.get("description"):
                        detailed += 1
            if detailed >= 5:
                Badge.unlock(user_id, "architect")
                return "architect"
        return None

    @staticmethod
    def _check_deep_diver(user_id):
        """3 study sessions completed."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "deep_diver"})
        if existing:
            return None
        count = mongo.db.study_sessions.count_documents({"user_id": user_id, "end_time": {"$ne": None}})
        if count >= 3:
            Badge.unlock(user_id, "deep_diver")
            return "deep_diver"
        return None

    @staticmethod
    def _check_marathoner(user_id):
        """14-day streak."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "marathoner"})
        if existing:
            return None
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if prefs and prefs.get("streak", {}).get("current", 0) >= 14:
            Badge.unlock(user_id, "marathoner")
            return "marathoner"
        return None

    @staticmethod
    def _check_ritualist(user_id):
        """7-day streak."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "ritualist"})
        if existing:
            return None
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if prefs and prefs.get("streak", {}).get("current", 0) >= 7:
            Badge.unlock(user_id, "ritualist")
            return "ritualist"
        return None

    @staticmethod
    def _check_reflector(user_id):
        """5 reflections completed."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "reflector"})
        if existing:
            return None
        # Count cards that have reflection data
        board = mongo.db.boards.find_one({"user_id": user_id})
        if board:
            count = 0
            for lst in board.get("lists", []):
                for card in lst.get("cards", []):
                    if card.get("reflection") and card["reflection"].get("q1_strategy"):
                        count += 1
            if count >= 5:
                Badge.unlock(user_id, "reflector")
                return "reflector"
        return None

    @staticmethod
    def _check_strategist(user_id):
        """3 different strategies used."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "strategist"})
        if existing:
            return None
        board = mongo.db.boards.find_one({"user_id": user_id})
        if board:
            strategies = set()
            for lst in board.get("lists", []):
                for card in lst.get("cards", []):
                    strat = card.get("reflection", {}).get("q1_strategy") or card.get("learning_strategy")
                    if strat:
                        strategies.add(strat)
            if len(strategies) >= 3:
                Badge.unlock(user_id, "strategist")
                return "strategist"
        return None

    @staticmethod
    def _check_explorer(user_id):
        """Tasks done in 3 different courses."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "explorer"})
        if existing:
            return None
        board = mongo.db.boards.find_one({"user_id": user_id})
        if board:
            courses_done = set()
            for lst in board.get("lists", []):
                for card in lst.get("cards", []):
                    if card.get("course_name") and lst.get("id") == "list4":
                        courses_done.add(card["course_name"])
            if len(courses_done) >= 3:
                Badge.unlock(user_id, "explorer")
                return "explorer"
        return None

    @staticmethod
    def _check_improver(user_id):
        """Confidence rating improved 3 times."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "improver"})
        if existing:
            return None
        # Check logs for confidence_improvement events
        count = mongo.db.logs.count_documents({
            "user_id": user_id,
            "action_type": "confidence_improved",
        })
        if count >= 3:
            Badge.unlock(user_id, "improver")
            return "improver"
        return None

    @staticmethod
    def _check_zenith(user_id):
        """7 other badges unlocked."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "zenith"})
        if existing:
            return None
        count = Badge.count_unlocked(user_id)
        if count >= 7:  # Not counting zenith itself since it's not unlocked yet
            Badge.unlock(user_id, "zenith")
            return "zenith"
        return None
