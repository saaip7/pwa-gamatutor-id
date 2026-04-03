from shared.db import mongo
from bson import ObjectId
from datetime import datetime
import secrets


def generate_card_id():
    """Generate a random unique card ID (8 char hex)."""
    return secrets.token_hex(8)


class Board:
    @staticmethod
    def create_initial_board(user_id, username):
        board = {
            "user_id": ObjectId(user_id),
            "name": f"{username}'s Board",
            "lists": [
                {"id": "list1", "title": "Planning (To Do)", "cards": []},
                {"id": "list2", "title": "Monitoring (In Progress)", "cards": []},
                {"id": "list3", "title": "Controlling (Review)", "cards": []},
                {"id": "list4", "title": "Reflection (Done)", "cards": []},
            ],
        }
        result = mongo.db.boards.insert_one(board)
        return str(result.inserted_id)

    @staticmethod
    def delete_board(board_id, user_id):
        mongo.db.boards.delete_one({"_id": ObjectId(board_id), "user_id": ObjectId(user_id)})

    @staticmethod
    def find_by_user_id(user_id):
        try:
            return mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def update_board(board_id, user_id, lists):
        # Auto-generate IDs for cards that don't have one
        for lst in lists:
            for card in lst.get("cards", []):
                if not card.get("id"):
                    card["id"] = generate_card_id()
        try:
            result = mongo.db.boards.update_one(
                {"_id": ObjectId(board_id), "user_id": ObjectId(user_id)},
                {"$set": {"lists": lists}},
            )
            return result
        except Exception:
            return None

    @staticmethod
    def find_card(user_id, card_id):
        """Find a specific card within a user's board."""
        board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        if not board:
            return None, None, None
        for lst in board["lists"]:
            for card in lst["cards"]:
                if card["id"] == card_id:
                    return card, lst["title"], str(board["_id"])
        return None, None, None

    @staticmethod
    def update_card(user_id, card_id, updates):
        """Update specific fields on a card. Returns (success, error_msg, status_code)."""
        board = mongo.db.boards.find_one({"user_id": ObjectId(user_id)})
        if not board:
            return False, "Board not found", 404

        for lst in board["lists"]:
            for card in lst["cards"]:
                if card["id"] == card_id:
                    for key, value in updates.items():
                        card[key] = value
                    mongo.db.boards.update_one(
                        {"user_id": ObjectId(user_id)},
                        {"$set": {"lists": board["lists"]}},
                    )
                    return True, "Card updated", 200

        return False, "Card not found", 404
