from flask import jsonify, request
from features.learning_strat.model import LearningStrat


def get_all():
    strats = LearningStrat.find_all()
    for s in strats:
        s["_id"] = str(s["_id"])
    return jsonify(strats), 200


def _validate_tips(tips):
    if not isinstance(tips, list):
        return None, "tips must be a list of strings"
    cleaned = [t.strip() for t in tips if isinstance(t, str) and t.strip()]
    if len(tips) != len(cleaned) or any(not isinstance(t, str) for t in tips):
        invalid = [t for t in tips if not isinstance(t, str)]
        if invalid:
            return None, "each tip must be a string"
    if len(cleaned) > 20:
        return None, "maximum 20 tips allowed per strategy"
    return cleaned, None


def add():
    data = request.json
    name = data.get("learning_strat_name")
    if not name:
        return jsonify({"message": "learning_strat_name is required"}), 400
    tips = data.get("tips")
    if tips is not None:
        tips, err = _validate_tips(tips)
        if err:
            return jsonify({"message": err}), 400
    sid = LearningStrat.create(name, data.get("description"), tips)
    return jsonify({"message": "Strategy added", "id": str(sid)}), 201


def update(strat_id):
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400
    updates = {}
    if "learning_strat_name" in data:
        updates["learning_strat_name"] = data["learning_strat_name"]
    if "description" in data:
        updates["description"] = data["description"]
    if "tips" in data:
        tips, err = _validate_tips(data["tips"])
        if err:
            return jsonify({"message": err}), 400
        updates["tips"] = tips
    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400
    result = LearningStrat.update(strat_id, updates)
    if result is None:
        return jsonify({"message": "Invalid strategy ID"}), 400
    if result.matched_count == 0:
        return jsonify({"message": "Strategy not found"}), 404
    return jsonify({"message": "Strategy updated"}), 200


def delete(strat_id):
    result = LearningStrat.delete(strat_id)
    if result is None:
        return jsonify({"message": "Invalid strategy ID"}), 400
    if result.deleted_count == 0:
        return jsonify({"message": "Strategy not found"}), 404
    return jsonify({"message": "Strategy deleted"}), 200
