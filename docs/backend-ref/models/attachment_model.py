from datetime import datetime
from utils.db import mongo
from bson import ObjectId

class Attachment:
    def __init__(self, _id, user_id, board_id, card_id, file_path, original_filename, created_at=None):
        self._id = _id
        self.user_id = user_id
        self.board_id = board_id
        self.card_id = card_id
        self.file_path = file_path
        self.original_filename = original_filename
        self.created_at = created_at or datetime.utcnow()

    @staticmethod
    def create_attachment(user_id, board_id, card_id, file_path, original_filename):
        db = mongo.db
        attachment_data = {
            "user_id": user_id,
            "board_id": board_id,
            "card_id": card_id,
            "file_path": file_path,
            "original_filename": original_filename,
            "created_at": datetime.utcnow()
        }
        result = db.attachments.insert_one(attachment_data)
        attachment_data["_id"] = str(result.inserted_id)
        return attachment_data

    @staticmethod
    def get_attachments_by_card_id(card_id):
        db = mongo.db
        attachments = list(db.attachments.find({"card_id": card_id}))
        for attachment in attachments:
            attachment["_id"] = str(attachment["_id"])
        return attachments

    @staticmethod
    def get_attachment_by_id(attachment_id):
        db = mongo.db
        attachment = db.attachments.find_one({"_id": ObjectId(attachment_id)})
        if attachment:
            attachment["_id"] = str(attachment["_id"])
        return attachment

    @staticmethod
    def delete_attachment(attachment_id):
        db = mongo.db
        return db.attachments.delete_one({"_id": ObjectId(attachment_id)}) 