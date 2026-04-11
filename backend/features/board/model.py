from shared.db import mongo
from bson import ObjectId
from datetime import datetime
import secrets


def generate_card_id():
    """Generate a random unique card ID (8 char hex)."""
    return secrets.token_hex(8)


def _ensure_card_indexes():
    """Create indexes on the cards collection. Safe to call repeatedly."""
    mongo.db.cards.create_index(
        [("user_id", 1), ("board_id", 1), ("column", 1), ("position", 1)]
    )
    mongo.db.cards.create_index(
        [("user_id", 1), ("card_id", 1)], unique=True
    )


# ---------------------------------------------------------------------------
# Card — separate collection, one document per card
# ---------------------------------------------------------------------------

class Card:
    collection = "cards"

    @staticmethod
    def create(user_id, board_id, data):
        """Insert a new card document. Returns the inserted card dict."""
        now = datetime.utcnow()

        # Determine position: place at the end of the target column
        column = data.get("column", "list1")
        last = mongo.db.cards.find_one(
            {"user_id": ObjectId(user_id), "board_id": ObjectId(board_id), "column": column},
            sort=[("position", -1)],
        )
        position = data.get("position", (last["position"] + 1 if last else 0))

        card = {
            "user_id": ObjectId(user_id),
            "board_id": ObjectId(board_id),
            "card_id": generate_card_id(),
            "task_name": data.get("task_name", ""),
            "sub_title": data.get("sub_title"),
            "description": data.get("description"),
            "course_name": data.get("course_name"),
            "difficulty": data.get("difficulty"),
            "priority": data.get("priority"),
            "learning_strategy": data.get("learning_strategy"),
            "pre_test_grade": data.get("pre_test_grade"),
            "post_test_grade": data.get("post_test_grade"),
            "satisfaction_rating": data.get("satisfaction_rating"),
            "reflection": data.get("reflection"),
            "personal_best": data.get("personal_best"),
            "goal_check": data.get("goal_check"),
            "checklists": data.get("checklists", []),
            "links": data.get("links", []),
            "column_movements": data.get("column_movements", []),
            "archived": data.get("archived", False),
            "deadline": data.get("deadline"),
            "column": column,
            "position": position,
            "created_at": now,
            "updated_at": now,
        }

        result = mongo.db.cards.insert_one(card)
        card["_id"] = result.inserted_id
        return card

    @staticmethod
    def find_by_id(user_id, card_id):
        """Find a single card by card_id (8-char hex). Returns dict or None."""
        return mongo.db.cards.find_one(
            {"user_id": ObjectId(user_id), "card_id": card_id}
        )

    @staticmethod
    def find_by_board(user_id, board_id, column=None):
        """Find all cards for a board, optionally filtered by column,
        sorted by position ascending."""
        query = {"user_id": ObjectId(user_id), "board_id": ObjectId(board_id), "archived": {"$ne": True}}
        if column:
            query["column"] = column
        return list(
            mongo.db.cards.find(query).sort("position", 1)
        )

    @staticmethod
    def update_card(user_id, card_id, updates):
        """Update specific fields on a card. Returns (success, message, status)."""
        # Remove fields that should never be directly overwritten
        updates.pop("_id", None)
        updates.pop("card_id", None)
        updates.pop("user_id", None)
        updates.pop("board_id", None)
        updates.pop("created_at", None)

        updates["updated_at"] = datetime.utcnow()

        result = mongo.db.cards.update_one(
            {"user_id": ObjectId(user_id), "card_id": card_id},
            {"$set": updates},
        )
        if result.matched_count == 0:
            return False, "Card not found", 404
        return True, "Card updated", 200

    @staticmethod
    def move_card(user_id, card_id, new_column, new_position):
        """Move a card to a different column and/or position."""
        now = datetime.utcnow()
        result = mongo.db.cards.update_one(
            {"user_id": ObjectId(user_id), "card_id": card_id},
            {
                "$set": {
                    "column": new_column,
                    "position": new_position,
                    "updated_at": now,
                }
            },
        )
        return result.matched_count > 0

    @staticmethod
    def delete_card(user_id, card_id):
        """Hard delete a card from the database."""
        result = mongo.db.cards.delete_one(
            {"user_id": ObjectId(user_id), "card_id": card_id}
        )
        return result.deleted_count > 0

    @staticmethod
    def reposition_column(user_id, board_id, column, card_ids):
        """Reorder cards within a column. card_ids is a list of card_id strings
        in the desired order — position is set to the index in the list."""
        now = datetime.utcnow()
        operations = []
        for idx, cid in enumerate(card_ids):
            operations.append(
                mongo.db.cards.update_one(
                    {
                        "user_id": ObjectId(user_id),
                        "board_id": ObjectId(board_id),
                        "card_id": cid,
                        "column": column,
                    },
                    {"$set": {"position": idx, "updated_at": now}},
                )
            )
        # PyMongo does not support bulk_write through PyMongo wrapper directly,
        # so we execute individually. For small columns this is fine.
        return all(op.matched_count > 0 for op in operations)

    @staticmethod
    def count_by_board(user_id, board_id):
        """Return {total, done, in_progress} counts for a board."""
        base = {"user_id": ObjectId(user_id), "board_id": ObjectId(board_id)}
        total = mongo.db.cards.count_documents(base)
        done = mongo.db.cards.count_documents({**base, "column": "list4"})
        in_progress = mongo.db.cards.count_documents({**base, "column": "list2"})
        return {"total": total, "done": done, "in_progress": in_progress}


# ---------------------------------------------------------------------------
# Board — metadata only, no embedded lists/cards
# ---------------------------------------------------------------------------

class Board:
    collection = "boards"

    @staticmethod
    def create(user_id, username):
        """Create a board document (metadata only, no embedded cards).
        Returns the board_id as a string."""
        board = {
            "user_id": ObjectId(user_id),
            "name": f"{username}'s Board",
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.boards.insert_one(board)
        return str(result.inserted_id)

    @staticmethod
    def find_by_user_id(user_id):
        """Find a board by user_id. Returns the board dict or None."""
        try:
            return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def delete_board(board_id, user_id):
        """Delete the board document AND all associated cards."""
        # Delete all cards belonging to this board
        mongo.db.cards.delete_many(
            {"board_id": ObjectId(board_id), "user_id": ObjectId(user_id)}
        )
        # Delete the board itself
        mongo.db.boards.delete_one(
            {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)}
        )
