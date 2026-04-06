from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.auth.model import User
from shared.log_model import Log
from werkzeug.security import check_password_hash
import re


@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return jsonify(user), 200


@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    allowed = {"name", "email"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    # Check email uniqueness if changed
    if "email" in updates and User.find_by_email(updates["email"]):
        return jsonify({"message": "Email already in use"}), 400

    success = User.update(user_id, updates)
    if not success:
        return jsonify({"message": "User not found or no changes made"}), 404
    return jsonify({"message": "Profile updated successfully"}), 200


@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Both current and new passwords are required"}), 400
    if len(new_password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long"}), 400
    if not re.search(r"[A-Z]", new_password):
        return jsonify({"message": "Password must contain at least one uppercase letter"}), 400
    if not re.search(r"[0-9]", new_password):
        return jsonify({"message": "Password must contain at least one number"}), 400

    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    if not check_password_hash(user["password"], current_password):
        return jsonify({"message": "Current password is incorrect"}), 400

    User.update_password(user_id, new_password)
    return jsonify({"message": "Password updated successfully"}), 200


@jwt_required()
def delete_account():
    user_id = get_jwt_identity()
    success = User.delete(user_id)
    if not success:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "Account deleted successfully"}), 200
