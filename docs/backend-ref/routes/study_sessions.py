from flask import Blueprint, request, jsonify
from models.study_session_model import StudySession
from utils.auth import get_user_id_from_token

study_sessions_bp = Blueprint('study_sessions', __name__)

@study_sessions_bp.route('/api/study-sessions/start', methods=['POST'])
def start_session():
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get card_id from request
        card_id = request.json.get('card_id')
        if not card_id:
            return jsonify({"error": "Missing card_id"}), 400

        # Create new session
        session = StudySession.create_session(user_id, card_id)
        return jsonify(session), 201
    except Exception as e:
        print(f"Error starting study session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@study_sessions_bp.route('/api/study-sessions/end', methods=['POST'])
def end_session():
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get session_id from request
        session_id = request.json.get('session_id')
        if not session_id:
            return jsonify({"error": "Missing session_id"}), 400

        # End session
        success = StudySession.end_session(session_id)
        if not success:
            return jsonify({"error": "Session not found"}), 404

        return jsonify({"message": "Session ended successfully"}), 200
    except Exception as e:
        print(f"Error ending study session: {str(e)}")
        return jsonify({"error": str(e)}), 500

@study_sessions_bp.route('/api/study-sessions/card/<card_id>', methods=['GET'])
def get_card_sessions(card_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get sessions for card
        sessions = StudySession.get_sessions_by_card(card_id)
        total_time = StudySession.get_total_study_time(card_id)

        return jsonify({
            "sessions": sessions,
            "total_study_time_minutes": total_time
        }), 200
    except Exception as e:
        print(f"Error fetching study sessions: {str(e)}")
        return jsonify({"error": str(e)}), 500 