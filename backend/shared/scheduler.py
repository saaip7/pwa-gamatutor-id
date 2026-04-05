import logging
from datetime import datetime, timedelta
from bson import ObjectId

from apscheduler.schedulers.background import BackgroundScheduler
from shared.db import mongo
from shared.fcm import send_push
from features.notification.model import Notification

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def _is_quiet_hours(prefs):
    """Check if current time is within user's quiet hours."""
    quiet = prefs.get("notifications", {}).get("quiet_hours", {})
    if not quiet.get("enabled"):
        return False
    now = datetime.utcnow()
    start = quiet.get("start", "22:00")
    end = quiet.get("end", "07:00")
    current_time = now.strftime("%H:%M")
    # Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if start <= end:
        return start <= current_time < end
    else:
        return current_time >= start or current_time < end


def _get_fcm_token(user_id):
    """Get FCM token for a user."""
    prefs = mongo.db.user_preferences.find_one({"user_id": ObjectId(user_id)})
    if not prefs:
        return None
    return prefs.get("fcm_token")


# --- Job 1: Deadline Reminder ---
def job_deadline_reminder():
    """Check cards with upcoming deadlines (next 24h) and notify users."""
    logger.info("[Scheduler] Running deadline reminder job")

    now = datetime.utcnow()
    deadline_threshold = now + timedelta(hours=24)

    boards = mongo.db.boards.find()
    reminded = 0

    for board in boards:
        user_id = board["user_id"]
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            continue

        # Check if push notifications enabled
        if not prefs.get("notifications", {}).get("push_enabled", True):
            continue

        # Check quiet hours
        if _is_quiet_hours(prefs):
            continue

        for lst in board.get("lists", []):
            # Only check non-done lists (list1, list2, list3)
            if lst["id"] == "list4":
                continue
            for card in lst.get("cards", []):
                deadline_str = card.get("deadline")
                if not deadline_str:
                    continue

                try:
                    if isinstance(deadline_str, str):
                        deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00")).replace(tzinfo=None)
                    else:
                        deadline = deadline_str
                except Exception:
                    continue

                # Deadline within next 24 hours and not yet passed
                if now <= deadline <= deadline_threshold:
                    # Check if already reminded recently (avoid spam)
                    reminded_key = f"deadline_reminded_{card['id']}"
                    existing = mongo.db.notifications.find_one({
                        "user_id": user_id,
                        "type": "reminder",
                        "description": {"$regex": card.get("task_name", card.get("id", ""))},
                        "created_at": {"$gte": now - timedelta(hours=12)},
                    })
                    if existing:
                        continue

                    task_name = card.get("task_name", card.get("title", "Tugas"))
                    hours_left = int((deadline - now).total_seconds() / 3600)

                    title = "Deadline Mendekat!"
                    body = f'"{task_name}" — {hours_left} jam lagi'

                    # Create in-app notification
                    Notification.create(
                        user_id=str(user_id),
                        type="reminder",
                        title=title,
                        description=body,
                    )

                    # Send push notification
                    token = prefs.get("fcm_token")
                    if token:
                        send_push(token, title, body, {"type": "deadline", "card_id": card["id"]})

                    reminded += 1

    logger.info(f"[Scheduler] Deadline reminder: {reminded} notifications sent")


# --- Job 2: Smart Reminder ---
def job_smart_reminder():
    """Send personalized study reminders at user's productive hour."""
    logger.info("[Scheduler] Running smart reminder job")

    now = datetime.utcnow()
    current_hour = now.hour

    # Find users whose productive hour matches current hour
    users = mongo.db.user_preferences.find({
        "notifications.smart_reminder_enabled": True,
    })

    reminded = 0
    for prefs in users:
        user_id = prefs["user_id"]

        if _is_quiet_hours(prefs):
            continue

        # Determine productive hour from analytics data
        # Fall back to 20:00 (8 PM) default if no data yet
        productive_hour = prefs.get("analytics", {}).get("productive_hour", 20)

        if current_hour != productive_hour:
            continue

        # Check if user already studied today
        streak = prefs.get("streak", {})
        last_active = streak.get("last_active_date")
        if last_active:
            if isinstance(last_active, datetime) and (now - last_active).days == 0:
                continue  # Already active today, skip

        # Check if reminder already sent today
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        existing = mongo.db.notifications.find_one({
            "user_id": user_id,
            "type": "reminder",
            "description": {"$regex": "Waktunya belajar"},
            "created_at": {"$gte": today_start},
        })
        if existing:
            continue

        title = "Waktunya Belajar!"
        body = "Jam produktifmu sudah tiba. Yuk mulai sesi belajar!"

        Notification.create(
            user_id=str(user_id),
            type="reminder",
            title=title,
            description=body,
        )

        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "smart_reminder"})

        reminded += 1

    logger.info(f"[Scheduler] Smart reminder: {reminded} notifications sent")


# --- Job 3: Social Presence ---
def job_social_presence():
    """Notify users about peers who are currently studying."""
    logger.info("[Scheduler] Running social presence job")

    now = datetime.utcnow()
    recent_window = now - timedelta(minutes=30)

    # Find users with active study sessions
    active_sessions = mongo.db.study_sessions.find({
        "status": "active",
        "start_time": {"$gte": recent_window},
    })

    active_user_ids = set()
    for session in active_sessions:
        active_user_ids.add(session["user_id"])

    if not active_user_ids:
        logger.info("[Scheduler] Social presence: no active sessions")
        return

    count = len(active_user_ids)

    # Notify users who have social presence enabled
    users = mongo.db.user_preferences.find({
        "notifications.social_presence_enabled": True,
    })

    notified = 0
    for prefs in users:
        user_id = prefs["user_id"]

        # Don't notify users who are already studying
        if user_id in active_user_ids:
            continue

        if _is_quiet_hours(prefs):
            continue

        # Max 1 social presence notification per day
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        existing = mongo.db.notifications.find_one({
            "user_id": user_id,
            "type": "social",
            "created_at": {"$gte": today_start},
        })
        if existing:
            continue

        title = "Teman Sedang Belajar"
        body = f"{count} mahasiswa sedang belajar sekarang. Yuk ikut belajar!"

        Notification.create(
            user_id=str(user_id),
            type="social",
            title=title,
            description=body,
        )

        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "social_presence"})

        notified += 1

    logger.info(f"[Scheduler] Social presence: {notified} notifications sent ({count} active users)")


def init_scheduler(app):
    """Initialize and start the APScheduler with all cron jobs."""
    with app.app_context():
        # Deadline reminder: every 2 hours
        scheduler.add_job(
            job_deadline_reminder,
            "interval",
            hours=2,
            id="deadline_reminder",
            replace_existing=True,
        )

        # Smart reminder: every hour (checks productive hour match)
        scheduler.add_job(
            job_smart_reminder,
            "interval",
            hours=1,
            id="smart_reminder",
            replace_existing=True,
        )

        # Social presence: every 30 minutes
        scheduler.add_job(
            job_social_presence,
            "interval",
            minutes=30,
            id="social_presence",
            replace_existing=True,
        )

        scheduler.start()
        logger.info("[Scheduler] Started with 3 jobs: deadline_reminder, smart_reminder, social_presence")
