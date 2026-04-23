from flask import jsonify, request
from bson import ObjectId
from shared.db import mongo
from shared.fcm import send_push_batch
from features.announcement.model import Announcement


def send_broadcast_push():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    body = (data.get("body") or "").strip()
    save_to_db = data.get("save_to_db", False)

    if not title or not body:
        return jsonify({"message": "Title dan body wajib diisi"}), 400

    tokens = [
        p.get("fcm_token")
        for p in mongo.db.user_preferences.find(
            {"fcm_token": {"$ne": None, "$ne": ""}},
            {"fcm_token": 1},
        )
    ]
    tokens = [t for t in tokens if t]

    push_result = {"success": 0, "failure": 0}
    if tokens:
        push_result = send_push_batch(tokens, title, body, {"type": "admin_broadcast"})

    db_saved_count = 0
    if save_to_db:
        from features.notification.model import Notification
        for u in mongo.db.users.find({}, {"_id": 1}):
            Notification.create(str(u["_id"]), "reminder", title, body)
            db_saved_count += 1

    return jsonify({
        "message": "Push terkirim",
        "tokens_sent": len(tokens),
        "push_result": push_result,
        "db_saved_count": db_saved_count,
    }), 200


def create_announcement():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    body = (data.get("body") or "").strip()

    if not title or not body:
        return jsonify({"message": "Title dan body wajib diisi"}), 400

    doc = Announcement.create(title, body)

    return jsonify({
        "message": "Pengumuman dibuat",
        "announcement": {
            "_id": str(doc["_id"]),
            "title": doc["title"],
            "body": doc["body"],
            "is_active": doc["is_active"],
            "created_at": doc["created_at"].strftime("%Y-%m-%dT%H:%M:%S.%fZ") if hasattr(doc["created_at"], "strftime") else str(doc["created_at"]),
        },
    }), 201


def list_announcements():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
    except (ValueError, TypeError):
        page, per_page = 1, 20

    if page < 1:
        page = 1
    if per_page < 1 or per_page > 100:
        per_page = 20

    announcements, total = Announcement.list_all(page, per_page)

    return jsonify({
        "data": announcements,
        "total": total,
        "page": page,
        "per_page": per_page,
    }), 200


def toggle_announcement(announcement_id):
    try:
        ObjectId(announcement_id)
    except Exception:
        return jsonify({"message": "ID tidak valid"}), 400

    data = request.get_json(silent=True) or {}
    is_active = data.get("is_active")

    if is_active is None or not isinstance(is_active, bool):
        return jsonify({"message": "Field is_active (boolean) wajib"}), 400

    success = Announcement.toggle_active(announcement_id, is_active)
    if not success:
        return jsonify({"message": "Pengumuman tidak ditemukan"}), 404

    status = "diaktifkan" if is_active else "dinonaktifkan"

    return jsonify({"message": f"Pengumuman {status}"}), 200


def delete_announcement(announcement_id):
    try:
        ObjectId(announcement_id)
    except Exception:
        return jsonify({"message": "ID tidak valid"}), 400

    success = Announcement.delete(announcement_id)
    if not success:
        return jsonify({"message": "Pengumuman tidak ditemukan"}), 404

    return jsonify({"message": "Pengumuman dihapus"}), 200
