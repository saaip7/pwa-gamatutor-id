from flask import Blueprint
from controllers import learningstrat_controller

learningstrat_bp = Blueprint("learningstrat_bp", __name__)

learningstrat_bp.route("/learningstrats", methods=["POST"])(learningstrat_controller.add_learning_strat)
learningstrat_bp.route("/learningstrats", methods=["GET"])(learningstrat_controller.get_all_learning_strats)
learningstrat_bp.route("/learningstrats/<learning_strat_id>", methods=["GET"])(learningstrat_controller.get_learning_strat)
learningstrat_bp.route("/learningstrats/<learning_strat_id>", methods=["PUT"])(learningstrat_controller.update_learning_strat)
learningstrat_bp.route("/learningstrats/<learning_strat_id>", methods=["DELETE"])(learningstrat_controller.delete_learning_strat)