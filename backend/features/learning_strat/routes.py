from flask import Blueprint
from features.learning_strat.controller import get_all, add, update, delete

learningstrat_bp = Blueprint("learningstrat_bp", __name__)

learningstrat_bp.route("/learningstrats", methods=["GET"])(get_all)
learningstrat_bp.route("/learningstrats", methods=["POST"])(add)
learningstrat_bp.route("/learningstrats/<strat_id>", methods=["PUT"])(update)
learningstrat_bp.route("/learningstrats/<strat_id>", methods=["DELETE"])(delete)
