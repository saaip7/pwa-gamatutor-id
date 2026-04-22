from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.study_session.model import StudySession
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log
from shared.streak import update_streak
from shared.db import mongo
from bson import ObjectId


@jwt_required()
def start():
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    if not card_id:
        return jsonify({"error": "Missing card_id"}), 400
    session = StudySession.create(user_id, card_id)

    # Update streak — study session is a meaningful activity
    streak = update_streak(user_id)

    return jsonify({**session, "streak": streak}), 201


@jwt_required()
def end():
    user_id = get_jwt_identity()
    session_id = request.json.get("session_id")
    hidden_ms = request.json.get("hidden_ms", 0)
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    success = StudySession.end(session_id, hidden_ms=hidden_ms)
    if not success:
        return jsonify({"error": "Session not found"}), 404

    badge_results = BadgeEngine.evaluate(user_id, "session_completed")
    Log.create(user_id, "session_completed", f"Study session {session_id} completed")

    return jsonify({
        "message": "Session ended",
        "newlyUnlocked": badge_results,
        "duration_ms": success["duration_ms"],
    }), 200


@jwt_required()
def heartbeat():
    """Receive a heartbeat ping from FE to signal user is still actively studying."""
    session_id = request.json.get("session_id")
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    success = StudySession.update_heartbeat(session_id)
    if not success:
        return jsonify({"error": "Session not found"}), 404
    return jsonify({"success": True}), 200


@jwt_required()
def get_session(session_id):
    """Get a single study session by ID. Used by FE to validate resume."""
    session = StudySession.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(session), 200


@jwt_required()
def get_card_sessions(card_id):
    user_id = get_jwt_identity()
    sessions = StudySession.get_by_card(card_id)
    total = StudySession.get_total_time(card_id)
    return jsonify({
        "sessions": sessions,
        "total_study_time_minutes": total,
    }), 200


@jwt_required()
def get_history():
    """Get all study sessions for current user with card info and course filter."""
    from datetime import datetime
    user_id = get_jwt_identity()
    oid = ObjectId(user_id)

    course_code = request.args.get("course_code", "").strip()
    sort_by = request.args.get("sort", "time")

    query = {"user_id": oid, "orphan": {"$ne": True}}
    sessions = list(
        mongo.db.study_sessions.find(query).sort("start_time", -1)
    )

    card_ids = list({s["card_id"] for s in sessions if s.get("card_id")})
    cards_cursor = mongo.db.cards.find(
        {"card_id": {"$in": card_ids}},
        {"card_id": 1, "task_name": 1, "course_name": 1, "reflection": 1}
    )
    card_map = {c["card_id"]: c for c in cards_cursor}

    course_names = set()
    for c in card_map.values():
        if c.get("course_name"):
            course_names.add(c["course_name"])

    course_code_map = {}
    for c in mongo.db.courses.find({"course_name": {"$in": list(course_names)}}):
        course_code_map[c["course_name"]] = c.get("course_code", c["course_name"])

    if course_code:
        name_from_code = None
        for cname, ccode in course_code_map.items():
            if ccode == course_code:
                name_from_code = cname
                break
        if name_from_code:
            filtered_session_ids = set()
            for cid, c in card_map.items():
                if c.get("course_name") == name_from_code:
                    filtered_session_ids.add(cid)
            sessions = [s for s in sessions if s.get("card_id") in filtered_session_ids]

    available_courses = [{"name": n, "code": course_code_map.get(n, n)} for n in sorted(course_names)]

    total_sec = 0
    for s in sessions:
        if s.get("start_time") and s.get("end_time"):
            wall = int((s["end_time"] - s["start_time"]).total_seconds())
            hid = int(s.get("hidden_ms", 0) / 1000)
            total_sec += max(0, wall - hid)
    summary = {
        "total_sessions": len(sessions),
        "total_study_sec": total_sec,
        "total_courses": len(available_courses),
    }

    if course_code:
        name_from_code = None
        for cname, ccode in course_code_map.items():
            if ccode == course_code:
                name_from_code = cname
                break
        if name_from_code:
            filtered_session_ids = set()
            for cid, c in card_map.items():
                if c.get("course_name") == name_from_code:
                    filtered_session_ids.add(cid)
            sessions = [s for s in sessions if s.get("card_id") in filtered_session_ids]

    result = []
    for s in sessions:
        card = card_map.get(s.get("card_id"), {})
        wall_sec = 0
        net_sec = 0
        if s.get("start_time") and s.get("end_time"):
            wall_sec = int((s["end_time"] - s["start_time"]).total_seconds())
            hidden_sec = int(s.get("hidden_ms", 0) / 1000)
            net_sec = max(0, wall_sec - hidden_sec)

        reflection = card.get("reflection") or {}
        has_reflection = bool(reflection.get("completed_at"))

        result.append({
            "session_id": str(s["_id"]),
            "card_id": s.get("card_id", ""),
            "task_name": card.get("task_name", "Tugas tanpa judul"),
            "course_name": card.get("course_name", ""),
            "course_code": course_code_map.get(card.get("course_name", ""), ""),
            "start_time": s["start_time"].isoformat() if isinstance(s.get("start_time"), datetime) else None,
            "end_time": s["end_time"].isoformat() if isinstance(s.get("end_time"), datetime) else None,
            "duration_sec": net_sec,
            "status": "completed" if s.get("end_time") else "active",
            "auto_ended": s.get("auto_ended", False),
            "has_reflection": has_reflection,
        })

    if sort_by == "longest":
        result.sort(key=lambda x: x["duration_sec"], reverse=True)

    return jsonify({
        "sessions": result,
        "available_courses": available_courses,
        "summary": summary,
    }), 200
