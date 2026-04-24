from shared.db import mongo
from bson import ObjectId
from datetime import datetime


VALID_TYPES = ["bug", "pertanyaan", "saran", "lainnya"]


class Report:
    @staticmethod
    def create(user_id, report_type, title, description):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        doc = {
            "user_id": user_id,
            "type": report_type,
            "title": title,
            "description": description,
            "status": "open",
            "admin_response": None,
            "responded_at": None,
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.reports.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    @staticmethod
    def find_by_user(user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(
            mongo.db.reports.find({"user_id": user_id}).sort("created_at", -1)
        )

    @staticmethod
    def find_all(page=1, per_page=20, status_filter=None):
        query = {}
        if status_filter and status_filter in ("open", "resolved"):
            query["status"] = status_filter
        total = mongo.db.reports.count_documents(query)
        skip = (page - 1) * per_page
        docs = list(
            mongo.db.reports.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(per_page)
        )
        return docs, total

    @staticmethod
    def find_by_id(report_id):
        if isinstance(report_id, str):
            report_id = ObjectId(report_id)
        return mongo.db.reports.find_one({"_id": report_id})

    @staticmethod
    def respond(report_id, admin_response):
        if isinstance(report_id, str):
            report_id = ObjectId(report_id)
        mongo.db.reports.update_one(
            {"_id": report_id},
            {
                "$set": {
                    "admin_response": admin_response,
                    "status": "resolved",
                    "responded_at": datetime.utcnow(),
                }
            },
        )
        return mongo.db.reports.find_one({"_id": report_id})
