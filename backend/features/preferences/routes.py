from flask import Blueprint
from features.preferences.controller import (
    get_preferences,
    update_notifications,
    update_theme,
    update_onboarding,
    update_fcm_token,
    get_streak,
    use_freeze,
)

preferences_bp = Blueprint("preferences_bp", __name__)

preferences_bp.route("/api/preferences", methods=["GET"])(get_preferences)
preferences_bp.route("/api/preferences/notifications", methods=["PUT"])(update_notifications)
preferences_bp.route("/api/preferences/theme", methods=["PUT"])(update_theme)
preferences_bp.route("/api/preferences/onboarding", methods=["PUT"])(update_onboarding)
preferences_bp.route("/api/preferences/fcm-token", methods=["PUT"])(update_fcm_token)
preferences_bp.route("/api/preferences/streak", methods=["GET"])(get_streak)
preferences_bp.route("/api/preferences/streak/freeze", methods=["POST"])(use_freeze)
