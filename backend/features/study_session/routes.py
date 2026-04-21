from flask import Blueprint
from features.study_session.controller import start, end, heartbeat, get_session, get_card_sessions, get_history

study_session_bp = Blueprint("study_session_bp", __name__)

study_session_bp.route("/api/study-sessions/start", methods=["POST"])(start)
study_session_bp.route("/api/study-sessions/end", methods=["POST"])(end)
study_session_bp.route("/api/study-sessions/heartbeat", methods=["POST"])(heartbeat)
study_session_bp.route("/api/study-sessions/history", methods=["GET"])(get_history)
study_session_bp.route("/api/study-sessions/<session_id>", methods=["GET"])(get_session)
study_session_bp.route("/api/study-sessions/card/<card_id>", methods=["GET"])(get_card_sessions)
