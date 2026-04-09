from flask import jsonify, request
from bson import ObjectId
from shared.db import mongo
from features.analytics.model import Analytics
from features.board.model import Board
from features.badge.model import Badge
import re


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

    # Goals
    goals = list(mongo.db.goals.find({"user_id": oid}))
    for g in goals:
        g["_id"] = str(g["_id"])
        g["user_id"] = str(g["user_id"])

    # Board
    board = mongo.db.boards.find_one({"user_id": oid})
    if board:
        board["_id"] = str(board["_id"])
        board["user_id"] = str(board["user_id"])

    # Recent study sessions (last 20)
    study_sessions = list(
        mongo.db.study_sessions.find({"user_id": oid})
        .sort("start_time", -1)
        .limit(20)
    )
    for s in study_sessions:
        s["_id"] = str(s["_id"])
        s["user_id"] = str(s["user_id"])

    # Streak info from preferences
    streak_info = None
    if preferences and "streak" in preferences:
        streak_info = preferences["streak"]

    return jsonify({
        "user": user,
        "preferences": preferences,
        "badges": badges,
        "goals": goals,
        "board": board,
        "recent_study_sessions": study_sessions,
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

    total = mongo.db.logs.count_documents(query)
    logs = list(
        mongo.db.logs.find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )

    for log in logs:
        log["_id"] = str(log["_id"])
        log["user_id"] = str(log["user_id"])

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
        # Card counts
        total = 0
        done = 0
        for lst in board.get("lists", []):
            count = len(lst.get("cards", []))
            total += count
            if lst.get("id") == "list4":
                done += count
        board["total_cards"] = total
        board["done_cards"] = done

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

    board = Board.find_by_user_id(user_id)
    if board:
        board["_id"] = str(board["_id"])
        board["user_id"] = str(board["user_id"])

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
