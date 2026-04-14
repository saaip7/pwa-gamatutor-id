from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.notification.model import Notification
from shared.db import mongo
from shared.fcm import send_push
from bson import ObjectId


@jwt_required()
def get_notifications():
    """Get all notifications (paginated)."""
    user_id = get_jwt_identity()
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    try:
        notifications = Notification.get_all(user_id, page, per_page)
        total = Notification.count_all(user_id)
        has_more = (page * per_page) < total
        return jsonify({
            "notifications": notifications,
            "total": total,
            "page": page,
            "has_more": has_more,
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


@jwt_required()
def delete_notification(notification_id):
    """Delete a single notification."""
    user_id = get_jwt_identity()
    try:
        success = Notification.delete(user_id, notification_id)
        if not success:
            return jsonify({"message": "Notification not found"}), 404
        return jsonify({"message": "Notification deleted"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def test_push():
    """Send a test push notification to the current user's device."""
    user_id = get_jwt_identity()
    title = request.json.get("title", "Test GamaTutor")
    body = request.json.get("body", "Push notification berhasil!")

    prefs = mongo.db.user_preferences.find_one({"user_id": ObjectId(user_id)})
    if not prefs or not prefs.get("fcm_token"):
        return jsonify({"message": "No FCM token found for this user"}), 404

    token = prefs["fcm_token"]
    ok = send_push(token, title, body, {"type": "test"})

    if ok:
        return jsonify({"message": "Push sent", "token_preview": token[:20] + "..."}), 200
    else:
        return jsonify({"message": "Push failed (token may be invalid)"}), 500
