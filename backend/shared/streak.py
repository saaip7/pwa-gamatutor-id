from shared.db import mongo
from bson import ObjectId
from datetime import datetime
from features.badge.badge_engine import BadgeEngine
from shared.timezone_utils import now_wib


def update_streak(user_id):
    """Check and update streak based on meaningful activity.

    Called from controllers when user performs a qualifying action:
    - Start study session
    - Move card to Done with reflection

    Returns updated streak dict {"current": N, "longest": N} or None on error.
    """
    if isinstance(user_id, str):
        user_id = ObjectId(user_id)

    prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
    if not prefs:
        return None

    streak = prefs.get("streak", {})
    current = streak.get("current", 0)
    longest = streak.get("longest", 0)
    last_active = streak.get("last_active_date")

    today_wib = now_wib().date()

    # Determine last active date (stored as UTC datetime)
    if last_active:
        last_date = last_active.date() if isinstance(last_active, datetime) else last_active
        if isinstance(last_date, datetime):
            last_date = (last_date + __import__("datetime").timedelta(hours=7)).date()
    else:
        last_date = None

    # Already active today — no change
    if last_date and last_date >= today_wib:
        return {"current": current, "longest": longest}

    # Calculate gap
    if last_date:
        gap = (today_wib - last_date).days
    else:
        gap = 0  # first time ever

    if gap <= 1:
        # Yesterday or first time — increment
        new_current = current + 1
    else:
        # Gap > 1 — streak broken, reset
        new_current = 1

    new_longest = max(longest, new_current)

    now = datetime.utcnow()
    mongo.db.user_preferences.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "streak.current": new_current,
                "streak.longest": new_longest,
                "streak.last_active_date": now,
                "updated_at": now,
            },
            "$addToSet": {"streak.active_dates": today_wib.isoformat()},
        }
    )

    # Check streak-based badges if streak increased
    if new_current > current:
        BadgeEngine.evaluate(user_id, "streak_updated")

    return {"current": new_current, "longest": new_longest}
