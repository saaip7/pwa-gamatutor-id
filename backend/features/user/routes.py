from flask import Blueprint
from features.user.controller import get_me, update_profile, change_password, delete_account

user_bp = Blueprint("user_bp", __name__)

user_bp.route("/users/me", methods=["GET"])(get_me)
user_bp.route("/update-user", methods=["PUT"])(update_profile)
user_bp.route("/update-password", methods=["PUT"])(change_password)
user_bp.route("/delete-user", methods=["DELETE"])(delete_account)
