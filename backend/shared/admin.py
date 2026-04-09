from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.auth.model import User


def admin_required(fn):
    """Decorator that checks JWT identity + role=='admin'. Stores user in g.admin_user."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if not user or user.get("role") != "admin":
            return jsonify({"message": "Admin access required"}), 403
        g.admin_user = user
        return fn(*args, **kwargs)
    return wrapper
