from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta


class Preferences:
    @staticmethod
    def get(user_id):
        """Get user preferences."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return None
        prefs["_id"] = str(prefs["_id"])
        prefs["user_id"] = str(prefs["user_id"])
        return prefs

    @staticmethod
    def update_notifications(user_id, data):
        """Update notification preferences."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        updates = {}
        # Map FE field names to backend structure
        if "deadline" in data:
            updates["notifications.push_enabled"] = data["deadline"]
        if "smartReminder" in data:
            updates["notifications.smart_reminder_enabled"] = data["smartReminder"]
        if "socialPresence" in data:
            updates["notifications.social_presence_enabled"] = data["socialPresence"]
        if "quietSchedule" in data:
            updates["notifications.quiet_hours.enabled"] = data["quietSchedule"]
        if "quietTime" in data:
            qt = data["quietTime"]
            if "start" in qt:
                updates["notifications.quiet_hours.start"] = qt["start"]
            if "end" in qt:
                updates["notifications.quiet_hours.end"] = qt["end"]

        # Also accept direct backend field names for flexibility
        for field in ["push_enabled", "smart_reminder_enabled", "social_presence_enabled"]:
            if field in data:
                updates[f"notifications.{field}"] = data[field]

        if not updates:
            return None

        updates["updated_at"] = datetime.utcnow()
        result = mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0

    @staticmethod
    def update_theme(user_id, data):
        """Update theme preferences (dark/light/auto)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        updates = {"updated_at": datetime.utcnow()}
        if "mode" in data:
            updates["theme.mode"] = data["mode"]  # "dark", "light", "auto"
        if "color_scheme" in data:
            updates["theme.color_scheme"] = data["color_scheme"]

        result = mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0

    @staticmethod
    def update_onboarding(user_id, data):
        """Update onboarding state."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        updates = {"updated_at": datetime.utcnow()}
        if "completed" in data:
            updates["onboarding.completed"] = data["completed"]
        if "current_step" in data:
            updates["onboarding.current_step"] = data["current_step"]
        if "skipped_tour" in data:
            updates["onboarding.skipped_tour"] = data["skipped_tour"]
        if data.get("completed"):
            updates["onboarding.completed_at"] = datetime.utcnow()

        result = mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0

    @staticmethod
    def update_fcm_token(user_id, token):
        """Update FCM token for push notifications."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        result = mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {"$set": {"fcm_token": token, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    @staticmethod
    def get_streak(user_id):
        """Get streak data."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return None
        return prefs.get("streak", {"current": 0, "longest": 0})

    @staticmethod
    def use_streak_freeze(user_id):
        """Use a streak freeze. Max 1 per week. Returns (success, message)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return False, "Preferences not found"

        streak = prefs.get("streak", {})
        now = datetime.utcnow()
        today = now.date()

        last_active = streak.get("last_active_date")
        if last_active:
            if isinstance(last_active, str):
                last_active_date = datetime.fromisoformat(last_active.replace("Z", "+00:00")).date()
            elif isinstance(last_active, datetime):
                last_active_date = last_active.date()
            else:
                last_active_date = None
            if last_active_date == today:
                return False, "Kamu hari ini sudah aktif, tidak perlu streak freeze"

        freezes_used = streak.get("freezes_used_this_week", 0)
        week_start = streak.get("week_start_date")

        # Calculate start of current week (Monday) - use date for comparison
        current_week_start_date = today - timedelta(days=today.weekday())

        # Reset counter if new week - compare dates only
        week_start_date = week_start.date() if week_start else None
        if not week_start_date or week_start_date < current_week_start_date:
            freezes_used = 0

        if freezes_used >= 1:
            return False, "Sudah menggunakan streak freeze minggu ini (maks 1 per minggu)"

        # Apply freeze: update streak data
        updates = {
            "streak.freezes_used_this_week": freezes_used + 1,
            "streak.week_start_date": current_week_start_date,
            "streak.freeze_used_at": now,
            "updated_at": now,
        }

        # Determine which day the freeze covers (today)
        today_str = now.date().isoformat()

        # If streak was about to break (yesterday no activity), preserve it
        last_active = streak.get("last_active_date")
        if last_active:
            days_since = (now - last_active).days if isinstance(last_active, datetime) else 1
            if days_since >= 1:
                updates["streak.last_active_date"] = now

        mongo.db.user_preferences.update_one(
            {"user_id": user_id},
            {
                "$set": updates,
                "$addToSet": {"streak.freeze_dates": today_str},
            }
        )
        return True, "Streak freeze berhasil digunakan"
