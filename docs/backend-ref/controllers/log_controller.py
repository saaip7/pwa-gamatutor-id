from flask import jsonify
from models.log_model import Log
from flask_jwt_extended import jwt_required

@jwt_required()
def get_all_logs():
    """Get all logs for admin view"""
    try:
        logs = Log.get_all_logs()
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500