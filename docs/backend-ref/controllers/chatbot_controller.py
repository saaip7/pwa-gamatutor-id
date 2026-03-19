from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.trigger_detector import detect_card_movement, log_card_movement
from utils.context_analyzer import analyze_movement_context
from utils.response_generator import generate_chatbot_response
from utils.db import mongo
from utils.chatbot_generator import generate_chatbot_message
from bson import ObjectId
import datetime

@jwt_required()
def handle_card_movement():
    """
    Handle card movement and generate chatbot response
    
    Expected JSON payload:
    {
        "board_id": "board_id",
        "card_id": "card_id",
        "from_column": "from_column_id",
        "to_column": "to_column_id"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        # Validate required fields
        required_fields = ["board_id", "card_id", "from_column", "to_column"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "message": f"Missing required field: {field}"
                }), 400
        
        board_id = data.get("board_id")
        card_id = data.get("card_id")
        from_column = data.get("from_column")
        to_column = data.get("to_column")
        
        # Get current user ID from JWT
        user_id = get_jwt_identity()
        
        # Skip if no actual movement (same column)
        if from_column == to_column:
            return jsonify({
                "status": "success",
                "message": "No movement detected",
                "response": None
            }), 200
        
        # Detect card movement and get context
        movement_info = detect_card_movement(user_id, board_id, card_id, from_column, to_column)
        
        if not movement_info:
            return jsonify({
                "status": "error",
                "message": "Failed to detect card movement"
            }), 500
        
        # Analyze movement context
        context_analysis = analyze_movement_context(movement_info)
        
        # Generate chatbot response
        chatbot_response = generate_chatbot_response(context_analysis, movement_info)
        
        # Log card movement
        log_card_movement(user_id, board_id, card_id, from_column, to_column)
        
        # Log chatbot interaction
        log_chatbot_interaction(user_id, card_id, from_column, to_column, chatbot_response)
        
        return jsonify({
            "status": "success",
            "message": "Card movement processed successfully",
            "response": chatbot_response
        }), 200
    
    except Exception as e:
        print(f"Error in handle_card_movement: {e}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@jwt_required()
def get_chatbot_history():
    """
    Get chatbot interaction history for current user
    
    Query parameters:
    - limit: Number of records to return (default: 10)
    - offset: Offset for pagination (default: 0)
    """
    try:
        # Get query parameters
        limit = int(request.args.get("limit", 10))
        offset = int(request.args.get("offset", 0))
        
        # Get current user ID from JWT
        user_id = get_jwt_identity()
        
        # Get chatbot logs
        logs_collection = mongo.db.chatbot_logs
        logs = list(logs_collection.find({"user_id": user_id})
                    .sort("created_at", -1)
                    .skip(offset)
                    .limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for log in logs:
            log["_id"] = str(log["_id"])
        
        # Get total count for pagination
        total_count = logs_collection.count_documents({"user_id": user_id})
        
        return jsonify({
            "status": "success",
            "data": logs,
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset
            }
        }), 200
    
    except Exception as e:
        print(f"Error in get_chatbot_history: {e}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

@jwt_required()
def get_chatbot_stats():
    """
    Get chatbot interaction statistics for current user
    """
    try:
        # Get current user ID from JWT
        user_id = get_jwt_identity()
        
        # Get chatbot logs
        logs_collection = mongo.db.chatbot_logs
        logs = list(logs_collection.find({"user_id": user_id}))
        
        # Calculate statistics
        total_interactions = len(logs)
        
        # Count by response type
        response_types = {}
        movement_types = {
            "forward": 0,
            "backward": 0,
            "same": 0
        }
        
        for log in logs:
            response_type = log.get("response_type", "unknown")
            response_types[response_type] = response_types.get(response_type, 0) + 1
            
            movement_type = log.get("movement_type", "unknown")
            if movement_type in movement_types:
                movement_types[movement_type] += 1
        
        # Get most active cards
        card_activity = {}
        for log in logs:
            card_id = log.get("card_id", "")
            if card_id:
                card_activity[card_id] = card_activity.get(card_id, 0) + 1
        
        # Sort cards by activity
        most_active_cards = sorted(card_activity.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return jsonify({
            "status": "success",
            "stats": {
                "total_interactions": total_interactions,
                "response_types": response_types,
                "movement_types": movement_types,
                "most_active_cards": most_active_cards
            }
        }), 200
    
    except Exception as e:
        print(f"Error in get_chatbot_stats: {e}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

def log_chatbot_interaction(user_id, card_id, from_column, to_column, chatbot_response):
    """
    Log chatbot interaction to database
    
    Args:
        user_id (str): ID user
        card_id (str): ID card
        from_column (str): ID kolom asal
        to_column (str): ID kolom tujuan
        chatbot_response (dict): Respons chatbot
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logs_collection = mongo.db.chatbot_logs
        
        log_entry = {
            "user_id": user_id,
            "card_id": card_id,
            "from_column": from_column,
            "to_column": to_column,
            "response_type": chatbot_response.get("response_type", ""),
            "message": chatbot_response.get("message", ""),
            "suggestions": chatbot_response.get("suggestions", []),
            "reflection_questions": chatbot_response.get("reflection_questions", []),
            "context_summary": chatbot_response.get("context_summary", {}),
            "created_at": chatbot_response.get("timestamp", ""),
            "movement_type": chatbot_response.get("context_summary", {}).get("movement_type", ""),
            "phase": chatbot_response.get("context_summary", {}).get("phase", ""),
            "is_milestone": chatbot_response.get("context_summary", {}).get("is_milestone", False)
        }
        
        logs_collection.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Error in log_chatbot_interaction: {e}")
        return False

@jwt_required()
def handle_chat_message():
    """
    Handle general chat messages from user
    
    Expected JSON payload:
    {
        "message": "User message",
        "userId": "user_id",
        "userName": "User Name"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        # Validate required fields
        if "message" not in data:
            return jsonify({
                "status": "error",
                "message": "Missing required field: message"
            }), 400
        
        message = data.get("message")
        user_name = data.get("userName", "User")
        
        # Get current user ID from JWT
        user_id = get_jwt_identity()
        
        # Generate chatbot response
        chatbot_response = generate_chatbot_message(message, user_name)
        
        # Log chatbot interaction
        log_general_chat_interaction(user_id, message, chatbot_response)
        
        return jsonify({
            "status": "success",
            "reply": chatbot_response
        }), 200
    
    except Exception as e:
        print(f"Error in handle_chat_message: {e}")
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

def log_general_chat_interaction(user_id, message, response):
    """
    Log general chat interaction to database
    
    Args:
        user_id (str): ID user
        message (str): User message
        response (str): Chatbot response
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        logs_collection = mongo.db.chatbot_logs
        
        log_entry = {
            "user_id": user_id,
            "message": message,
            "reply": response,
            "sender": "user",
            "type": "general_chat",
            "created_at": datetime.datetime.utcnow()
        }
        
        logs_collection.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Error in log_general_chat_interaction: {e}")
        return False