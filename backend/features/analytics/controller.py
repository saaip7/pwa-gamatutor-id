from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.analytics.model import Analytics


@jwt_required()
def dashboard():
    """Dashboard overview stats and study patterns."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_dashboard(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def progress():
    """Progress summary and task distribution."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_progress(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def strategy_effectiveness():
    """Per-strategy subjective ratings and objective improvements."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_strategy_effectiveness(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def confidence_trend():
    """Confidence and learning gain over time, optionally filtered by course."""
    user_id = get_jwt_identity()
    course_name = request.args.get("course_name")
    try:
        data = Analytics.get_confidence_trend(user_id, course_name=course_name)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def streak():
    """Streak data with current week calendar."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_streak(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def streak_history():
    """Full streak history for GitHub-style contribution heatmap."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_streak_history(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def reflection_notes():
    """All q3_improvement notes from cards with reflection data."""
    user_id = get_jwt_identity()
    try:
        data = Analytics.get_reflection_notes(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
