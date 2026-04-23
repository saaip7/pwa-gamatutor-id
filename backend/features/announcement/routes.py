from flask import Blueprint
from shared.admin import admin_required
from features.announcement.controller import (
    send_broadcast_push,
    create_announcement,
    list_announcements,
    toggle_announcement,
    delete_announcement,
)

announcement_bp = Blueprint("announcement_bp", __name__, url_prefix="/admin/announcements")

announcement_bp.route("", methods=["GET"])(admin_required(list_announcements))
announcement_bp.route("", methods=["POST"])(admin_required(create_announcement))
announcement_bp.route("/<announcement_id>/toggle", methods=["PUT"])(admin_required(toggle_announcement))
announcement_bp.route("/<announcement_id>", methods=["DELETE"])(admin_required(delete_announcement))
announcement_bp.route("/push", methods=["POST"])(admin_required(send_broadcast_push))
