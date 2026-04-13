from flask import Blueprint
from features.board.controller import (
    get_board,
    get_archived_cards,
    create_board,
    move_card,
    reorder_column,
    create_card,
    get_card_detail,
    update_card,
    delete_card,
)

board_bp = Blueprint("board_bp", __name__)

board_bp.route("/board", methods=["GET"])(get_board)
board_bp.route("/board/archived", methods=["GET"])(get_archived_cards)
board_bp.route("/board", methods=["POST"])(create_board)
board_bp.route("/board/column/reorder", methods=["PUT"])(reorder_column)
board_bp.route("/board/card", methods=["POST"])(create_card)
board_bp.route("/board/card/<card_id>", methods=["GET"])(get_card_detail)
board_bp.route("/board/card/<card_id>", methods=["PUT"])(update_card)
board_bp.route("/board/card/<card_id>/move", methods=["PATCH"])(move_card)
board_bp.route("/board/card/<card_id>", methods=["DELETE"])(delete_card)
