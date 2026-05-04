from flask import jsonify, request
from bson import ObjectId
from shared.db import mongo
from features.analytics.model import Analytics
from features.board.model import Board, Card
from features.badge.model import Badge
from shared.email import send_email
from shared.email_templates import admin_broadcast
import re
import logging
from datetime import datetime, timedelta
import time

logger = logging.getLogger(__name__)


def _build_board_with_cards(board_doc, user_id):
    """Merge board metadata + cards from separate collection,
    grouped by column to match FE expected shape."""
    if not board_doc:
        return None

    board_id = board_doc["_id"]
    cards = Card.find_by_board(user_id, board_id)

    groups = {"list1": [], "list2": [], "list3": [], "list4": []}
    for card in cards:
        col = card.get("column", "list1")
        if col in groups:
            card["_id"] = str(card["_id"])
            card["user_id"] = str(card["user_id"])
            card["board_id"] = str(card["board_id"])
            groups[col].append(card)

    return {
        "_id": str(board_doc["_id"]),
        "user_id": str(board_doc["user_id"]),
        "name": board_doc.get("name", ""),
        "lists": [
            {"id": "list1", "title": "Planning", "cards": groups["list1"]},
            {"id": "list2", "title": "Monitoring", "cards": groups["list2"]},
            {"id": "list3", "title": "Controlling", "cards": groups["list3"]},
            {"id": "list4", "title": "Reflection", "cards": groups["list4"]},
        ],
    }


def list_users():
    """List all users with pagination and optional search on name/email."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
    except (ValueError, TypeError):
        page, per_page = 1, 20

    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20

    skip = (page - 1) * per_page

    query = {}
    search = request.args.get("search", "").strip()
    if search:
        regex = re.compile(re.escape(search), re.IGNORECASE)
        query = {"$or": [{"name": regex}, {"email": regex}]}

    total = mongo.db.users.count_documents(query)
    users = list(
        mongo.db.users.find(query, {"password": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    for user in users:
        user["_id"] = str(user["_id"])

    return jsonify({
        "data": users,
        "total": total,
        "page": page,
        "per_page": per_page,
    }), 200


def get_user_detail(user_id):
    """Get full user detail aggregated from multiple collections."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID format"}), 400

    user = mongo.db.users.find_one({"_id": oid}, {"password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404

    user["_id"] = str(user["_id"])

    # Preferences
    preferences = mongo.db.user_preferences.find_one({"user_id": oid})
    if preferences:
        preferences["_id"] = str(preferences["_id"])
        preferences["user_id"] = str(preferences["user_id"])

    # Badges — use Badge model to get ALL definitions + unlock status
    badges = Badge.get_all_badges(user_id)

    # Goals — stringify ObjectIds for JSON serialization
    goals = list(mongo.db.goals.find({"user_id": oid}))
    for g in goals:
        g["_id"] = str(g["_id"])
        g["user_id"] = str(g["user_id"])
        if "card_id" in g and g["card_id"]:
            g["card_id"] = str(g["card_id"])

    # Task goals — from goal_check field on cards
    task_goals = []
    cards_with_goals = list(mongo.db.cards.find(
        {"user_id": oid, "goal_check": {"$exists": True, "$ne": None}},
        {"card_id": 1, "task_name": 1, "course_name": 1, "goal_check": 1}
    ))
    for c in cards_with_goals:
        gc = c.get("goal_check", {})
        if gc and gc.get("goal_text"):
            task_goals.append({
                "card_id": c.get("card_id", str(c["_id"])),
                "task_name": c.get("task_name", ""),
                "course_name": c.get("course_name"),
                "goal_text": gc.get("goal_text", ""),
                "helpful": gc.get("helpful"),
            })

    # Board (metadata + cards from separate collection)
    board_doc = mongo.db.boards.find_one({"user_id": oid})
    board = _build_board_with_cards(board_doc, user_id)

    # Study sessions (all) + total time
    study_sessions = list(
        mongo.db.study_sessions.find({"user_id": oid})
        .sort("start_time", -1)
    )
    total_session_sec = 0
    total_session_sec_valid = 0
    total_sessions_orphan = 0
    for s in study_sessions:
        s["_id"] = str(s["_id"])
        s["user_id"] = str(s["user_id"])
        if s.get("card_id"):
            s["card_id"] = str(s["card_id"])
        is_orphan = s.get("orphan") == True
        if is_orphan:
            total_sessions_orphan += 1
        if s.get("start_time") and s.get("end_time"):
            wall_sec = int((s["end_time"] - s["start_time"]).total_seconds())
            hidden_sec = int(s.get("hidden_ms", 0) / 1000)
            net_sec = max(0, wall_sec - hidden_sec)
            s["duration"] = net_sec
            s["status"] = "completed"
            total_session_sec += net_sec
            if not is_orphan:
                total_session_sec_valid += net_sec
        else:
            s["status"] = "active"

    # Streak info from preferences
    streak_info = None
    if preferences and "streak" in preferences:
        streak_info = preferences["streak"]

    return jsonify({
        "user": user,
        "preferences": preferences,
        "badges": badges,
        "goals": goals,
        "task_goals": task_goals,
        "board": board,
        "recent_study_sessions": study_sessions,
        "total_session_sec": total_session_sec,
        "total_session_sec_valid": total_session_sec_valid,
        "total_sessions_orphan": total_sessions_orphan,
        "streak": streak_info,
    }), 200


def list_logs():
    """List all logs with pagination and optional filters."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
    except (ValueError, TypeError):
        page, per_page = 1, 20

    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20

    skip = (page - 1) * per_page

    query = {}

    action_filter = request.args.get("action", "").strip()
    if action_filter:
        query["action_type"] = action_filter

    user_id_filter = request.args.get("user_id", "").strip()
    if user_id_filter:
        try:
            query["user_id"] = ObjectId(user_id_filter)
        except Exception:
            return jsonify({"message": "Invalid user_id format"}), 400

    search_filter = request.args.get("search", "").strip()

    if search_filter:
        user_ids = [
            u["_id"] for u in
            mongo.db.users.find(
                {"$or": [
                    {"name": {"$regex": search_filter, "$options": "i"}},
                    {"email": {"$regex": search_filter, "$options": "i"}},
                    {"username": {"$regex": search_filter, "$options": "i"}},
                ]},
                {"_id": 1},
            )
        ]
        if user_ids:
            query["user_id"] = {"$in": user_ids}
        else:
            return jsonify({"data": [], "total": 0, "page": page, "per_page": per_page}), 200

    total = mongo.db.logs.count_documents(query)
    logs = list(
        mongo.db.logs.aggregate([
            {"$match": query},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": per_page},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user",
                }
            },
            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": {"$toString": "$_id"},
                    "user_id": {"$toString": "$user_id"},
                    "user_name": {"$ifNull": ["$user.name", None]},
                    "user_email": {"$ifNull": ["$user.email", None]},
                    "action_type": 1,
                    "description": 1,
                    "created_at": 1,
                }
            },
        ])
    )

    return jsonify({
        "data": logs,
        "total": total,
        "page": page,
        "per_page": per_page,
    }), 200


def list_boards():
    """List all boards with user info, optional search."""
    search = request.args.get("search", "").strip()
    query = {}
    if search:
        regex = re.compile(re.escape(search), re.IGNORECASE)
        matching_users = list(mongo.db.users.find(
            {"$or": [{"name": regex}, {"username": regex}]}, {"_id": 1}
        ))
        user_ids = [u["_id"] for u in matching_users]
        query = {"user_id": {"$in": user_ids}}

    boards = list(mongo.db.boards.find(query).sort("updated_at", -1))
    for board in boards:
        board["_id"] = str(board["_id"])
        board["user_id"] = str(board["user_id"])
        # Attach user info
        user = mongo.db.users.find_one({"_id": ObjectId(board["user_id"])}, {"name": 1, "email": 1})
        board["user_name"] = user["name"] if user else "Unknown"
        board["user_email"] = user.get("email", "") if user else ""
        # Card counts from separate cards collection
        board_id = ObjectId(board["_id"])
        uid = ObjectId(board["user_id"])
        board["total_cards"] = mongo.db.cards.count_documents({"user_id": uid, "board_id": board_id, "deleted": {"$ne": True}})
        board["done_cards"] = mongo.db.cards.count_documents({"user_id": uid, "board_id": board_id, "column": "list4", "deleted": {"$ne": True}})

    return jsonify({"data": boards, "total": len(boards)}), 200


def get_user_board(user_id):
    """Get specific user's board with profile info."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID format"}), 400

    user = mongo.db.users.find_one({"_id": oid}, {"password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])

    board_doc = Board.find_by_user_id(user_id)
    board = _build_board_with_cards(board_doc, user_id)

    return jsonify({"user": user, "board": board}), 200


def get_user_analytics(user_id):
    """Get full analytics for a specific user by reusing Analytics model."""
    try:
        ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID format"}), 400

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)}, {"name": 1})
    if not user:
        return jsonify({"message": "User not found"}), 404

    dashboard = Analytics.get_dashboard(user_id)
    progress = Analytics.get_progress(user_id)
    strategy = Analytics.get_strategy_effectiveness(user_id)
    confidence = Analytics.get_confidence_trend(user_id)
    streak_data = Analytics.get_streak(user_id)

    return jsonify({
        "user_id": user_id,
        "user_name": user.get("name", ""),
        "dashboard": dashboard,
        "progress": progress,
        "strategy_effectiveness": strategy,
        "confidence_trend": confidence,
        "streak": streak_data,
    }), 200


def send_broadcast_email():
    """Send broadcast email to all users with valid email."""
    data = request.get_json(silent=True) or {}
    subject = (data.get("subject") or "").strip()
    body = (data.get("body") or "").strip()
    link_text = (data.get("link_text") or "").strip() or None
    link_url = (data.get("link_url") or "").strip() or None

    if not subject or not body:
        return jsonify({"message": "Subject dan body wajib diisi"}), 400

    if link_url and not link_text:
        link_text = "Buka Link"

    # Get all users with email (include role for filtering)
    users = list(mongo.db.users.find(
        {"email": {"$exists": True, "$ne": None, "$ne": ""}},
        {"email": 1, "name": 1, "role": 1}
    ))

    # Filter out admin accounts and invalid/non-whitelisted emails
    from shared.email import should_skip_email
    users = [u for u in users if not should_skip_email(u.get("email"), u.get("role"))]

    if not users:
        return jsonify({"message": "Tidak ada user dengan email yang valid"}), 400

    # Render template once
    subj, html, text = admin_broadcast(subject, body, link_text, link_url)

    sent = 0
    failed = 0
    for user in users:
        ok = send_email(user["email"], subj, html, text)
        if ok:
            sent += 1
        else:
            failed += 1
        # Rate limit: delay 1s between each email to stay well under Resend limit (5 req/s)
        if user is not users[-1]:
            time.sleep(1)

    logger.info(f"Admin broadcast email: sent={sent}, failed={failed}, subject={subject}")

    return jsonify({
        "message": f"Email dikirim ke {sent} user",
        "sent": sent,
        "failed": failed,
        "total": len(users),
    }), 200


# ---------------------------------------------------------------------------
# Scheduler Monitoring
# ---------------------------------------------------------------------------

# Jobs that can be manually triggered (notification jobs)
TRIGGERABLE_JOBS = {
    "deadline_reminder": {"label": "Deadline Reminder", "description": "Cek tugas dengan deadline < 24 jam"},
    "smart_reminder": {"label": "Smart Reminder", "description": "Reminder belajar berdasarkan aktivitas (A/B/C)"},
    "streak_nudge": {"label": "Streak Nudge", "description": "Nudge user dengan streak aktif yang belum belajar"},
    "social_presence": {"label": "Social Presence", "description": "Notifikasi teman yang sedang belajar"},
}


def get_scheduler_status():
    """Return status of all 8 scheduler jobs from APScheduler memory."""
    import os
    from shared.scheduler import scheduler, get_all_job_states, JOB_META

    pause_states = get_all_job_states()
    has_resend = bool(os.environ.get("RESEND_API_KEY", "").strip())

    jobs = []
    for job in scheduler.get_jobs():
        next_run = job.next_run_time
        jobs.append({
            "id": job.id,
            "name": job.name,
            "trigger": str(job.trigger),
            "next_run_time": next_run.isoformat() if next_run else None,
            "triggerable": job.id in TRIGGERABLE_JOBS,
            "paused": pause_states.get(job.id, False),
            "label": TRIGGERABLE_JOBS.get(job.id, JOB_META.get(job.id, {}).get("label", job.id)),
            "channel": "Resend" if has_resend else "SMTP",
        })

    return jsonify({"jobs": jobs, "total": len(jobs)}), 200


def trigger_scheduler_job():
    """Manually trigger a notification job without modifying its schedule.

    Accepts optional `options` dict with keys:
      - skip_quiet_hours (bool): skip quiet hours check
      - force_email (bool):      force-send email regardless of user preference
      - skip_dedup (bool):       skip dedup check (useful for testing)
    """
    import time as _time
    from datetime import datetime as _dt
    from shared.scheduler import (
        _run_deadline_reminder_manual,
        _run_smart_reminder_manual,
        _run_streak_nudge_manual,
        _run_social_presence_manual,
        _log_job_run,
    )

    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id", "").strip()
    options = data.get("options", {})

    # Sanitize options — only accept known keys
    options = {k: bool(v) for k, v in options.items() if k in (
        "skip_quiet_hours", "force_email", "skip_dedup",
    )}

    if job_id not in TRIGGERABLE_JOBS:
        return jsonify({
            "message": f"Job '{job_id}' tidak bisa di-trigger manual. Pilih: {', '.join(TRIGGERABLE_JOBS.keys())}",
        }), 400

    job_map = {
        "deadline_reminder": _run_deadline_reminder_manual,
        "smart_reminder": _run_smart_reminder_manual,
        "streak_nudge": _run_streak_nudge_manual,
        "social_presence": _run_social_presence_manual,
    }

    started = _dt.utcnow()
    t0 = _time.monotonic()
    try:
        fn = job_map[job_id]
        result = fn(options=options)
        duration_ms = round((_time.monotonic() - t0) * 1000, 1)
        _log_job_run(
            job_id,
            triggered_by="manual",
            status="success",
            stats=result if isinstance(result, dict) else None,
            started_at=started,
            finished_at=_dt.utcnow(),
            duration_ms=duration_ms,
        )
        return jsonify({
            "message": f"Job '{job_id}' triggered successfully",
            "job_id": job_id,
            "stats": result if isinstance(result, dict) else None,
        }), 200
    except Exception as e:
        duration_ms = round((_time.monotonic() - t0) * 1000, 1)
        _log_job_run(
            job_id,
            triggered_by="manual",
            status="error",
            error=str(e),
            started_at=started,
            finished_at=_dt.utcnow(),
            duration_ms=duration_ms,
        )
        logger.error(f"[Admin] Manual trigger '{job_id}' failed: {e}")
        return jsonify({"message": f"Job '{job_id}' gagal: {str(e)}"}), 500


def toggle_scheduler_job():
    """Toggle pause/resume for a scheduler job via admin dashboard."""
    from shared.scheduler import _is_paused, set_job_paused, scheduler

    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id", "").strip()

    # Validate job_id against all known jobs
    known_ids = [j.id for j in scheduler.get_jobs()]
    if job_id not in known_ids:
        return jsonify({
            "message": f"Job '{job_id}' tidak ditemukan.",
        }), 400

    current = _is_paused(job_id)
    new_state = not current
    set_job_paused(job_id, new_state)

    return jsonify({
        "job_id": job_id,
        "paused": new_state,
        "message": f"Job '{job_id}' {'di-pause' if new_state else 'di-resume'}",
    }), 200


def get_scheduler_logs():
    """Return run history for notification jobs (last 3 days)."""
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 30))
    except (ValueError, TypeError):
        page, per_page = 1, 30

    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 30

    job_id_filter = request.args.get("job_id", "").strip()
    triggered_by_filter = request.args.get("triggered_by", "").strip()

    query = {}
    if job_id_filter:
        query["job_id"] = job_id_filter
    if triggered_by_filter:
        query["triggered_by"] = triggered_by_filter

    # Only notification jobs
    query["job_id"] = {"$in": list(TRIGGERABLE_JOBS.keys())}
    if job_id_filter:
        query["job_id"] = job_id_filter

    skip = (page - 1) * per_page
    total = mongo.db.scheduler_logs.count_documents(query)

    cursor = (
        mongo.db.scheduler_logs.find(query)
        .sort("started_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    logs = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        doc["started_at"] = doc["started_at"].isoformat() if isinstance(doc["started_at"], datetime) else str(doc["started_at"])
        doc["finished_at"] = doc["finished_at"].isoformat() if isinstance(doc["finished_at"], datetime) else str(doc["finished_at"])
        logs.append(doc)

    return jsonify({
        "data": logs,
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": (total + per_page - 1) // per_page,
    }), 200
