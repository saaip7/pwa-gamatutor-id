from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime

class LearningStrat:
    @staticmethod
    def add_learning_strat(learning_strat_name, description):
        learning_strat_data = {
            "learning_strat_name": learning_strat_name,
            "description": description,
            "created_at": datetime.utcnow()
        }
        learning_strat_id = mongo.db.learning_strats.insert_one(learning_strat_data).inserted_id
        return learning_strat_id
    
    @staticmethod
    def get_learning_strat(learning_strat_id):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None
        return mongo.db.learning_strats.find_one({"_id": object_id})
    
    @staticmethod
    def get_all_learning_strats():
        return list(mongo.db.learning_strats.find({}))
    
    @staticmethod
    def update_learning_strat(learning_strat_id, updates):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None
        
        result = mongo.db.learning_strats.update_one({"_id": object_id}, {"$set": updates})
        return result
    
    @staticmethod
    def delete_learning_strat(learning_strat_id):
        try:
            object_id = ObjectId(learning_strat_id)
        except:
            return None
        
        result = mongo.db.learning_strats.delete_one({"_id": object_id})
        return result

    @staticmethod
    def update_existing_strategies():
        # Update all existing strategies that don't have created_at
        current_time = datetime.utcnow()
        result = mongo.db.learning_strats.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        return result.modified_count