from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.board.model import Board
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log
from shared.streak import update_streak


@jwt_required()
def get_board():
    user_id = get_jwt_identity()
    board = Board.find_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404
    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": board["lists"],
    }), 200


@jwt_required()
def create_board():
    """Create or recreate board for current user."""
    user_id = get_jwt_identity()
    existing = Board.find_by_user_id(user_id)
    if existing:
        Board.delete_board(str(existing["_id"]), user_id)
    username = request.json.get("username", "User")
    board_id = Board.create_initial_board(user_id, username)
    return jsonify({
        "message": "Board created",
        "board_id": board_id,
    }), 201


@jwt_required()
def update_board():
    user_id = get_jwt_identity()
    data = request.json
    board_id = data.get("boardId")
    lists = data.get("lists")

    if not board_id or not lists:
        return jsonify({"message": "Missing boardId or lists"}), 400

    # Detect cards that moved to Done (list4) before updating
    old_board = Board.find_by_user_id(user_id)
    old_done_ids = set()
    if old_board:
        for lst in old_board.get("lists", []):
            if lst.get("id") == "list4":
                old_done_ids = {c.get("id") for c in lst.get("cards", [])}

    result = Board.update_board(board_id, user_id, lists)
    if not result or result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    # Check for newly completed tasks (cards moved to Done)
    new_done_ids = set()
    for lst in lists:
        if lst.get("id") == "list4":
            new_done_ids = {c.get("id") for c in lst.get("cards", [])}

    newly_completed = new_done_ids - old_done_ids
    badge_results = []
    streak = None

    if newly_completed:
        # Check if completed cards have reflection (streak only counts with reflection)
        has_reflection = False
        for lst in lists:
            if lst.get("id") == "list4":
                for card in lst.get("cards", []):
                    if card.get("id") in newly_completed:
                        if card.get("reflection") and card["reflection"].get("q2_confidence"):
                            has_reflection = True
                            break
                if has_reflection:
                    break

        if has_reflection:
            streak = update_streak(user_id)
            Log.create(user_id, "streak_active", "Streak updated — task completed with reflection")

        unlocked = BadgeEngine.evaluate(user_id, "task_done")
        badge_results.extend(unlocked)
        Log.create(user_id, "task_done", f"{len(newly_completed)} task(s) moved to Done")

    return jsonify({
        "message": "Board updated successfully",
        "newlyUnlocked": badge_results,
        "streak": streak,
    }), 200


@jwt_required()
def update_card(card_id):
    user_id = get_jwt_identity()
    data = request.json

    # Build updates from allowed fields
    allowed_fields = [
        "title", "sub_title", "description", "course_name",
        "difficulty", "priority", "learning_strategy",
        "pre_test_grade", "post_test_grade", "satisfaction_rating",
        "notes", "archived", "deleted",
        "reflection", "personal_best", "goal_check",
        "checklists", "links", "column_movements",
    ]
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    success, msg, code = Board.update_card(user_id, card_id, updates)
    if not success:
        return jsonify({"message": msg}), code

    # Fire badge triggers based on what was updated
    badge_results = []

    if "reflection" in updates and updates["reflection"]:
        unlocked = BadgeEngine.evaluate(user_id, "reflection_completed")
        badge_results.extend(unlocked)
        Log.create(user_id, "reflection_completed", f"Reflection saved for card {card_id}")

    if "learning_strategy" in updates and updates["learning_strategy"]:
        unlocked = BadgeEngine.evaluate(user_id, "strategy_used")
        badge_results.extend(unlocked)
        Log.create(user_id, "strategy_used", f"Strategy set: {updates['learning_strategy']}")

    if "post_test_grade" in updates:
        unlocked = BadgeEngine.evaluate(user_id, "grade_updated")
        badge_results.extend(unlocked)
        Log.create(user_id, "grade_updated", f"Grade updated for card {card_id}")

    return jsonify({
        "message": msg,
        "newlyUnlocked": badge_results,
    }), code


@jwt_required()
def get_card_detail(card_id):
    user_id = get_jwt_identity()
    card, list_title, board_id = Board.find_card(user_id, card_id)
    if not card:
        return jsonify({"message": "Card not found"}), 404
    return jsonify({
        "card": card,
        "list_title": list_title,
        "board_id": board_id,
    }), 200
