from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from features.report.model import Report, VALID_TYPES
from shared.db import mongo
from shared.fcm import send_push


def _serialize(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    if doc.get("created_at"):
        doc["created_at"] = doc["created_at"].isoformat() + "Z"
    if doc.get("responded_at"):
        doc["responded_at"] = doc["responded_at"].isoformat() + "Z"
    return doc


@jwt_required()
def create_report():
    user_id = get_jwt_identity()
    data = request.json or {}
    report_type = (data.get("type") or "").strip().lower()
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()

    if report_type not in VALID_TYPES:
        return jsonify({"message": f"Tipe tidak valid. Pilihan: {', '.join(VALID_TYPES)}"}), 400
    if not title:
        return jsonify({"message": "Judul wajib diisi"}), 400
    if not description:
        return jsonify({"message": "Deskripsi wajib diisi"}), 400

    try:
        doc = Report.create(user_id, report_type, title, description)
        return jsonify({"report": _serialize(doc)}), 201
    except Exception as e:
        return jsonify({"message": "Gagal mengirim laporan", "error": str(e)}), 500


@jwt_required()
def get_my_reports():
    user_id = get_jwt_identity()
    try:
        docs = Report.find_by_user(user_id)
        return jsonify({"reports": [_serialize(d) for d in docs]}), 200
    except Exception as e:
        return jsonify({"message": "Gagal memuat laporan", "error": str(e)}), 500


def admin_get_reports():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status_filter = request.args.get("status", None)
    try:
        docs, total = Report.find_all(page, per_page, status_filter)
        return jsonify({
            "data": [_serialize(d) for d in docs],
            "total": total,
            "page": page,
            "per_page": per_page,
        }), 200
    except Exception as e:
        return jsonify({"message": "Gagal memuat laporan", "error": str(e)}), 500


def admin_respond_report(report_id):
    data = request.json or {}
    response_text = (data.get("response") or "").strip()
    if not response_text:
        return jsonify({"message": "Respons tidak boleh kosong"}), 400

    report = Report.find_by_id(report_id)
    if not report:
        return jsonify({"message": "Laporan tidak ditemukan"}), 404

    try:
        updated = Report.respond(report_id, response_text)

        prefs = mongo.db.user_preferences.find_one(
            {"user_id": updated["user_id"]},
            {"fcm_token": 1},
        )
        token = prefs.get("fcm_token") if prefs else None
        if token:
            send_push(
                token,
                "Laporanmu direspon admin!",
                response_text[:200],
                {"type": "report_response", "report_id": report_id},
            )

        return jsonify({"report": _serialize(updated)}), 200
    except Exception as e:
        return jsonify({"message": "Gagal mengirim respons", "error": str(e)}), 500
