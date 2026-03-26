from flask import Blueprint
from features.study_session.controller import start, end, get_card_sessions

study_session_bp = Blueprint("study_session_bp", __name__)

study_session_bp.route("/api/study-sessions/start", methods=["POST"])(start)
study_session_bp.route("/api/study-sessions/end", methods=["POST"])(end)
study_session_bp.route("/api/study-sessions/card/<card_id>", methods=["GET"])(get_card_sessions)
