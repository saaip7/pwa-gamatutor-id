from models.learningstrat_model import LearningStrat
from flask import jsonify, request

def add_learning_strat():
    data = request.json
    learning_strat_name = data.get("learning_strat_name")
    description = data.get("description")

    if not learning_strat_name:
        return jsonify({"message": "All fields (learning_strat_name) are required"}), 400

    learning_strat_id = LearningStrat.add_learning_strat(learning_strat_name, description)
    return jsonify({"message": "Learning strategy added successfully", "learning_strat_id": str(learning_strat_id)}), 201

def get_learning_strat(learning_strat_id):
    learning_strat = LearningStrat.get_learning_strat(learning_strat_id)
    if not learning_strat:
        return jsonify({"message": "Learning strategy not found"}), 404
    
    learning_strat["_id"] = str(learning_strat["_id"])  # Convert ObjectId to string for JSON compatibility
    return jsonify(learning_strat), 200

def get_all_learning_strats():
    learning_strats = LearningStrat.get_all_learning_strats()
    for learning_strat in learning_strats:
        learning_strat["_id"] = str(learning_strat["_id"])
    return jsonify(learning_strats), 200

def update_learning_strat(learning_strat_id):
    data = request.json
    if not data:
        return jsonify({"message": "No data provided to update"}), 400

    updates = {}
    if "learning_strat_name" in data:
        updates["learning_strat_name"] = data["learning_strat_name"]
    if "description" in data:
        updates["description"] = data["description"]

    if not updates:
        return jsonify({"message": "No valid fields to update"}), 400

    result = LearningStrat.update_learning_strat(learning_strat_id, updates)

    # Check if update was successful
    if result is None:
        return jsonify({"message": "Invalid learning strategy ID"}), 400

    if result.matched_count == 0:
        return jsonify({"message": "Learning strategy not found"}), 404

    if result.modified_count == 0:
        return jsonify({"message": "No changes were made (same value as before)"}), 200

    return jsonify({"message": "Learning strategy updated successfully"}), 200

def delete_learning_strat(learning_strat_id):
    result = LearningStrat.delete_learning_strat(learning_strat_id)
    if result is None:
        return jsonify({"message": "Invalid learning strategy ID"}), 400
    
    if result.deleted_count == 0:
       return jsonify({"message": "Learning strategy not found"}), 404
    
    return jsonify({"message": "Learning strategy deleted successfully"}), 200