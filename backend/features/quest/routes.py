from flask import Blueprint
from features.quest.controller import (
    get_active,
    get_history,
    use_quest_freeze,
    list_templates,
    create_template,
    update_template,
    delete_template,
    get_stats,
)

quest_bp = Blueprint("quest_bp", __name__, url_prefix="/api/quests")

# ── User-facing ──────────────────────────────────────────────────
quest_bp.route("/active", methods=["GET"])(get_active)
quest_bp.route("/history", methods=["GET"])(get_history)
quest_bp.route("/freeze", methods=["POST"])(use_quest_freeze)

# ── Admin ────────────────────────────────────────────────────────
quest_admin_bp = Blueprint("quest_admin_bp", __name__, url_prefix="/api/admin/quests")

quest_admin_bp.route("", methods=["GET"])(list_templates)
quest_admin_bp.route("", methods=["POST"])(create_template)
quest_admin_bp.route("/<template_id>", methods=["PUT"])(update_template)
quest_admin_bp.route("/<template_id>", methods=["DELETE"])(delete_template)
quest_admin_bp.route("/stats", methods=["GET"])(get_stats)
