from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.notification.model import Notification


@jwt_required()
def get_notifications():
    """Get all notifications (paginated) with group labels."""
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    try:
        notifications = Notification.get_all(user_id, page, per_page)
        notifications = Notification.format_with_group(notifications)
        unread_count = Notification.get_unread_count(user_id)
        return jsonify({
            "notifications": notifications,
            "unreadCount": unread_count,
            "page": page,
            "perPage": per_page,
        }), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def get_unread_count():
    """Get unread notification count."""
    user_id = get_jwt_identity()
    try:
        count = Notification.get_unread_count(user_id)
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def mark_read(notification_id):
    """Mark a notification as read."""
    user_id = get_jwt_identity()
    try:
        success = Notification.mark_read(user_id, notification_id)
        if not success:
            return jsonify({"message": "Notification not found"}), 404
        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def mark_all_read():
    """Mark all notifications as read."""
    user_id = get_jwt_identity()
    try:
        count = Notification.mark_all_read(user_id)
        return jsonify({"message": f"{count} notifications marked as read"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
