from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timezone
from features.board.model import Board, Card, _ensure_card_indexes
from features.badge.badge_engine import BadgeEngine
from shared.db import mongo
from shared.log_model import Log
from shared.streak import update_streak


# ---------------------------------------------------------------------------
# List definitions (kept here for FE-compatible response assembly)
# ---------------------------------------------------------------------------
LIST_DEFINITIONS = [
    {"id": "list1", "title": "Planning (To Do)"},
    {"id": "list2", "title": "Monitoring (In Progress)"},
    {"id": "list3", "title": "Controlling (Review)"},
    {"id": "list4", "title": "Reflection (Done)"},
]


def _serialize_card(card_doc):
    """Convert a MongoDB card document into the FE-expected card dict.

    The FE expects cards to have an ``id`` field (the 8-char hex card_id),
    not the MongoDB ``_id``.
    """
    return {
        "id": card_doc["card_id"],
        "task_name": card_doc.get("task_name", ""),
        "sub_title": card_doc.get("sub_title"),
        "description": card_doc.get("description"),
        "course_name": card_doc.get("course_name"),
        "difficulty": card_doc.get("difficulty"),
        "priority": card_doc.get("priority"),
        "learning_strategy": card_doc.get("learning_strategy"),
        "pre_test_grade": card_doc.get("pre_test_grade"),
        "post_test_grade": card_doc.get("post_test_grade"),
        "satisfaction_rating": card_doc.get("satisfaction_rating"),
        "reflection": card_doc.get("reflection"),
        "personal_best": card_doc.get("personal_best"),
        "goal_check": card_doc.get("goal_check"),
        "checklists": card_doc.get("checklists", []),
        "links": card_doc.get("links", []),
        "column_movements": card_doc.get("column_movements", []),
        "archived": card_doc.get("archived", False),
        "deleted": card_doc.get("deleted", False),
        "deadline": card_doc.get("deadline"),
        "column": card_doc.get("column", "list1"),
        "position": card_doc.get("position", 0),
        "created_at": card_doc.get("created_at"),
        "updated_at": card_doc.get("updated_at"),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@jwt_required()
def get_board():
    """GET /board — Return board with cards assembled into FE-compatible lists."""
    user_id = get_jwt_identity()
    board = Board.find_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404

    board_id = str(board["_id"])

    # Fetch all (non-deleted) cards for this board
    all_cards = Card.find_by_board(user_id, board_id)

    # Bucket cards by column
    buckets: dict[str, list] = {ld["id"]: [] for ld in LIST_DEFINITIONS}
    for card_doc in all_cards:
        col = card_doc.get("column", "list1")
        if col not in buckets:
            col = "list1"
        buckets[col].append(_serialize_card(card_doc))

    # Assemble lists in canonical order
    lists = [
        {"id": ld["id"], "title": ld["title"], "cards": buckets[ld["id"]]}
        for ld in LIST_DEFINITIONS
    ]

    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": lists,
    }), 200


@jwt_required()
def get_archived_cards():
    """GET /board/archived — Return all archived cards for the current user."""
    user_id = get_jwt_identity()
    cards = Card.find_archived(user_id)
    return jsonify({
        "cards": [_serialize_card(c) for c in cards],
    }), 200


@jwt_required()
def create_board():
    """POST /board — Create or recreate board for current user."""
    user_id = get_jwt_identity()
    username = request.json.get("username", "User")

    # Delete existing board + its cards if present
    existing = Board.find_by_user_id(user_id)
    if existing:
        Board.delete_board(str(existing["_id"]), user_id)

    _ensure_card_indexes()

    board_id = Board.create(user_id, username)

    # Return the same shape as get_board so FE can parse lists
    empty_lists = [
        {"id": ld["id"], "title": ld["title"], "cards": []}
        for ld in LIST_DEFINITIONS
    ]
    return jsonify({
        "message": "Board created",
        "board_id": board_id,
        "id": board_id,
        "name": f"{username}'s Board",
        "lists": empty_lists,
    }), 201


@jwt_required()
def move_card(card_id):
    """PATCH /board/card/<card_id>/move — Move a card to a different column/position.

    Also handles badge + streak triggers when card moves to Done (list4).
    """
    user_id = get_jwt_identity()
    data = request.json

    new_column = data.get("column")  # "list1", "list2", "list3", "list4"
    new_position = data.get("position", 0)  # integer

    if not new_column or new_column not in ("list1", "list2", "list3", "list4"):
        return jsonify({"message": "Invalid column"}), 400

    # Get current card state before moving
    card = Card.find_by_id(user_id, card_id)
    if not card or card.get("deleted"):
        return jsonify({"message": "Card not found"}), 404

    old_column = card.get("column", "list1")

    # Prevent manual drag to reflection (list4) without reflection data
    if new_column == "list4" and old_column != "list4":
        reflection = card.get("reflection")
        if not reflection or not reflection.get("q2_confidence"):
            return jsonify({
                "message": "Kartu hanya bisa dipindahkan ke Reflection setelah mengisi sesi refleksi.",
            }), 403

    # Move the card
    success = Card.move_card(user_id, card_id, new_column, new_position)
    if not success:
        return jsonify({"message": "Move failed"}), 500

    streak = None
    badge_results = []

    if old_column != new_column:
        now = datetime.now(timezone.utc)

        movement_entry = {
            "user_id": user_id if isinstance(user_id, str) else str(user_id),
            "from": old_column,
            "to": new_column,
            "task_name": card.get("task_name", ""),
            "card_id": card_id,
            "timestamp": now.isoformat(),
        }

        mongo.db.cards.update_one(
            {"card_id": card_id, "user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id},
            {"$push": {"column_movements": movement_entry}}
        )

        COLUMN_LABELS = {"list1": "Planning", "list2": "Monitoring", "list3": "Controlling", "list4": "Reflection"}
        from_label = COLUMN_LABELS.get(old_column, old_column)
        to_label = COLUMN_LABELS.get(new_column, new_column)
        task_name = card.get("task_name", card_id)
        Log.create(
            user_id,
            "card_moved",
            f"{task_name}: {from_label} → {to_label}",
            metadata={"card_id": card_id, "from": old_column, "to": new_column}
        )

        streak = update_streak(user_id)

    # Badge triggers when card moves to Done
    if new_column == "list4" and old_column != "list4":
        unlocked = BadgeEngine.evaluate(user_id, "task_done")
        badge_results.extend(unlocked)
        Log.create(user_id, "task_done", f"Task moved to Done: {card.get('task_name', card_id)}")

    return jsonify({
        "message": "Card moved",
        "newlyUnlocked": badge_results,
        "streak": streak,
    }), 200


@jwt_required()
def reorder_column():
    """PUT /board/column/reorder — Reorder cards within a column after drag-and-drop."""
    user_id = get_jwt_identity()
    data = request.json

    column = data.get("column")  # "list1" etc
    card_ids = data.get("card_ids", [])  # ordered list of card_id strings

    if not column or column not in ("list1", "list2", "list3", "list4"):
        return jsonify({"message": "Invalid column"}), 400

    board = Board.find_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404

    board_id = str(board["_id"])
    Card.reposition_column(user_id, board_id, column, card_ids)

    return jsonify({"message": "Column reordered"}), 200


@jwt_required()
def create_card():
    """POST /board/card — Create a new card in the user's board."""
    user_id = get_jwt_identity()
    data = request.json or {}

    board = Board.find_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404

    board_id = str(board["_id"])

    card = Card.create(user_id, board_id, data)

    Log.create(user_id, "task_created", f"Card created: {card.get('task_name', '')}")
    update_streak(user_id)

    return jsonify({
        "message": "Card created",
        "card": _serialize_card(card),
    }), 201


@jwt_required()
def get_card_detail(card_id):
    """GET /board/card/<card_id> — Return single card detail."""
    user_id = get_jwt_identity()
    card = Card.find_by_id(user_id, card_id)
    if not card or card.get("deleted"):
        return jsonify({"message": "Card not found"}), 404

    # Determine list title from column
    col = card.get("column", "list1")
    list_title = next(
        (ld["title"] for ld in LIST_DEFINITIONS if ld["id"] == col),
        LIST_DEFINITIONS[0]["title"],
    )

    return jsonify({
        "card": _serialize_card(card),
        "list_title": list_title,
        "board_id": str(card["board_id"]),
    }), 200


@jwt_required()
def update_card(card_id):
    """PUT /board/card/<card_id> — Partial card update."""
    user_id = get_jwt_identity()
    data = request.json

    allowed_fields = [
        "task_name", "sub_title", "description", "course_name",
        "difficulty", "priority", "learning_strategy",
        "pre_test_grade", "post_test_grade", "satisfaction_rating",
        "archived", "deleted",
        "reflection", "personal_best", "goal_check",
        "checklists", "links", "column_movements",
        "deadline",
    ]
    updates = {k: v for k, v in data.items() if k in allowed_fields}

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    success, msg, code = Card.update_card(user_id, card_id, updates)
    if not success:
        return jsonify({"message": msg}), code

    # Fire badge triggers based on what was updated
    badge_results = []

    if "reflection" in updates and updates["reflection"]:
        update_streak(user_id)
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
def delete_card(card_id):
    """DELETE /board/card/<card_id> — Hard delete a card and its study sessions."""
    user_id = get_jwt_identity()

    success = Card.delete_card(user_id, card_id)
    if not success:
        return jsonify({"message": "Card not found"}), 404

    # Also delete all study sessions for this card
    mongo.db.study_sessions.delete_many({"card_id": card_id})

    Log.create(user_id, "task_deleted", f"Card deleted: {card_id}")

    return jsonify({"message": "Card deleted"}), 200
