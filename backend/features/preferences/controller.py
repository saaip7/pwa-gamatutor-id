from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.preferences.model import Preferences
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log


@jwt_required()
def get_preferences():
    """Get all user preferences."""
    user_id = get_jwt_identity()
    try:
        prefs = Preferences.get(user_id)
        if not prefs:
            return jsonify({"message": "Preferences not found"}), 404
        return jsonify(prefs), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def update_notifications():
    """Update notification preferences."""
    user_id = get_jwt_identity()
    data = request.json
    try:
        success = Preferences.update_notifications(user_id, data)
        if not success:
            return jsonify({"message": "No valid fields to update"}), 400
        prefs = Preferences.get(user_id)
        return jsonify(prefs), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def update_theme():
    """Update theme preference (dark/light/auto)."""
    user_id = get_jwt_identity()
    data = request.json
    if "mode" not in data:
        return jsonify({"message": "mode is required"}), 400
    if data["mode"] not in ("dark", "light", "auto"):
        return jsonify({"message": "mode must be dark, light, or auto"}), 400
    try:
        Preferences.update_theme(user_id, data)
        prefs = Preferences.get(user_id)
        return jsonify(prefs), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def update_onboarding():
    """Update onboarding state."""
    user_id = get_jwt_identity()
    data = request.json
    try:
        success = Preferences.update_onboarding(user_id, data)
        badge_results = []
        if data.get("completed"):
            action = "skipped guide tour" if data.get("skipped_tour") else "completed onboarding + guide"
            Log.create(user_id, "onboarding_completed", f"User {action}")
            badge_results = BadgeEngine.evaluate(user_id, "onboarding_completed")

        prefs = Preferences.get(user_id)
        prefs["newlyUnlocked"] = badge_results
        return jsonify(prefs), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def update_fcm_token():
    """Update FCM token for push notifications."""
    user_id = get_jwt_identity()
    data = request.json
    token = data.get("fcm_token")
    if not token:
        return jsonify({"message": "token is required"}), 400
    try:
        Preferences.update_fcm_token(user_id, token)
        return jsonify({"message": "FCM token updated"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def get_streak():
    """Get streak data."""
    user_id = get_jwt_identity()
    try:
        streak = Preferences.get_streak(user_id)
        return jsonify(streak or {"current": 0, "longest": 0}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def use_freeze():
    """Use a streak freeze (max 1 per week)."""
    user_id = get_jwt_identity()
    try:
        success, message = Preferences.use_streak_freeze(user_id)
        if not success:
            return jsonify({"message": message}), 400
        Log.create(user_id, "streak_freeze_used", "Streak freeze used")

        # Check streak-based badges
        badge_results = BadgeEngine.evaluate(user_id, "streak_updated")

        streak = Preferences.get_streak(user_id)
        return jsonify({
            "message": message,
            "streak": streak,
            "newlyUnlocked": badge_results,
        }), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
