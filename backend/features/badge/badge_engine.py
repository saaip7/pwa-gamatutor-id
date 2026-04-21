from shared.db import mongo
from bson import ObjectId
from datetime import datetime as dt
from features.badge.model import Badge, BADGE_DEFINITIONS
from features.notification.model import Notification
from shared.timezone_utils import utc_to_wib


class BadgeEngine:
    """Evaluates badge unlock conditions based on trigger actions."""

    # Each trigger maps to a list of badge check functions
    TRIGGER_MAP = {
        "onboarding_completed": ["_check_initiator"],
        "task_done": ["_check_reflector", "_check_zenith"],
        "reflection_completed": ["_check_reflector", "_check_strategist"],
        "goal_linked": ["_check_architect"],
        "session_completed": ["_check_deep_diver", "_check_ritualist"],
        "streak_updated": ["_check_marathoner"],
        "strategy_used": ["_check_strategist", "_check_explorer"],
        "grade_updated": ["_check_improver"],
    }

    @staticmethod
    def evaluate(user_id, trigger):
        """Check all badges relevant to this trigger. Returns list of newly unlocked badge types."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        newly_unlocked = []
        check_names = BadgeEngine.TRIGGER_MAP.get(trigger, [])

        for check_name in check_names:
            check_fn = getattr(BadgeEngine, check_name, None)
            if check_fn:
                badge_type = check_fn(user_id)
                if badge_type:
                    newly_unlocked.append(badge_type)
                    # Auto-create notification for badge unlock
                    badge_defn = next((b for b in BADGE_DEFINITIONS if b["type"] == badge_type), None)
                    name = badge_defn["name"] if badge_defn else badge_type
                    desc = badge_defn["description"] if badge_defn else ""
                    Notification.create(
                        user_id, "award",
                        f"Badge Terbuka: {name}!",
                        desc
                    )

        return newly_unlocked

    # --- Foundation ---

    @staticmethod
    def _check_initiator(user_id):
        """Selesai onboarding → auto unlock. Only fires on onboarding_completed trigger."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "initiator"})
        if existing:
            return None

        Badge.unlock(user_id, "initiator")
        return "initiator"

    @staticmethod
    def _check_architect(user_id):
        """Berhasil membuat 3 Task Goal berbeda yang terhubung ke Goal Hierarchy."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "architect"})
        if existing:
            return None

        # User must have a general goal AND at least 3 task goals
        general = mongo.db.goals.find_one({"user_id": user_id, "type": "general"})
        if not general:
            return None

        task_goal_count = mongo.db.goals.count_documents({
            "user_id": user_id, "type": "task"
        })
        if task_goal_count >= 3:
            Badge.unlock(user_id, "architect")
            return "architect"

        return None

    # --- Performance ---

    @staticmethod
    def _check_deep_diver(user_id):
        """Focus Mode > 60 menit, tanpa interupsi, memecahkan Personal Best."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "deep_diver"})
        if existing:
            return None

        # Find sessions > 60 minutes (exclude orphans)
        pipeline = [
            {"$match": {
                "user_id": user_id,
                "end_time": {"$ne": None},
                "orphan": {"$ne": True},
            }},
            {"$project": {
                "card_id": 1,
                "net_min": {"$subtract": [
                    {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 60000]},
                    {"$divide": [{"$ifNull": ["$hidden_ms", 0]}, 60000]},
                ]},
            }},
            {"$match": {"net_min": {"$gte": 60}}},
        ]
        long_sessions = list(mongo.db.study_sessions.aggregate(pipeline))

        if not long_sessions:
            return None

        # Check if any of these sessions' cards have personal_best set
        card_ids = [s["card_id"] for s in long_sessions]

        matching = mongo.db.cards.find_one({
            "user_id": user_id,
            "card_id": {"$in": card_ids},
            "personal_best": {"$exists": True, "$ne": None},
            "deleted": {"$ne": True},
        })
        if matching:
            Badge.unlock(user_id, "deep_diver")
            return "deep_diver"

        return None

    @staticmethod
    def _check_ritualist(user_id):
        """Mulai sesi belajar di jam yang sama selama 3 hari berturut-turut."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "ritualist"})
        if existing:
            return None

        # Get sessions sorted by start_time, extract date and hour (exclude orphans)
        sessions = list(
            mongo.db.study_sessions.find(
                {"user_id": user_id, "start_time": {"$ne": None}, "orphan": {"$ne": True}},
                {"start_time": 1}
            ).sort("start_time", 1)
        )

        if len(sessions) < 3:
            return None

        # Group sessions by calendar date, keep the hour of first session each day
        daily_hours = {}
        for s in sessions:
            st = utc_to_wib(s["start_time"])
            date_key = st.strftime("%Y-%m-%d")
            hour = st.hour
            if date_key not in daily_hours:
                daily_hours[date_key] = hour

        # Check for 3 consecutive dates with same hour (±1 hour tolerance)
        dates = sorted(daily_hours.keys())
        consecutive = 1
        for i in range(1, len(dates)):
            prev = dt.strptime(dates[i - 1], "%Y-%m-%d").date()
            curr = dt.strptime(dates[i], "%Y-%m-%d").date()

            if (curr - prev).days == 1 and abs(daily_hours[dates[i]] - daily_hours[dates[i - 1]]) <= 1:
                consecutive += 1
                if consecutive >= 3:
                    Badge.unlock(user_id, "ritualist")
                    return "ritualist"
            else:
                consecutive = 1

        return None

    @staticmethod
    def _check_marathoner(user_id):
        """Forgiving streak selama 7 hari."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "marathoner"})
        if existing:
            return None

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if prefs and prefs.get("streak", {}).get("current", 0) >= 7:
            Badge.unlock(user_id, "marathoner")
            return "marathoner"
        return None

    # --- Mindset ---

    @staticmethod
    def _check_reflector(user_id):
        """Guided Reflection pada 10 tugas berturut-turut tanpa skip."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "reflector"})
        if existing:
            return None

        # Count cards in Done (list4) that have completed reflection
        reflected_count = mongo.db.cards.count_documents({
            "user_id": user_id,
            "column": "list4",
            "reflection.q2_confidence": {"$exists": True, "$ne": None},
            "deleted": {"$ne": True},
        })

        if reflected_count >= 10:
            Badge.unlock(user_id, "reflector")
            return "reflector"

        return None

    @staticmethod
    def _check_strategist(user_id):
        """Strategi yang sama digunakan ≥3 kali dengan Effectiveness Rating (Q1) tinggi konsisten."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "strategist"})
        if existing:
            return None

        # Group cards by learning_strategy using aggregation
        pipeline = [
            {"$match": {
                "user_id": user_id,
                "learning_strategy": {"$exists": True, "$ne": None},
                "reflection.q1_strategy": {"$exists": True, "$ne": None},
                "deleted": {"$ne": True},
            }},
            {"$group": {
                "_id": "$learning_strategy",
                "high_effective": {
                    "$sum": {"$cond": [{"$gte": ["$reflection.q1_strategy", 4]}, 1, 0]},
                },
            }},
            {"$match": {"high_effective": {"$gte": 3}}},
        ]
        result = list(mongo.db.cards.aggregate(pipeline))

        if result:
            Badge.unlock(user_id, "strategist")
            return "strategist"

        return None

    @staticmethod
    def _check_explorer(user_id):
        """Mencoba minimal 4 learning strategy berbeda (dinamis, bukan hardcoded)."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "explorer"})
        if existing:
            return None

        found_strategies = mongo.db.cards.distinct("learning_strategy", {
            "user_id": user_id,
            "learning_strategy": {"$exists": True, "$ne": None},
            "deleted": {"$ne": True},
        })

        if len(found_strategies) >= 4:
            Badge.unlock(user_id, "explorer")
            return "explorer"

        return None

    # --- Mastery ---

    @staticmethod
    def _check_improver(user_id):
        """Peningkatan Improvement Visualization > 20%."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "improver"})
        if existing:
            return None

        # Use aggregation to find any card with >20% grade improvement
        pipeline = [
            {"$match": {
                "user_id": user_id,
                "pre_test_grade": {"$exists": True, "$gt": 0},
                "post_test_grade": {"$exists": True, "$gt": 0},
                "deleted": {"$ne": True},
            }},
            {"$project": {
                "improvement": {"$multiply": [
                    {"$divide": [
                        {"$subtract": ["$post_test_grade", "$pre_test_grade"]},
                        "$pre_test_grade",
                    ]},
                    100,
                ]},
            }},
            {"$match": {"improvement": {"$gt": 20}}},
            {"$limit": 1},
        ]
        result = list(mongo.db.cards.aggregate(pipeline))

        if result:
            Badge.unlock(user_id, "improver")
            return "improver"

        return None

    @staticmethod
    def _check_zenith(user_id):
        """Menyelesaikan tugas dengan kesulitan Hard + Confidence 5."""
        existing = mongo.db.badges.find_one({"user_id": user_id, "badge_type": "zenith"})
        if existing:
            return None

        # Card must be in Done (list4) with difficulty Hard + confidence 5
        matching = mongo.db.cards.find_one({
            "user_id": user_id,
            "column": "list4",
            "difficulty": "Hard",
            "reflection.q2_confidence": 5,
            "deleted": {"$ne": True},
        })

        if matching:
            Badge.unlock(user_id, "zenith")
            return "zenith"

        return None
