from flask import Blueprint
from features.board.controller import get_board, update_board, update_card, get_card_detail

board_bp = Blueprint("board_bp", __name__)

board_bp.route("/board", methods=["GET"])(get_board)
board_bp.route("/update-board", methods=["POST"])(update_board)
board_bp.route("/update-card", methods=["POST"])(update_card)
board_bp.route("/board/card/<card_id>", methods=["GET"])(get_card_detail)
