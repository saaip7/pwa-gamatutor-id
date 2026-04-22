from flask import jsonify, request
from bson import ObjectId
from shared.db import mongo
from features.analytics.model import Analytics
from features.board.model import Board, Card
from features.badge.model import Badge
import re


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
