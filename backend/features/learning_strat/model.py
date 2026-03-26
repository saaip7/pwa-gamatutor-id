from shared.db import mongo
from bson import ObjectId
from datetime import datetime


class LearningStrat:
    @staticmethod
    def create(name, description=None):
        doc = {
            "learning_strat_name": name,
            "description": description,
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.learning_strats.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_id(strat_id):
        try:
            return mongo.db.learning_strats.find_one({"_id": ObjectId(strat_id)})
        except Exception:
            return None

    @staticmethod
    def find_all():
        return list(mongo.db.learning_strats.find({}))

    @staticmethod
    def update(strat_id, updates):
        try:
            result = mongo.db.learning_strats.update_one(
                {"_id": ObjectId(strat_id)}, {"$set": updates}
            )
            return result
        except Exception:
            return None

    @staticmethod
    def delete(strat_id):
        try:
            result = mongo.db.learning_strats.delete_one({"_id": ObjectId(strat_id)})
            return result
        except Exception:
            return None
