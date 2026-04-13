from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.study_session.model import StudySession
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log
from shared.streak import update_streak


@jwt_required()
def start():
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    if not card_id:
        return jsonify({"error": "Missing card_id"}), 400
    session = StudySession.create(user_id, card_id)

    # Update streak — study session is a meaningful activity
    streak = update_streak(user_id)

    return jsonify({**session, "streak": streak}), 201


@jwt_required()
def end():
    user_id = get_jwt_identity()
    session_id = request.json.get("session_id")
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    success = StudySession.end(session_id)
    if not success:
        return jsonify({"error": "Session not found"}), 404

    # Fire badge triggers for session completion
    badge_results = BadgeEngine.evaluate(user_id, "session_completed")
    Log.create(user_id, "session_completed", f"Study session {session_id} completed")

    return jsonify({
        "message": "Session ended",
        "newlyUnlocked": badge_results,
    }), 200


@jwt_required()
def get_session(session_id):
    """Get a single study session by ID. Used by FE to validate resume."""
    session = StudySession.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(session), 200


@jwt_required()
def get_card_sessions(card_id):
    user_id = get_jwt_identity()
    sessions = StudySession.get_by_card(card_id)
    total = StudySession.get_total_time(card_id)
    return jsonify({
        "sessions": sessions,
        "total_study_time_minutes": total,
    }), 200
