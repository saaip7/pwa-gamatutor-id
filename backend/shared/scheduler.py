import logging
import random
import time
from datetime import datetime, timedelta
from bson import ObjectId

from apscheduler.schedulers.background import BackgroundScheduler
from shared.db import mongo
from shared.fcm import send_push
from shared.timezone_utils import now_wib
from features.notification.model import Notification

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

# Notification job IDs (allowed for manual trigger + history logging)
NOTIF_JOB_IDS = ["deadline_reminder", "smart_reminder", "streak_nudge", "social_presence"]

# Job display metadata for admin panel
JOB_META = {
    "deadline_reminder": {"label": "Deadline Reminder", "icon": "clock"},
    "smart_reminder":    {"label": "Smart Reminder",   "icon": "brain"},
    "streak_nudge":      {"label": "Streak Nudge",      "icon": "flame"},
    "social_presence":   {"label": "Social Presence",   "icon": "users"},
    "orphan_cleanup":    {"label": "Orphan Cleanup",    "icon": "trash"},
    "check_idle_sessions":{"label": "Idle Check",       "icon": "timer"},
    "auto_end_stale_sessions": {"label": "Auto End Stale", "icon": "stop-circle"},
    "reset_stale_streaks":     {"label": "Reset Stale Streaks","icon": "rotate-ccw"},
}


# ---------------------------------------------------------------------------
# Job pause/resume state (MongoDB)
# ---------------------------------------------------------------------------

def _is_paused(job_id):
    """Check if a scheduler job is paused via admin toggle."""
    doc = mongo.db.scheduler_state.find_one({"job_id": job_id})
    return bool(doc and doc.get("paused", False))


def set_job_paused(job_id, paused):
    """Set pause state for a scheduler job. Upserts into scheduler_state."""
    mongo.db.scheduler_state.update_one(
        {"job_id": job_id},
        {"$set": {"paused": paused, "updated_at": datetime.utcnow()}},
        upsert=True,
    )
    logger.info(f"[Scheduler] Job '{job_id}' {'paused' if paused else 'resumed'}")


def get_all_job_states():
    """Return pause state for all known jobs. Missing = not paused."""
    states = {}
    for doc in mongo.db.scheduler_state.find():
        states[doc["job_id"]] = bool(doc.get("paused", False))
    return states


# ---------------------------------------------------------------------------
# Run-history logging (MongoDB, 3-day retention)
# ---------------------------------------------------------------------------

def _log_job_run(job_id, *, triggered_by="scheduler", status="success",
                 stats=None, error=None, started_at=None, finished_at=None, duration_ms=0):
    """Persist a scheduler job run to scheduler_logs collection."""
    try:
        mongo.db.scheduler_logs.insert_one({
            "job_id": job_id,
            "triggered_by": triggered_by,     # "scheduler" | "manual"
            "status": status,                 # "success" | "error"
            "stats": stats or {},
            "error": error,
            "started_at": started_at or datetime.utcnow(),
            "finished_at": finished_at or datetime.utcnow(),
            "duration_ms": duration_ms,
            "created_at": datetime.utcnow(),
        })
        # Cleanup: delete logs older than 3 days
        cutoff = datetime.utcnow() - timedelta(days=3)
        mongo.db.scheduler_logs.delete_many({"created_at": {"$lt": cutoff}})
    except Exception:
        logger.exception("[Scheduler] Failed to log job run")


from contextlib import contextmanager
import time as _time
from functools import wraps


def _track_job_run(job_id, *, triggered_by="scheduler"):
    """Decorator / wrapper: logs job result + duration to MongoDB.

    Can be used as a decorator OR called directly:
        @_track_job_run("smart_reminder")
        def job_smart_reminder(): ...

        # or
        _track_job_run("deadline_reminder", triggered_by="manual")(_run_deadline_reminder)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            started = datetime.utcnow()
            t0 = _time.monotonic()
            stats = None
            error = None
            status = "success"
            try:
                result = fn(*args, **kwargs)
                if isinstance(result, dict):
                    stats = result
                return result
            except Exception as exc:
                status = "error"
                error = str(exc)
                raise
            finally:
                duration_ms = round((_time.monotonic() - t0) * 1000, 1)
                _log_job_run(
                    job_id,
                    triggered_by=triggered_by,
                    status=status,
                    stats=stats,
                    error=error,
                    started_at=started,
                    finished_at=datetime.utcnow(),
                    duration_ms=duration_ms,
                )
        return wrapper
    return decorator


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
        return None
    if isinstance(last_active, str):
        last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00"))
        if last_active.tzinfo is not None:
            from datetime import timezone
            last_active = last_active.astimezone(timezone.utc).replace(tzinfo=None)
    days = (datetime.utcnow() - last_active).days
    return days


def _classify_activity(prefs):
    """Classify user into activity tier.

    A (Rajin):    active today or yesterday (0-1 days) → competence support
    B (Medium):   inactive 2-3 days                   → neutral nudge
    C (Pasif):    inactive 4+ days / never             → autonomy support
    """
    days = _days_since_active(prefs)
    if days is None or days >= 4:
        tier = "C"
    elif days >= 2:
        tier = "B"
    else:
        tier = "A"
    logger.info(f"[ActivityCheck] tier={tier}, days_since_active={days}")
    return tier


def _email_enabled(prefs, email_category):
    """Check if user has opted in to email for a specific category.

    email_category maps to prefs.notifications.email:
      - 'deadline'        → deadline_reminder, deadline_urgent, deadline_critical
      - 'smart_reminder'  → smart_reminder
      - 'streak_nudge'    → streak_nudge
      - 'social_presence' → social
      - 'study_session'   → idle_session, auto_end

    Opt-out model: if user hasn't set any email prefs yet, default is ENABLED.
    """
    email_prefs = prefs.get("notifications", {}).get("email", {})
    if not email_prefs:
        return True  # no prefs set yet → default enabled (opt-out)
    return bool(email_prefs.get(email_category, True))


def _sent_today(user_id, notif_type):
    """Check if a notification of this type was already sent today (WIB). Dedup by type."""
    wib_now = now_wib()
    # WIB midnight today → convert back to UTC for DB query
    today_wib_start = wib_now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_start_utc = today_wib_start - timedelta(hours=7)
    result = mongo.db.notifications.find_one({
        "user_id": user_id,
        "type": notif_type,
        "created_at": {"$gte": today_start_utc},
    })
    return result is not None


def _notify_user(user_id, title, body, data=None, send_email=None, notif_type="reminder", email_template=None, email_vars=None, email_category=None):
    """Send FCM push + save to DB + optional templated email. Returns dict with push_sent/email_sent.

    email_category: key in prefs.notifications.email (e.g. 'deadline', 'smart_reminder').
                    When provided, email is only sent if user has opted in for that category.
    """

    push_sent = False
    prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
    token = prefs.get("fcm_token") if prefs else None
    if token:
        push_sent = send_push(token, title, body, data or {"type": notif_type})

    email_sent = False
    # Determine if email should be sent: explicit flag or check user preference by category
    if send_email is not None:
        should_email = send_email
    elif email_category and prefs:
        should_email = _email_enabled(prefs, email_category)
    else:
        should_email = bool(email_template)
    if should_email:
        from shared.email import send_templated_email, should_skip_email, is_bounced

        dedup_window = datetime.utcnow() - timedelta(minutes=5)
        recent_email = mongo.db.notifications.find_one({
            "user_id": str(user_id),
            "type": notif_type,
            "created_at": {"$gte": dedup_window},
        })
        if recent_email:
            logger.info(f"[Notify] Email dedup skipped — user={user_id}, type={notif_type}")
        else:
            user = mongo.db.users.find_one({"_id": user_id})
            email = user.get("email") if user else None
            if email and not should_skip_email(email, user.get("role")) and not is_bounced(email):
                email_sent = send_templated_email(
                    email,
                    email_template or "generic",
                    **(email_vars or {}),
                )
            else:
                skip_reason = "no_email" if not email else ("invalid_or_admin" if should_skip_email(email, user.get("role")) else "bounced")
                logger.warning(f"[Notify] Email skipped ({skip_reason}) — user_id={user_id}")

    Notification.create(str(user_id), notif_type, title, body)

    return {"push_sent": push_sent, "email_sent": email_sent}


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
        ("Waktunya Belajar!", "Yuk kembali ke rutinitas belajarmu."),
        ("Kembali ke Kanban", "Ada rencana belajar yang bisa dilanjutkan hari ini. Yuk kembali ke Kanban."),
        ("Tugas Menunggu", "Tugasmu masih menunggu di Kanban. Satu langkah kecil hari ini cukup."),
        ("Sebentar Saja", "Ada tugas yang menunggu. Yuk luangkan waktu sebentar untuk mengerjakannya."),
        ("15 Menit Saja", "Belajar tidak harus lama. 15 menit saja sudah berarti. Yuk mulai!"),
        ("Lanjutkan Progres", "Kanbanmu ada yang belum selesai. Yuk lanjutkan progresnya hari ini."),
        ("Rencana Menunggu", "Rencana belajarmu sudah menunggu. Yuk kelola tugasmu."),
        ("Kesempatan Baru", "Hari baru, kesempatan baru. Yuk lanjutkan progres belajarmu."),
        ("Kembali Lagi", "Satu hari tanpa belajar tidak apa-apa. Hari ini bisa kembali lagi."),
        ("Langkah Kecil", "Tidak perlu banyak. Satu tugas kecil hari ini sudah cukup."),
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


# ---------------------------------------------------------------------------
# Job 1: Deadline Reminder
# ---------------------------------------------------------------------------

# [FLAG DL REMINDER] Tier config: test values, adjust before prod
DEADLINE_TIERS = [
    {
        "min_h": 12,
        "max_h": 24,
        "notif_type": "deadline_reminder",
        "title": "Deadline Mendekat!",
        "body_template": '\"{task_name}\" — {hours_left} jam lagi',
        "dedup_hours": 24,
        "email_template": "deadline_early",
    },
    {
        "min_h": 3,
        "max_h": 12,
        "notif_type": "deadline_urgent",
        "title": "Deadline Sebentar Lagi!",
        "body_template": '\"{task_name}\" — tinggal {hours_left} jam!',
        "dedup_hours": 12,
        "email_template": "deadline_urgent",
    },
    {
        "min_h": 0,
        "max_h": 3,
        "notif_type": "deadline_critical",
        "title": "Segera Kerjakan!",
        "body_template": '\"{task_name}" — tinggal {time_left}, segera kerjakan!',
        "dedup_hours": 0,
        "skip_below_min": 30,  # skip if less than 30 minutes left
        "email_template": "deadline_critical",
    },
]


@_track_job_run("deadline_reminder")
def job_deadline_reminder():
    """Check cards with upcoming deadlines (next 24h) and notify users."""
    if _is_paused("deadline_reminder"):
        logger.info("[Scheduler] deadline_reminder is paused — skipping")
        return {}
    return _run_deadline_reminder()


def _run_deadline_reminder():
    logger.info("[Scheduler] Running deadline reminder job")

    now = datetime.utcnow()

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
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                if deadline.tzinfo is not None:
                    from datetime import timezone
                    deadline = deadline.astimezone(timezone.utc).replace(tzinfo=None)
            else:
                deadline = deadline_str
        except Exception:
            continue

        hours_left = int((deadline - now).total_seconds() / 3600)
        minutes_left = int((deadline - now).total_seconds() / 60)

        # Determine which tier applies (if any)
        matched_tier = None
        for tier in DEADLINE_TIERS:
            if tier["min_h"] <= hours_left <= tier["max_h"]:
                matched_tier = tier
                break

        if not matched_tier:
            continue

        # Skip if below minimum minutes threshold (e.g. last 30 min)
        skip_min = matched_tier.get("skip_below_min", 0)
        if skip_min > 0 and minutes_left < skip_min:
            continue

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            continue
        # Deadline is time-sensitive — always send even during quiet hours
        if not prefs.get("notifications", {}).get("push_enabled", True):
            continue

        task_name = card.get("task_name", "Tugas")

        # Dedup per tier (skip if dedup_hours is 0)
        if matched_tier["dedup_hours"] > 0:
            existing = mongo.db.notifications.find_one({
                "user_id": user_id,
                "type": matched_tier["notif_type"],
                "description": {"$regex": task_name},
                "created_at": {"$gte": now - timedelta(hours=matched_tier["dedup_hours"])},
            })
            if existing:
                continue

        title = matched_tier["title"]
        if hours_left >= 1:
            time_left = f"{hours_left} jam"
        else:
            time_left = f"{minutes_left} menit"

        body = matched_tier["body_template"].format(
            task_name=task_name, time_left=time_left, hours_left=hours_left
        )

        _notify_user(
            user_id,
            title,
            body,
            data={"type": matched_tier["notif_type"], "card_id": card.get("card_id", str(card["_id"]))},
            email_category="deadline",
            email_template=matched_tier.get("email_template"),
            email_vars={"task_name": task_name, "hours_left": hours_left, "time_left": time_left},
            notif_type=matched_tier["notif_type"],
        )

        reminded += 1

    logger.info(f"[Scheduler] Deadline reminder: {reminded} sent")
    return {"reminded": reminded}


def _run_deadline_reminder_manual(options=None):
    """Manual trigger variant of deadline reminder.

    options: dict with keys:
      - skip_quiet_hours (bool): deadline already bypasses quiet hours, no effect
      - force_email (bool):      force-send email regardless of user preference
      - skip_dedup (bool):       skip dedup check (useful for testing)
    """
    opts = options or {}
    logger.info(f"[Scheduler] Running deadline reminder MANUAL trigger (options={opts})")

    now = datetime.utcnow()

    cards_with_deadlines = list(mongo.db.cards.find({
        "deadline": {"$exists": True, "$ne": None},
        "column": {"$ne": "list4"},
        "deleted": {"$ne": True},
    }))

    reminded = 0
    skipped_dedup = 0

    for card in cards_with_deadlines:
        user_id = card["user_id"]
        deadline_str = card.get("deadline")

        try:
            if isinstance(deadline_str, str):
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
                if deadline.tzinfo is not None:
                    from datetime import timezone
                    deadline = deadline.astimezone(timezone.utc).replace(tzinfo=None)
            else:
                deadline = deadline_str
        except Exception:
            continue

        hours_left = int((deadline - now).total_seconds() / 3600)
        minutes_left = int((deadline - now).total_seconds() / 60)

        matched_tier = None
        for tier in DEADLINE_TIERS:
            if tier["min_h"] <= hours_left <= tier["max_h"]:
                matched_tier = tier
                break

        if not matched_tier:
            continue

        skip_min = matched_tier.get("skip_below_min", 0)
        if skip_min > 0 and minutes_left < skip_min:
            continue

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            continue
        if not prefs.get("notifications", {}).get("push_enabled", True):
            continue

        task_name = card.get("task_name", "Tugas")

        # Dedup — skip if option says so
        if not opts.get("skip_dedup") and matched_tier["dedup_hours"] > 0:
            existing = mongo.db.notifications.find_one({
                "user_id": user_id,
                "type": matched_tier["notif_type"],
                "description": {"$regex": task_name},
                "created_at": {"$gte": now - timedelta(hours=matched_tier["dedup_hours"])},
            })
            if existing:
                skipped_dedup += 1
                continue

        title = matched_tier["title"]
        if hours_left >= 1:
            time_left = f"{hours_left} jam"
        else:
            time_left = f"{minutes_left} menit"

        body = matched_tier["body_template"].format(
            task_name=task_name, time_left=time_left, hours_left=hours_left
        )

        _notify_user(
            user_id,
            title,
            body,
            data={"type": matched_tier["notif_type"], "card_id": card.get("card_id", str(card["_id"]))},
            send_email=True if opts.get("force_email") else None,
            email_category="deadline" if not opts.get("force_email") else None,
            email_template=matched_tier.get("email_template"),
            email_vars={"task_name": task_name, "hours_left": hours_left, "time_left": time_left},
            notif_type=matched_tier["notif_type"],
        )

        reminded += 1

    logger.info(f"[Scheduler] Deadline reminder MANUAL: {reminded} sent, {skipped_dedup} skipped_dedup")
    return {"reminded": reminded, "skipped_dedup": skipped_dedup}


# ---------------------------------------------------------------------------
# Job 2: Smart Reminder (A/B/C by activity)
# ---------------------------------------------------------------------------

@_track_job_run("smart_reminder")
def job_smart_reminder():
    """Send personalized study reminders based on activity level."""
    if _is_paused("smart_reminder"):
        logger.info("[Scheduler] smart_reminder is paused — skipping")
        return {}
    return _run_smart_reminder()


def _run_smart_reminder():
    logger.info("[Scheduler] Running smart reminder job")

    users = mongo.db.user_preferences.find({
        "notifications.smart_reminder_enabled": True,
    })

    counts = {"A": 0, "B": 0, "C": 0}

    for prefs in users:
        user_id = prefs["user_id"]

        if _is_quiet_hours(prefs):
            continue

        if _sent_today(user_id, "smart_reminder"):
            continue

        tier = _classify_activity(prefs)
        title, body = random.choice(SMART_REMINDER_MESSAGES[tier])

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "smart_reminder", "tier": tier},
            email_category="smart_reminder",
            email_template=f"smart_reminder_{tier.lower()}",
            notif_type="smart_reminder",
        )

        counts[tier] += 1

    logger.info(f"[Scheduler] Smart reminder: A={counts['A']} B={counts['B']} C={counts['C']} sent")
    return counts


def _run_smart_reminder_manual(options=None):
    """Manual trigger variant of smart reminder.

    options: dict with optional keys (all default False):
      - skip_quiet_hours (bool): skip quiet hours check
      - force_email (bool):      force-send email regardless of user preference
      - skip_dedup (bool):       skip dedup check (useful for testing)
    
    Email sending uses SMTP batch split (send_batch_smtp) to respect
    SMTP hourly limits. Push notifications are sent immediately for all users.
    """
    from shared.email import should_skip_email, is_bounced, send_batch_smtp

    opts = options or {}
    skip_quiet = opts.get("skip_quiet_hours", False)
    force_email = opts.get("force_email", False)
    skip_dedup = opts.get("skip_dedup", False)

    logger.info(f"[Scheduler] Running smart reminder MANUAL trigger (options={opts})")

    users = mongo.db.user_preferences.find({
        "notifications.smart_reminder_enabled": True,
    })

    counts = {"A": 0, "B": 0, "C": 0, "skipped_quiet": 0, "skipped_dedup": 0}
    pending_emails = []

    for prefs in users:
        user_id = prefs["user_id"]

        if not skip_quiet and _is_quiet_hours(prefs):
            counts["skipped_quiet"] += 1
            continue

        if not skip_dedup and _sent_today(user_id, "smart_reminder"):
            counts["skipped_dedup"] += 1
            continue

        tier = _classify_activity(prefs)
        title, body = random.choice(SMART_REMINDER_MESSAGES[tier])

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "smart_reminder", "tier": tier},
            send_email=False,
            notif_type="smart_reminder",
        )

        user = mongo.db.users.find_one({"_id": user_id})
        email = user.get("email") if user else None
        if email and not should_skip_email(email, user.get("role")) and not is_bounced(email):
            pending_emails.append({
                "email": email,
                "template": f"smart_reminder_{tier.lower()}",
            })

        counts[tier] += 1

    if pending_emails:
        batch_result = send_batch_smtp(pending_emails)
        logger.info(f"[Scheduler] Smart reminder MANUAL batch: {batch_result}")

    logger.info(f"[Scheduler] Smart reminder MANUAL: A={counts['A']} B={counts['B']} C={counts['C']} skipped_quiet={counts['skipped_quiet']} skipped_dedup={counts['skipped_dedup']}")
    return counts


# ---------------------------------------------------------------------------
# Job 3: Streak Nudge
# ---------------------------------------------------------------------------

@_track_job_run("streak_nudge")
def job_streak_nudge():
    """Nudge users with active streak (>=2) who haven't studied today."""
    if _is_paused("streak_nudge"):
        logger.info("[Scheduler] streak_nudge is paused — skipping")
        return {}
    return _run_streak_nudge()


def _run_streak_nudge():
    logger.info("[Scheduler] Running streak nudge job")

    users = mongo.db.user_preferences.find({
        "streak.current": {"$gte": 2},
    })

    nudged = 0
    sent_tokens = set()  # Token-level dedup: prevent duplicate push to same FCM token
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

        # [FLAG NOTIF] test: disabled dedup, prod: enabled
        if _sent_today(user_id, "streak_nudge"):
            continue

        title = "Jangan Putus Semangat!"
        body = random.choice(STREAK_NUDGE_MESSAGES).replace("{n}", str(streak_count))

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "streak_nudge"},
            email_category="streak_nudge",
            email_template="streak_nudge",
            email_vars={"streak_count": streak_count},
            notif_type="streak_nudge",
        )

        nudged += 1

    logger.info(f"[Scheduler] Streak nudge: {nudged} sent")
    return {"nudged": nudged}


def _run_streak_nudge_manual(options=None):
    """Manual trigger variant of streak nudge.

    options: dict with optional keys (all default False):
      - skip_quiet_hours (bool): skip quiet hours check
      - force_email (bool):      force-send email regardless of user preference
      - skip_dedup (bool):       skip dedup check (useful for testing)
    """
    opts = options or {}
    skip_quiet = opts.get("skip_quiet_hours", False)
    force_email = opts.get("force_email", False)
    skip_dedup = opts.get("skip_dedup", False)

    logger.info(f"[Scheduler] Running streak nudge MANUAL trigger (options={opts})")

    users = mongo.db.user_preferences.find({
        "streak.current": {"$gte": 2},
    })

    counts = {"nudged": 0, "skipped_quiet": 0, "skipped_dedup": 0}

    for prefs in users:
        user_id = prefs["user_id"]

        if not skip_quiet and _is_quiet_hours(prefs):
            counts["skipped_quiet"] += 1
            continue

        # Skip if already active today
        days = _days_since_active(prefs)
        if days is not None and days == 0:
            continue

        streak_count = prefs.get("streak", {}).get("current", 0)
        if streak_count < 2:
            continue

        if not skip_dedup and _sent_today(user_id, "streak_nudge"):
            counts["skipped_dedup"] += 1
            continue

        title = "Jangan Putus Semangat!"
        body = random.choice(STREAK_NUDGE_MESSAGES).replace("{n}", str(streak_count))

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "streak_nudge"},
            send_email=True if force_email else None,
            email_category="streak_nudge" if not force_email else None,
            email_template="streak_nudge",
            email_vars={"streak_count": streak_count},
            notif_type="streak_nudge",
        )

        counts["nudged"] += 1

    logger.info(f"[Scheduler] Streak nudge MANUAL: nudged={counts['nudged']} skipped_quiet={counts['skipped_quiet']} skipped_dedup={counts['skipped_dedup']}")
    return counts


# ---------------------------------------------------------------------------
# Job 4: Social Presence
# ---------------------------------------------------------------------------

@_track_job_run("social_presence")
def job_social_presence():
    """Notify users about peers who are currently studying."""
    if _is_paused("social_presence"):
        logger.info("[Scheduler] social_presence is paused — skipping")
        return {}
    return _run_social_presence()


def _run_social_presence():
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
    sent_tokens = set()  # Token-level dedup: prevent duplicate push to same FCM token
    for prefs in users:
        user_id = prefs["user_id"]

        if user_id in active_user_ids:
            continue
        if _is_quiet_hours(prefs):
            continue

        # [FLAG NOTIF] test: disabled dedup, prod: enabled
        if _sent_today(user_id, "social"):
            continue

        title = "Teman Sedang Belajar"
        body = f"{count} mahasiswa sedang belajar sekarang. Yuk ikut belajar!"

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "social_presence"},
            email_category="social_presence",
            email_template="social_presence",
            email_vars={"active_count": count},
            notif_type="social",
        )

        notified += 1

    logger.info(f"[Scheduler] Social presence: {notified} sent ({count} active users, unique tokens: {len(sent_tokens)})")
    return {"notified": notified, "active_users": count}


def _run_social_presence_manual(options=None):
    """Manual trigger variant of social presence.

    options: dict with optional keys (all default False):
      - skip_quiet_hours (bool): skip quiet hours check
      - force_email (bool):      force-send email regardless of user preference
      - skip_dedup (bool):       skip dedup check (useful for testing)
    """
    opts = options or {}
    skip_quiet = opts.get("skip_quiet_hours", False)
    force_email = opts.get("force_email", False)
    skip_dedup = opts.get("skip_dedup", False)

    logger.info(f"[Scheduler] Running social presence MANUAL trigger (options={opts})")

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
        logger.info("[Scheduler] Social presence MANUAL: no active sessions")
        return {"notified": 0, "active_users": 0, "skipped_quiet": 0, "skipped_dedup": 0}

    count = len(active_user_ids)

    users = mongo.db.user_preferences.find({
        "notifications.social_presence_enabled": True,
    })

    counts = {"notified": 0, "skipped_quiet": 0, "skipped_dedup": 0}
    for prefs in users:
        user_id = prefs["user_id"]

        if user_id in active_user_ids:
            continue

        if not skip_quiet and _is_quiet_hours(prefs):
            counts["skipped_quiet"] += 1
            continue

        if not skip_dedup and _sent_today(user_id, "social"):
            counts["skipped_dedup"] += 1
            continue

        title = "Teman Sedang Belajar"
        body = f"{count} mahasiswa sedang belajar sekarang. Yuk ikut belajar!"

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "social_presence"},
            send_email=True if force_email else None,
            email_category="social_presence" if not force_email else None,
            email_template="social_presence",
            email_vars={"active_count": count},
            notif_type="social",
        )

        counts["notified"] += 1

    logger.info(f"[Scheduler] Social presence MANUAL: notified={counts['notified']} skipped_quiet={counts['skipped_quiet']} skipped_dedup={counts['skipped_dedup']} active={count}")
    return {**counts, "active_users": count}


# ---------------------------------------------------------------------------
# Job 5: Orphan Session Cleanup
# ---------------------------------------------------------------------------

def job_cleanup_orphan_sessions():
    """End study sessions that have been running for over 3 hours without ending."""
    if _is_paused("orphan_cleanup"):
        logger.info("[Scheduler] orphan_cleanup is paused — skipping")
        return
    from features.study_session.model import StudySession
    cleaned = StudySession.cleanup_orphan_sessions(
        max_age_hours=3,
        heartbeat_max_minutes=90,
    )  # [FLAG STUDY] prod: 3h+90min, test: 10min+2min
    if cleaned:
        logger.info(f"[Scheduler] Orphan session cleanup: {cleaned} sessions ended")


# ---------------------------------------------------------------------------
# Job 6: Idle Session Check (push notification after 30 min inactivity)
# ---------------------------------------------------------------------------

def job_check_idle_sessions():
    """Find active sessions idle >30 min and send a nudge notification."""
    if _is_paused("check_idle_sessions"):
        logger.info("[Scheduler] check_idle_sessions is paused — skipping")
        return
    logger.info("[Scheduler] Running idle session check")

    now = datetime.utcnow()
    idle_cutoff = now - timedelta(minutes=30)  # [FLAG STUDY] prod: 30min, test: 2min

    idle_sessions = list(mongo.db.study_sessions.find({
        "end_time": None,
        "last_heartbeat": {"$exists": True, "$lt": idle_cutoff},
        "idle_notified": {"$ne": True},
    }))

    logger.info(f"[Scheduler] Idle check: found {len(idle_sessions)} idle sessions")

    notified = 0
    for session in idle_sessions:
        user_id = session["user_id"]
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            logger.warning(f"[Scheduler] Idle check: no prefs for user {user_id}")
            continue

        title = "Masih belajar?"
        body = "Kamu sudah lama tidak terlihat. Ketuk untuk kembali belajar."

        _notify_user(
            user_id,
            title,
            body,
            data={"type": "idle_session", "session_id": str(session["_id"])},
            email_category="study_session",
            email_template="idle_session",
            notif_type="idle_session",
        )

        result = mongo.db.study_sessions.update_one(
            {"_id": session["_id"], "end_time": None},
            {"$set": {"idle_notified": True}},
        )
        logger.info(f"[Scheduler] Idle check: session {session['_id']} idle_notified=True, matched={result.matched_count}, modified={result.modified_count}")

        notified += 1

    if notified:
        logger.info(f"[Scheduler] Idle session check: {notified} notifications sent")


# ---------------------------------------------------------------------------
# Job 7: Auto-End Stale Sessions (after 90 min inactivity)
# ---------------------------------------------------------------------------

def job_auto_end_stale_sessions():
    """Auto-end sessions idle >90 min and notify users."""
    if _is_paused("auto_end_stale_sessions"):
        logger.info("[Scheduler] auto_end_stale_sessions is paused — skipping")
        return
    from features.study_session.model import StudySession
    from shared.log_model import Log

    logger.info("[Scheduler] Running auto-end stale sessions")

    ended = StudySession.auto_end_stale(minutes_threshold=90)  # [FLAG STUDY] prod: 90min, test: 5min

    logger.info(f"[Scheduler] Auto-end stale: {len(ended)} sessions to end")

    notified = 0
    for item in ended:
        user_oid = ObjectId(item["user_id"]) if isinstance(item["user_id"], str) else item["user_id"]
        prefs = mongo.db.user_preferences.find_one({"user_id": user_oid})
        if not prefs:
            continue

        title = "Sesi belajar diakhiri"
        body = "Kamu sudah lama tidak aktif. Sesi belajarmu telah diakhiri otomatis."
        result = _notify_user(
            user_oid,
            title,
            body,
            data={"type": "auto_end", "session_id": item["session_id"]},
            email_category="study_session",
            email_template="auto_end",
            email_vars={"session_duration": "90 menit"},
            notif_type="auto_end",
        )
        logger.info(f"[Scheduler] Auto-end notify result: push={result['push_sent']}, email={result['email_sent']}")
        if result["push_sent"] or result["email_sent"]:
            notified += 1

        Log.create(item["user_id"], "session_auto_ended", f"Session {item['session_id']} auto-ended (90min threshold)")

    if ended:
        logger.info(f"[Scheduler] Auto-end stale: {len(ended)} sessions ended, {notified} notifications sent")


# ---------------------------------------------------------------------------
# Job 8: Reset Stale Streaks
# ---------------------------------------------------------------------------

def job_reset_stale_streaks():
    """Reset streak for users who haven't been active for 2+ days (gap > 1).

    Logic:
    - gap 0: active today — skip
    - gap 1: grace period — skip (streak still alive)
    - gap >= 2: streak broken — reset current to 0

    Bug fixes applied:
    - Bug #2: Previously used $lt yesterday_utc which resets gap=1 users incorrectly.
              Now fetches candidates and checks actual gap per user.
    - Bug #3: Now also syncs longest when current resets (no-op since longest >= current,
              but guards against future inconsistencies).
    """
    if _is_paused("reset_stale_streaks"):
        logger.info("[Scheduler] reset_stale_streaks is paused — skipping")
        return
    logger.info("[Scheduler] Running stale streak reset")

    wib_now = now_wib()
    today_wib = wib_now.date()

    # Fetch all users with active streak
    # Use a wide filter: last_active_date older than 1 day ago in UTC (rough pre-filter)
    two_days_ago_utc = (wib_now - timedelta(days=2)).replace(tzinfo=None)
    candidates = list(mongo.db.user_preferences.find(
        {
            "streak.current": {"$gt": 0},
            "streak.last_active_date": {"$lt": two_days_ago_utc},
        },
        {
            "user_id": 1,
            "streak.current": 1,
            "streak.longest": 1,
            "streak.last_active_date": 1,
        }
    ))

    stale_user_ids = []
    for user in candidates:
        last_active = user.get("streak", {}).get("last_active_date")
        if not last_active:
            continue

        # Convert UTC stored date to WIB date
        last_date_wib = (last_active + timedelta(hours=7)).date()
        gap = (today_wib - last_date_wib).days

        # Only reset if gap > 1 (gap == 1 is grace period, streak still alive)
        if gap > 1:
            stale_user_ids.append(user["user_id"])

    if stale_user_ids:
        result = mongo.db.user_preferences.update_many(
            {"user_id": {"$in": stale_user_ids}},
            {
                "$set": {
                    "streak.current": 0,
                    # Bug #3 fix: longest is never decreased, only current resets to 0
                    # longest stays unchanged (already >= current)
                    "updated_at": datetime.utcnow(),
                }
            }
        )
        logger.info(f"[Scheduler] Stale streak reset: {result.modified_count} users (gap > 1)")
    else:
        logger.info("[Scheduler] Stale streak reset: 0 users to reset")


# ---------------------------------------------------------------------------
# Quest Expiry
# ---------------------------------------------------------------------------
# Init
# ---------------------------------------------------------------------------

def init_scheduler(app):
    """Initialize and start the APScheduler with all jobs."""
    with app.app_context():
        # ── [FLAG NOTIF] Notification scheduler intervals (prod) ──
        scheduler.add_job(
            job_deadline_reminder, "interval", hours=2,      # [FLAG DL REMINDER] test: minutes=30, prod: hours=2
            id="deadline_reminder", replace_existing=True,
        )
        scheduler.add_job(
            job_smart_reminder, "interval", hours=1,          # [FLAG NOTIF] prod: hours=1
            id="smart_reminder", replace_existing=True,
        )
        scheduler.add_job(
            job_streak_nudge, "interval", hours=6,            # [FLAG NOTIF] prod: hours=6
            id="streak_nudge", replace_existing=True,
        )
        scheduler.add_job(
            job_social_presence, "interval", minutes=30,     # [FLAG NOTIF] prod: minutes=30
            id="social_presence", replace_existing=True,
        )
        scheduler.add_job(
            job_cleanup_orphan_sessions, "interval", hours=6,  # [FLAG STUDY] prod: 6h, test: 9min
            id="orphan_cleanup", replace_existing=True,
        )
        scheduler.add_job(
            job_check_idle_sessions, "interval", minutes=10,  # [FLAG STUDY] prod: 10min, test: 2min
            id="check_idle_sessions", replace_existing=True,
        )
        scheduler.add_job(
            job_auto_end_stale_sessions, "interval", minutes=10, # [FLAG STUDY] prod: 10min, test: 5min
            id="auto_end_stale_sessions", replace_existing=True,
        )
        scheduler.add_job(
            job_reset_stale_streaks, "cron", hour=0, minute=0, timezone="Asia/Jakarta",
            id="reset_stale_streaks", replace_existing=True,
        )
        scheduler.start()
        logger.info("[Scheduler] Started with 8 jobs: deadline_reminder, smart_reminder, streak_nudge, social_presence, orphan_cleanup, check_idle_sessions, auto_end_stale_sessions, reset_stale_streaks")
