from flask import Blueprint
from features.notification.controller import (
    get_notifications,
    get_unread_count,
    mark_read,
    mark_all_read,
    delete_notification,
    test_push,
    get_active_announcements,
    dismiss_announcement,
)

notification_bp = Blueprint("notification_bp", __name__)

notification_bp.route("/api/notifications", methods=["GET"])(get_notifications)
notification_bp.route("/api/notifications/unread-count", methods=["GET"])(get_unread_count)
notification_bp.route("/api/notifications/<notification_id>/read", methods=["PUT"])(mark_read)
notification_bp.route("/api/notifications/<notification_id>", methods=["DELETE"])(delete_notification)
notification_bp.route("/api/notifications/read-all", methods=["PUT"])(mark_all_read)
notification_bp.route("/api/notifications/test-push", methods=["POST"])(test_push)
notification_bp.route("/api/announcements", methods=["GET"])(get_active_announcements)
notification_bp.route("/api/announcements/<announcement_id>/dismiss", methods=["PUT"])(dismiss_announcement)
