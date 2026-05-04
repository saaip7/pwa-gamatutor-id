import logging
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from features.quest.model import QuestTemplate, QuestCompletion, QuestEngine
from features.preferences.model import Preferences
from shared.admin import admin_required
from shared.db import mongo
from shared.log_model import Log


logger = logging.getLogger(__name__)


def _serialize(doc):
    """Recursively convert ObjectId/datetime to string for JSON."""
    if isinstance(doc, list):
        return [_serialize(d) for d in doc]
    if isinstance(doc, dict):
        return {k: _serialize(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    if isinstance(doc, datetime):
        return doc.isoformat()
    return doc


# ── User-facing ────────────────────────────────────────────────

@jwt_required()
def get_active():
    """Get current active quest for user with progress computed on-the-fly."""
    user_id = get_jwt_identity()
    try:
        result = QuestEngine.get_active_quest_for_user(user_id)
        if not result:
            return jsonify({"active": False}), 200
        return jsonify({"active": True, **result}), 200
    except Exception as e:
        logger.error(f"[Quest] get_active error: {e}")
        return jsonify({"error": str(e)}), 500


@jwt_required()
def get_history():
    """Get completed/expired quest history for user."""
    user_id = get_jwt_identity()
    limit = request.args.get("limit", 10, type=int)
    completions = QuestCompletion.get_user_history(user_id, limit=limit)
    return jsonify(_serialize(completions)), 200


@jwt_required()
def use_quest_freeze():
    """Use a quest freeze (separate from weekly streak freeze)."""
    user_id = get_jwt_identity()
    try:
        success, message = Preferences.use_quest_freeze(user_id)
        if not success:
            return jsonify({"message": message}), 400
        Log.create(user_id, "quest_freeze_used", "Quest freeze used")
        return jsonify({"message": message}), 200
    except Exception as e:
        logger.exception(f"[Quest] use_quest_freeze error for user {user_id}: {e}")
        return jsonify({"message": "Terjadi kesalahan saat menggunakan quest freeze. Silakan coba lagi."}), 500


# ── Admin ──────────────────────────────────────────────────────

@admin_required
def list_templates():
    """List all quest templates."""
    templates = QuestTemplate.list_all()
    return jsonify(_serialize(templates)), 200


@admin_required
def create_template():
    """Create a new quest template."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["type", "start_date", "end_date", "target_count"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    valid_types = ["deep_study", "reflection_done", "checklist_use"]
    if data["type"] not in valid_types:
        return jsonify({"error": f"Invalid type. Must be one of: {valid_types}"}), 400

    try:
        doc, err = QuestTemplate.create(data)
        if err:
            return jsonify({"error": err}), 409
        return jsonify(_serialize(doc)), 201
    except Exception as e:
        logger.error(f"[Quest] create_template error: {e}")
        return jsonify({"error": str(e)}), 500


@admin_required
def update_template(template_id):
    """Update a quest template."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        result, err = QuestTemplate.update(template_id, data)
        if err:
            return jsonify({"error": err}), 409
        if not result:
            return jsonify({"error": "Template not found"}), 404
        return jsonify({"message": "Template updated"}), 200
    except Exception as e:
        logger.error(f"[Quest] update_template error: {e}")
        return jsonify({"error": str(e)}), 500


@admin_required
def delete_template(template_id):
    """Delete a quest template."""
    success = QuestTemplate.delete(template_id)
    if not success:
        return jsonify({"error": "Template not found"}), 404
    return jsonify({"message": "Template deleted"}), 200


@admin_required
def get_stats():
    """Get quest completion stats across users."""
    stats = QuestEngine.get_stats()
    return jsonify(stats), 200
