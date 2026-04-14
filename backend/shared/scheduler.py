import logging
import random
from datetime import datetime, timedelta
from bson import ObjectId

from apscheduler.schedulers.background import BackgroundScheduler
from shared.db import mongo
from shared.fcm import send_push
from shared.timezone_utils import now_wib
from features.notification.model import Notification

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _is_quiet_hours(prefs):
    """Check if current time is within user's quiet hours."""
    quiet = prefs.get("notifications", {}).get("quiet_hours", {})
    if not quiet.get("enabled"):
        return False
    wib = now_wib()
    start = quiet.get("start", "22:00")
    end = quiet.get("end", "07:00")
    current_time = wib.strftime("%H:%M")
    if start <= end:
        return start <= current_time < end
    else:
        return current_time >= start or current_time < end


def _days_since_active(prefs):
    """Return number of days since user's last meaningful activity. None if never active."""
    streak = prefs.get("streak", {})
    last_active = streak.get("last_active_date")
    if not last_active:
        return None  # Never active
    if isinstance(last_active, str):
        last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00")).replace(tzinfo=None)
    return (datetime.utcnow() - last_active).days


def _classify_activity(prefs):
    """Classify user into activity tier: A (active), B (medium), C (passive)."""
    days = _days_since_active(prefs)
    if days is None or days >= 3:
        return "C"
    if days >= 1:
        return "B"
    return "A"


SMART_REMINDER_MESSAGES = {
    "A": [
        ("Jam Produktif Tiba!", "Pertahankan rutinitas belajar yang sudah kamu bangun."),
        ("Rutinitas Belajarmu", "Kamu konsisten belajar beberapa hari terakhir. Teruskan!"),
        ("Hari Produktif", "Rutinitas belajarmu sedang bagus. Hari ini punya potensi yang sama."),
        ("Waktu Terbaik", "Momentum belajarmu sedang positif. Manfaatkan waktu produktifmu hari ini."),
        ("Investasi Diri", "Setiap hari kamu belajar adalah investasi untuk dirimu sendiri. Teruskan!"),
        ("Kedisiplinan", "Kamu sudah menunjukkan kedisiplinan yang baik. Pertahankan!"),
        ("Di Jalur yang Benar", "Belajar teratur membawa hasil. Kamu sudah di jalur yang benar."),
        ("Mulai Menghasilkan", "Rutinitas yang kamu bangun mulai menghasilkan. Tetap semangat!"),
        ("Potensi Hari Ini", "Hari ini bisa jadi hari produktifmu lagi. Kamu sudah tahu caranya."),
        ("Apresiasi", "Konsistensimu akhir-akhir ini patut diapresiasi."),
    ],
    "B": [
        ("Waktunya Belajar!", "Jam produktifmu sudah tiba, yuk selesaikan rencanamu."),
        ("Kembali ke Kanban", "Ada rencana belajar yang bisa dilanjutkan hari ini. Yuk kembali ke Kanban."),
        ("Tugas Menunggu", "Tugasmu masih menunggu di Kanban. Satu langkah kecil hari ini cukup."),
        ("Jam Produktifmu", "Jam produktifmu tiba. Kamu punya tugas yang bisa diselesaikan sekarang."),
        ("Sebentar Saja", "Ada tugas yang menunggu. Yuk luangkan waktu sebentar untuk mengerjakannya."),
        ("15 Menit Saja", "Belajar tidak harus lama. 15 menit saja sudah berarti. Yuk mulai!"),
        ("Lanjutkan Progres", "Kanbanmu ada yang belum selesai. Yuk lanjutkan progresnya hari ini."),
        ("Rencana Menunggu", "Rencana belajarmu sudah menunggu. Yuk kelola tugasmu."),
        ("Kesempatan Baru", "Hari baru, kesempatan baru. Yuk lanjutkan progres belajarmu."),
        ("Kembali Lagi", "Satu hari tanpa belajar tidak apa-apa. Hari ini bisa kembali lagi."),
    ],
    "C": [
        ("Langkah Kecil", "Langkah besar dimulai dari hal kecil. Cicil satu tugas kecil saja hari ini."),
        ("Buka Kanbanmu", "Belajar tidak harus sempurna. Buka Kanbanmu — itu sudah langkah awal."),
        ("Lebih Baik dari Nol", "Satu tugas kecil hari ini lebih baik daripada nol. Yuk mulai dari yang termudah."),
        ("Tidak Apa-apa", "Tidak apa-apa belum sempat belajar beberapa hari ini. Hari ini bisa mulai lagi."),
        ("Kanban Menunggu", "Kanbanmu siap menantimu. Tidak perlu banyak, satu tugas saja."),
        ("Proses Bukan Target", "Belajar itu proses, bukan target. Yuk mulai dari mana pun kamu berada."),
        ("Buka Saja Dulu", "Kamu sudah punya rencana di Kanban. Buka saja dulu, selebihnya mengalir."),
        ("Cukup Lihat", "Hari ini cukup buka dan lihat tugasmu. Tidak perlu langsung menyelesaikan semua."),
        ("Tugas Termudah", "Setiap langkah kecil itu berarti. Yuk pilih satu tugas yang paling ringan."),
        ("Waktu yang Tepat", "Belajar bisa dimulai kapan saja. Hari ini adalah waktu yang tepat."),
    ],
}

STREAK_NUDGE_MESSAGES = [
    "Kamu sudah konsisten belajar {n} hari! Yuk buka satu tugas untuk menjaganya.",
    "{n} hari berturut-turut kamu belajar. Satu tugas kecil hari ini cukup!",
    "Kamu sudah membangun kebiasaan belajar {n} hari. Hari ini, cukup buka saja.",
    "Konsistensi {n} hari bukan hal kecil. Yuk pertahankan dengan satu tugas.",
    "Belajar {n} hari berturut-turut itu pencapaian. Satu langkah lagi hari ini.",
    "Jejak belajarmu sudah {n} hari. Hari ini bisa jadi hari ke-{n}.",
    "Kamu sudah {n} hari konsisten. Buka Kanbanmu sebentar untuk menjaga momentum.",
    "{n} hari terus belajar — itu sudah membuktikan kemampuanmu. Yuk lanjutkan!",
    "Kamu sudah terbiasa belajar {n} hari. Satu tugas kecil untuk menjaganya.",
    "Kebiasaan belajar {n} hari kamu sudah terbangun. Sayang kalau putus sekarang.",
]


def _already_sent_today(user_id, desc_pattern):
    """Check if a notification with matching description was already sent today."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return mongo.db.notifications.find_one({
        "user_id": user_id,
        "type": "reminder",
        "description": {"$regex": desc_pattern},
        "created_at": {"$gte": today_start},
    })


# ---------------------------------------------------------------------------
# Job 1: Deadline Reminder
# ---------------------------------------------------------------------------

def job_deadline_reminder():
    """Check cards with upcoming deadlines (next 24h) and notify users."""
    logger.info("[Scheduler] Running deadline reminder job")

    now = datetime.utcnow()
    deadline_threshold = now + timedelta(hours=24)

    # Find all cards with deadlines that are not in Done column and not deleted
    cards_with_deadlines = list(mongo.db.cards.find({
        "deadline": {"$exists": True, "$ne": None},
        "column": {"$ne": "list4"},
        "deleted": {"$ne": True},
    }))

    reminded = 0

    for card in cards_with_deadlines:
        user_id = card["user_id"]
        deadline_str = card.get("deadline")

        try:
            if isinstance(deadline_str, str):
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00")).replace(tzinfo=None)
            else:
                deadline = deadline_str
        except Exception:
            continue

        if not (now <= deadline <= deadline_threshold):
            continue

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            continue
        if not prefs.get("notifications", {}).get("push_enabled", True):
            continue
        if _is_quiet_hours(prefs):
            continue

        # Dedup: max 1 per card per 12 hours
        task_name = card.get("task_name", "Tugas")
        existing = mongo.db.notifications.find_one({
            "user_id": user_id,
            "type": "reminder",
            "description": {"$regex": task_name},
            "created_at": {"$gte": now - timedelta(hours=12)},
        })
        if existing:
            continue

        hours_left = int((deadline - now).total_seconds() / 3600)
        title = "Deadline Mendekat!"
        body = f'"{task_name}" — {hours_left} jam lagi'

        Notification.create(
            user_id=str(user_id), type="reminder",
            title=title, description=body,
        )
        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "deadline", "card_id": card.get("card_id", str(card["_id"]))})

        reminded += 1

    logger.info(f"[Scheduler] Deadline reminder: {reminded} sent")


# ---------------------------------------------------------------------------
# Job 2: Smart Reminder (A/B/C by activity)
# ---------------------------------------------------------------------------

def job_smart_reminder():
    """Send personalized study reminders based on activity level.

    Condition A (active):     last active today/yesterday → competence support
    Condition B (medium):     inactive 1-2 days           → neutral nudge
    Condition C (passive):    inactive 3+ days / never    → autonomy support (no productive hour required)
    """
    logger.info("[Scheduler] Running smart reminder job")

    wib = now_wib()
    current_hour = wib.hour

    users = mongo.db.user_preferences.find({
        "notifications.smart_reminder_enabled": True,
    })

    counts = {"A": 0, "B": 0, "C": 0}

    for prefs in users:
        user_id = prefs["user_id"]

        if _is_quiet_hours(prefs):
            continue

        tier = _classify_activity(prefs)
        title, body = random.choice(SMART_REMINDER_MESSAGES[tier])

        # Conditions A & B: only send at user's productive hour
        # Condition C: send any hour (once per day) — no productive hour gate
        if tier in ("A", "B"):
            productive_hour = prefs.get("analytics", {}).get("productive_hour", 20)
            if current_hour != productive_hour:
                continue

        # Condition A: skip if already active today (they're doing great)
        if tier == "A":
            days = _days_since_active(prefs)
            if days is not None and days == 0:
                continue

        # Dedup: max 1 smart reminder per day per user
        if _already_sent_today(user_id, "smart_reminder"):
            continue

        Notification.create(
            user_id=str(user_id), type="reminder",
            title=title, description=body,
        )
        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "smart_reminder", "tier": tier})

        counts[tier] += 1

    logger.info(f"[Scheduler] Smart reminder: A={counts['A']} B={counts['B']} C={counts['C']}")


# ---------------------------------------------------------------------------
# Job 3: Streak Nudge
# ---------------------------------------------------------------------------

def job_streak_nudge():
    """Nudge users with active streak (>=2) who haven't studied today."""
    logger.info("[Scheduler] Running streak nudge job")

    now = datetime.utcnow()

    users = mongo.db.user_preferences.find({
        "streak.current": {"$gte": 2},
    })

    nudged = 0
    for prefs in users:
        user_id = prefs["user_id"]

        if _is_quiet_hours(prefs):
            continue

        # Skip if already active today
        days = _days_since_active(prefs)
        if days is not None and days == 0:
            continue

        streak_count = prefs.get("streak", {}).get("current", 0)
        if streak_count < 2:
            continue

        # Dedup: max 1 streak nudge per day
        if _already_sent_today(user_id, "konsisten belajar"):
            continue

        title = "Jangan Putus Semangat!"
        body = random.choice(STREAK_NUDGE_MESSAGES).replace("{n}", str(streak_count))

        Notification.create(
            user_id=str(user_id), type="reminder",
            title=title, description=body,
        )
        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "streak_nudge"})

        nudged += 1

    logger.info(f"[Scheduler] Streak nudge: {nudged} sent")


# ---------------------------------------------------------------------------
# Job 4: Social Presence
# ---------------------------------------------------------------------------

def job_social_presence():
    """Notify users about peers who are currently studying."""
    logger.info("[Scheduler] Running social presence job")

    now = datetime.utcnow()
    recent_window = now - timedelta(minutes=30)

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

    users = mongo.db.user_preferences.find({
        "notifications.social_presence_enabled": True,
    })

    notified = 0
    for prefs in users:
        user_id = prefs["user_id"]

        if user_id in active_user_ids:
            continue
        if _is_quiet_hours(prefs):
            continue

        # Dedup: max 1 per day
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
            user_id=str(user_id), type="social",
            title=title, description=body,
        )
        token = prefs.get("fcm_token")
        if token:
            send_push(token, title, body, {"type": "social_presence"})

        notified += 1

    logger.info(f"[Scheduler] Social presence: {notified} sent ({count} active users)")


# ---------------------------------------------------------------------------
# Job 5: Orphan Session Cleanup
# ---------------------------------------------------------------------------

def job_cleanup_orphan_sessions():
    """End study sessions that have been running for over 24 hours without ending."""
    from features.study_session.model import StudySession
    cleaned = StudySession.cleanup_orphan_sessions(max_age_hours=24)
    if cleaned:
        logger.info(f"[Scheduler] Orphan session cleanup: {cleaned} sessions ended")


# ---------------------------------------------------------------------------
# Job 6: Idle Session Check (push notification after 30 min inactivity)
# ---------------------------------------------------------------------------

def job_check_idle_sessions():
    """Find active sessions idle >30 min and send a nudge notification."""
    logger.info("[Scheduler] Running idle session check")

    now = datetime.utcnow()
    idle_cutoff = now - timedelta(minutes=30)

    idle_sessions = mongo.db.study_sessions.find({
        "end_time": None,
        "last_heartbeat": {"$exists": True, "$lt": idle_cutoff},
        "idle_notified": {"$ne": True},
    })

    notified = 0
    for session in idle_sessions:
        user_id = session["user_id"]
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            continue

        token = prefs.get("fcm_token")
        if not token:
            continue

        title = "Masih belajar?"
        body = "Kamu sudah tidak aktif selama 30 menit. Ketuk untuk kembali belajar."

        send_push(token, title, body, {"type": "idle_session", "session_id": str(session["_id"])})

        # Mark as notified to avoid repeated pings
        mongo.db.study_sessions.update_one(
            {"_id": session["_id"]},
            {"$set": {"idle_notified": True}},
        )

        notified += 1

    if notified:
        logger.info(f"[Scheduler] Idle session check: {notified} notifications sent")


# ---------------------------------------------------------------------------
# Job 7: Auto-End Stale Sessions (after 60 min inactivity)
# ---------------------------------------------------------------------------

def job_auto_end_stale_sessions():
    """Auto-end sessions idle >60 min and notify users."""
    from features.study_session.model import StudySession
    from shared.log_model import Log

    logger.info("[Scheduler] Running auto-end stale sessions")

    ended = StudySession.auto_end_stale(minutes_threshold=60)

    notified = 0
    for item in ended:
        user_oid = ObjectId(item["user_id"]) if isinstance(item["user_id"], str) else item["user_id"]
        prefs = mongo.db.user_preferences.find_one({"user_id": user_oid})
        if not prefs:
            continue

        token = prefs.get("fcm_token")
        if token:
            title = "Sesi belajar diakhiri"
            body = "Sesi belajarmu telah diakhiri otomatis karena tidak aktif selama 60 menit."
            send_push(token, title, body, {"type": "auto_end", "session_id": item["session_id"]})
            notified += 1

        Log.create(item["user_id"], "session_auto_ended", f"Session {item['session_id']} auto-ended after 60 min idle")

    if ended:
        logger.info(f"[Scheduler] Auto-end stale: {len(ended)} sessions ended, {notified} notifications sent")


# ---------------------------------------------------------------------------
# Init
# ---------------------------------------------------------------------------

def init_scheduler(app):
    """Initialize and start the APScheduler with all jobs."""
    with app.app_context():
        scheduler.add_job(
            job_deadline_reminder, "interval", hours=2,
            id="deadline_reminder", replace_existing=True,
        )
        scheduler.add_job(
            job_smart_reminder, "interval", hours=1,
            id="smart_reminder", replace_existing=True,
        )
        scheduler.add_job(
            job_streak_nudge, "interval", hours=6,
            id="streak_nudge", replace_existing=True,
        )
        scheduler.add_job(
            job_social_presence, "interval", minutes=30,
            id="social_presence", replace_existing=True,
        )
        scheduler.add_job(
            job_cleanup_orphan_sessions, "interval", hours=6,
            id="orphan_cleanup", replace_existing=True,
        )
        scheduler.add_job(
            job_check_idle_sessions, "interval", minutes=10,
            id="check_idle_sessions", replace_existing=True,
        )
        scheduler.add_job(
            job_auto_end_stale_sessions, "interval", minutes=10,
            id="auto_end_stale_sessions", replace_existing=True,
        )

        scheduler.start()
        logger.info("[Scheduler] Started with 7 jobs: deadline_reminder, smart_reminder, streak_nudge, social_presence, orphan_cleanup, check_idle_sessions, auto_end_stale_sessions")
