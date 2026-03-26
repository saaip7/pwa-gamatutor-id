from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.study_session.model import StudySession


@jwt_required()
def start():
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    if not card_id:
        return jsonify({"error": "Missing card_id"}), 400
    session = StudySession.create(user_id, card_id)
    return jsonify(session), 201


@jwt_required()
def end():
    user_id = get_jwt_identity()
    session_id = request.json.get("session_id")
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400
    success = StudySession.end(session_id)
    if not success:
        return jsonify({"error": "Session not found"}), 404
    return jsonify({"message": "Session ended"}), 200


@jwt_required()
def get_card_sessions(card_id):
    user_id = get_jwt_identity()
    sessions = StudySession.get_by_card(card_id)
    total = StudySession.get_total_time(card_id)
    return jsonify({
        "sessions": sessions,
        "total_study_time_minutes": total,
    }), 200
