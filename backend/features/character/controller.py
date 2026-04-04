from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.character.model import Character


@jwt_required()
def get_character():
    """Get user's character data (gender + equipped items)."""
    user_id = get_jwt_identity()
    try:
        data = Character.get(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def equip():
    """Update equipped items and/or gender."""
    user_id = get_jwt_identity()
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    try:
        success = Character.update(user_id, data)
        if not success:
            return jsonify({"message": "No valid fields to update"}), 400

        updated = Character.get(user_id)
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
