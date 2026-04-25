from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.badge.model import Badge, BADGE_DEFINITIONS
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log


@jwt_required()
def get_badges():
    """Get all badges with unlock status for current user."""
    user_id = get_jwt_identity()
    try:
        badges = Badge.get_all_badges(user_id)
        for b in badges:
            if "_id" in b:
                b["_id"] = str(b["_id"])
        return jsonify({"badges": badges}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def get_badge_stats():
    """Get badge unlock count vs total."""
    user_id = get_jwt_identity()
    try:
        stats = Badge.get_stats(user_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def check_and_unlock():
    """Check and unlock badges based on a trigger action."""
    user_id = get_jwt_identity()
    from flask import request
    data = request.json or {}
    trigger = data.get("trigger")  # e.g. "task_created", "reflection_completed", etc.

    if not trigger:
        return jsonify({"message": "trigger is required"}), 400

    try:
        newly_unlocked = BadgeEngine.evaluate(user_id, trigger)
        result = []
        for badge_type in newly_unlocked:
            badge_defn = next((b for b in BADGE_DEFINITIONS if b["type"] == badge_type), None)
            result.append({
                "type": badge_type,
                "name": badge_defn["name"] if badge_defn else badge_type,
                "description": badge_defn["description"] if badge_defn else "",
            })
            Log.create(user_id, "badge_unlocked", f"Badge unlocked: {badge_type}", {"badge_type": badge_type})

        return jsonify({"newly_unlocked": result}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def mark_displayed(badge_type):
    """Mark a badge as displayed after celebration shown."""
    user_id = get_jwt_identity()
    try:
        success = Badge.mark_displayed(user_id, badge_type)
        if not success:
            return jsonify({"message": "Badge not found or already displayed"}), 404
        return jsonify({"message": "Badge marked as displayed"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
