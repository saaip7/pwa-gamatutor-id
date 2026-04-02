from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.goal.model import Goal
from features.badge.badge_engine import BadgeEngine
from shared.log_model import Log


@jwt_required()
def get_goals():
    """Get general goal + all task goals + derived course progress."""
    user_id = get_jwt_identity()
    try:
        general = Goal.get_general_goal(user_id)
        task_goals = Goal.get_all_task_goals(user_id)
        course_progress = Goal.get_course_progress(user_id)

        general_data = None
        if general:
            general["_id"] = str(general["_id"])
            general["user_id"] = str(general["user_id"])
            general_data = general

        for g in task_goals:
            g["_id"] = str(g["_id"])
            g["user_id"] = str(g["user_id"])

        return jsonify({
            "general": general_data,
            "taskGoals": task_goals,
            "courseProgress": course_progress,
        }), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def set_general_goal():
    """Create or update the general (main) goal."""
    user_id = get_jwt_identity()
    data = request.json
    text_pre = data.get("textPre", "")
    text_highlight = data.get("textHighlight", "")

    if not text_highlight:
        return jsonify({"message": "textHighlight is required"}), 400

    try:
        goal = Goal.set_general_goal(user_id, text_pre, text_highlight)
        goal["_id"] = str(goal["_id"])
        goal["user_id"] = str(goal["user_id"])
        Log.create(user_id, "goal_set", f"General goal set: {text_pre} {text_highlight}")
        return jsonify({"goal": goal}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def get_task_goal(card_id):
    """Get task goal for a specific card."""
    user_id = get_jwt_identity()
    try:
        goal = Goal.get_task_goal(user_id, card_id)
        if not goal:
            return jsonify({"goal": None}), 200
        goal["_id"] = str(goal["_id"])
        goal["user_id"] = str(goal["user_id"])
        return jsonify({"goal": goal}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def set_task_goal(card_id):
    """Create or update a task goal for a card."""
    user_id = get_jwt_identity()
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"message": "text is required"}), 400

    try:
        goal = Goal.set_task_goal(user_id, card_id, text)
        goal["_id"] = str(goal["_id"])
        goal["user_id"] = str(goal["user_id"])
        Log.create(user_id, "goal_set", f"Task goal set for card {card_id}", {"card_id": card_id})

        # Check Architect badge (task linked to goal hierarchy)
        badge_results = BadgeEngine.evaluate(user_id, "goal_linked")

        return jsonify({"goal": goal, "newlyUnlocked": badge_results}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def delete_task_goal(card_id):
    """Delete a task goal."""
    user_id = get_jwt_identity()
    try:
        deleted = Goal.delete_task_goal(user_id, card_id)
        if not deleted:
            return jsonify({"message": "Task goal not found"}), 404
        return jsonify({"message": "Task goal deleted"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def get_course_progress():
    """Get derived course progress from board data."""
    user_id = get_jwt_identity()
    try:
        progress = Goal.get_course_progress(user_id)
        return jsonify({"courses": progress}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
