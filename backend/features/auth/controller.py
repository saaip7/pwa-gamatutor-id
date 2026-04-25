from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from features.auth.model import User
from features.board.model import Board
from features.preferences.model import Preferences
from shared.log_model import Log
import re
import random


def register():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"message": "All fields are required"}), 400

        # Password validation
        if len(password) < 8:
            return jsonify({"message": "Password must be at least 8 characters long"}), 400
        if not re.search(r"[A-Z]", password):
            return jsonify({"message": "Password must contain at least one uppercase letter"}), 400
        if not re.search(r"[0-9]", password):
            return jsonify({"message": "Password must contain at least one number"}), 400

        if User.find_by_email(email):
            return jsonify({"message": "Email already exists"}), 400

        # Auto-generate username from email prefix
        username = email.split("@")[0]
        if User.find_by_username(username):
            username = f"{username}{random.randint(1000, 9999)}"

        # Create user
        user_id = User.create(name, email, username, password)

        # Create default user_preferences
        User.create_default_preferences(user_id)

        # Create initial board
        try:
            Board.create(str(user_id), name)
        except Exception as e:
            print(f"Warning: Board creation failed for {name}: {e}")

        # Log registration
        Log.create(user_id, "onboarding_started", f"{email} registered")

        return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


def login():
    try:
        data = request.get_json(force=True, silent=True) or {}
        email = data.get("email")
        password = data.get("password")

        user = User.find_by_email(email)
        if not user:
            return jsonify({"message": "Invalid email or password"}), 401

        if not User.validate_password(user, password):
            return jsonify({"message": "Invalid email or password"}), 401

        user_id = str(user["_id"])
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)

        # Log session_start (for DAU tracking - Sub-RQ 1)
        Log.create(user_id, "session_start", f"{email} started session")

        return jsonify({"token": access_token, "refresh_token": refresh_token, "role": user.get("role", "user")}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"token": access_token}), 200


@jwt_required()
def logout():
    user_id = get_jwt_identity()
    try:
        user = User.find_by_id(user_id)
        if user:
            Log.create(user_id, "session_end", f"{user.get('email')} ended session")
        Preferences.update_fcm_token(user_id, None)
    except Exception:
        pass
    return jsonify({"message": "Logged out successfully"}), 200
