from flask import Blueprint, request, jsonify
from controllers import user_controller

user_bp = Blueprint("user_bp", __name__)

user_bp.route("/users", methods=["GET"])(user_controller.get_all_users)
user_bp.route("/users/id/<user_id>", methods=["GET"])(user_controller.get_user_by_id)
user_bp.route("/users/username/<username>", methods=["GET"])(user_controller.get_user_by_username)
user_bp.route("/update-user", methods=["PUT"])(user_controller.update_user)
user_bp.route("/update-password", methods=["PUT"])(user_controller.update_user_password)
user_bp.route("/delete-user", methods=["DELETE"])(user_controller.delete_user)
user_bp.route("/debug/users", methods=["GET"])(user_controller.debug_list_users)

@user_bp.route("/request-reset", methods=["POST"])
def request_reset():
    return user_controller.request_password_reset()

@user_bp.route("/reset-password", methods=["POST"])
def reset():
    return user_controller.reset_password()