from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.board.model import Board
from shared.log_model import Log


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
def update_board():
    user_id = get_jwt_identity()
    data = request.json
    board_id = data.get("boardId")
    lists = data.get("lists")

    if not board_id or not lists:
        return jsonify({"message": "Missing boardId or lists"}), 400

    result = Board.update_board(board_id, user_id, lists)
    if not result or result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404
    return jsonify({"message": "Board updated successfully"}), 200


@jwt_required()
def update_card():
    user_id = get_jwt_identity()
    data = request.json
    card_id = data.get("card_id")

    if not card_id:
        return jsonify({"message": "Missing card_id"}), 400

    # Build updates from allowed fields
    allowed_fields = [
        "title", "sub_title", "description", "course_name",
        "difficulty", "priority", "learning_strategy",
        "pre_test_grade", "post_test_grade", "satisfaction_rating",
        "notes", "archived", "deleted",
        "reflection", "personal_best", "goal_check",
        "checklists", "links", "column_movements",
    ]
    updates = {k: v for k, v in data.items() if k in allowed_fields and k != "card_id"}

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    # Add created_at for new cards
    if "created_at" in data:
        from datetime import datetime
        updates["created_at"] = datetime.utcnow()

    success, msg, code = Board.update_card(user_id, card_id, updates)
    return jsonify({"message": msg}), code


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
