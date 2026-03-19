from flask import jsonify, request
from utils.db import mongo
from models.user_model import User
from models.board_model import Board
from models.log_model import Log
from flask_jwt_extended import create_access_token, create_refresh_token, set_refresh_cookies, get_jwt_identity, unset_jwt_cookies, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

import re
from flask import request, jsonify

def register():
    try:
        data = request.json
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")

        print(f"Registration attempt for username: {username}")

        # Validate required fields
        if not all([first_name, last_name, email, username, password]):
            return jsonify({"message": "All fields are required"}), 400

        # Password validation
        if len(password) < 8:
            return jsonify({"message": "Password must be at least 8 characters long"}), 400
        if not re.search(r"[A-Z]", password):
            return jsonify({"message": "Password must contain at least one uppercase letter"}), 400
        if not re.search(r"[0-9]", password):
            return jsonify({"message": "Password must contain at least one number"}), 400

        if User.find_user_by_username(username):
            print(f"Username already exists: {username}")
            return jsonify({"message": "Username already exists"}), 400

        if User.find_user_by_email(email):
            print(f"Email already exists: {email}")
            return jsonify({"message": "Email already exists"}), 400

        # Create user with all fields
        user_id = User.create_user(first_name, last_name, email, username, password)
        print(f"User created successfully with ID: {user_id}")

        # Create initial board for the user with their username
        try:
            board_id = Board.create_initial_board(str(user_id), username)
            print(f"Initial board created for user {username} with ID: {board_id}")
        except Exception as e:
            print(f"Error creating initial board for user {username}: {str(e)}")
            # Don't fail registration if board creation fails

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

def login():
    try:
        # Log incoming request for debugging
        print("[DEBUG] Received login request headers:", dict(request.headers))
        # Ensure JSON parsing even if content type is not set correctly
        data = request.get_json(force=True, silent=True) or {}
        print("[DEBUG] Received login request payload:", data)
        username = data.get("username")
        password = data.get("password")
        print(f"[DEBUG] Login attempt - username: {username}, password: {password}")

        user = User.find_user_by_username(username)
        if not user:
            return jsonify({"message": "Invalid username or password"}), 401

        is_valid = User.validate_password(user, password)
        if not is_valid:
            return jsonify({"message": "Invalid username or password"}), 401

        user_id = str(user["_id"])
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        user_role = user.get("role", "user")

        # Log the login activity
        Log.create_log(
            username=username,
            action_type="login",
            description=f"{username} logged in to the application"
        )

        # Create response and set refresh token in HttpOnly cookie
        response = jsonify({"token": access_token, "role": user_role})
        set_refresh_cookies(response, refresh_token)

        return response, 200

    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
    
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"token": access_token}), 200

@jwt_required()
def logout():
    # Get the current user's identity
    user_id = get_jwt_identity()
    
    # Get the username for logging
    try:
        user = User.find_user_by_id(user_id)
        if user:
            username = user.get("username", "Unknown user")
            # Log the logout activity
            Log.create_log(
                username=username,
                action_type="logout",
                description=f"{username} logged out of the application"
            )
    except Exception as e:
        print(f"Error logging logout: {str(e)}")
    
    response = jsonify({"message": "Logged out successfully"})
    unset_jwt_cookies(response)
    return response, 200