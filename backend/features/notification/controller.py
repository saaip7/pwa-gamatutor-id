from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from features.notification.model import Notification
from features.announcement.model import Announcement
from shared.db import mongo
from shared.fcm import send_push
from bson import ObjectId


def send_notification(user_id, notif_type, title, body, data=None, send_email=False, email_subject=None, email_body=None, email_template=None, email_vars=None):
    """Dual-channel notification: save to DB, send FCM push, and optionally send email.

    Supports both plain text email (send_email=True) and templated HTML email
    (email_template="template_name" + email_vars={...}).
    """
    from shared.email import send_templated_email

    Notification.create(user_id, notif_type, title, body)

    prefs = mongo.db.user_preferences.find_one({"user_id": ObjectId(user_id)})
    token = prefs.get("fcm_token") if prefs else None
    push_ok = False
    if token:
        push_ok = send_push(token, title, body, data or {"type": notif_type})

    email_ok = False
    if email_template:
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if user and user.get("email"):
            email_ok = send_templated_email(
                user["email"],
                email_template,
                **(email_vars or {}),
            )
    elif send_email:
        email_ok = Notification.send_email(
            user_id,
            email_subject or title,
            body_text=email_body or body,
        )

    return {"db_saved": True, "push_sent": push_ok, "email_sent": email_ok}


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
    """Send a test push notification to the current user's device.

    Also saves to DB (Notification.create) so we can verify DB integration.
    Optionally sends email if send_email=true in request body.
    """
    user_id = get_jwt_identity()
    title = request.json.get("title", "Test GamaTutor")
    body = request.json.get("body", "Push notification berhasil!")
    send_email_flag = request.json.get("send_email", False)
    use_template = request.json.get("use_template", True)

    if send_email_flag and use_template:
        result = send_notification(
            user_id, "reminder", title, body,
            data={"type": "test"},
            email_template="generic_nudge",
            email_vars={"title": title, "message": body, "action_text": "Buka Aplikasi", "action_url": "https://v2.gamatutor.id"},
        )
    else:
        result = send_notification(
            user_id, "reminder", title, body,
            data={"type": "test"},
            send_email=send_email_flag,
            email_subject=title,
            email_body=body,
        )
    return jsonify(result), 200


@jwt_required()
def test_email():
    """Send a test HTML email to the current user's registered email address."""
    from shared.email import send_templated_email

    user_id = get_jwt_identity()
    template = request.json.get("template", "generic")
    template_vars = request.json.get("template_vars", {})

    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get("email"):
        return jsonify({"error": "Email pengguna belum terdaftar"}), 400

    ok = send_templated_email(user["email"], template, **template_vars)
    return jsonify({"email_sent": ok, "to": user["email"], "template": template}), 200 if ok else 500


@jwt_required()
def get_active_announcements():
    user_id = get_jwt_identity()
    try:
        announcements = Announcement.get_active(user_id)
        return jsonify({"announcements": announcements}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@jwt_required()
def dismiss_announcement(announcement_id):
    user_id = get_jwt_identity()
    try:
        success = Announcement.dismiss(announcement_id, user_id)
        if not success:
            return jsonify({"message": "Pengumuman tidak ditemukan"}), 404
        return jsonify({"message": "Pengumuman ditutup"}), 200
    except Exception as e:
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
