from datetime import datetime
from utils.db import mongo
from bson import ObjectId

def detect_card_movement(user_id, board_id, card_id, from_column, to_column):
    """
    Mendeteksi pergerakan card dan mengembalikan informasi konteks
    
    Args:
        user_id (str): ID user yang menggerakkan card
        board_id (str): ID board tempat card berada
        card_id (str): ID card yang digerakkan
        from_column (str): ID kolom asal
        to_column (str): ID kolom tujuan
        
    Returns:
        dict: Informasi konteks pergerakan card
    """
    try:
        # Dapatkan informasi card
        card = get_card_info(board_id, card_id)
        
        # Dapatkan informasi user
        user = get_user_info(user_id)
        
        # Dapatkan riwayat pergerakan card
        movement_history = get_card_movement_history(board_id, card_id)
        
        # Dapatkan sesi belajar terkait card
        study_sessions = get_study_sessions_for_card(card_id)
        
        # Dapatkan informasi strategi belajar
        learning_strategy = get_learning_strategy(card.get("learning_strategy"))
        
        return {
            "card": card,
            "user": user,
            "movement_history": movement_history,
            "study_sessions": study_sessions,
            "learning_strategy": learning_strategy,
            "from_column": from_column,
            "to_column": to_column,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in detect_card_movement: {e}")
        return None

def get_card_info(board_id, card_id):
    """
    Mendapatkan informasi card dari board
    
    Args:
        board_id (str): ID board
        card_id (str): ID card
        
    Returns:
        dict: Informasi card
    """
    try:
        boards_collection = mongo.db.boards
        board = boards_collection.find_one({"_id": ObjectId(board_id)})
        
        if not board:
            return None
        
        # Cari card dalam lists
        for list_item in board.get("lists", []):
            for card in list_item.get("cards", []):
                if card.get("id") == card_id:
                    return card
        
        return None
    except Exception as e:
        print(f"Error in get_card_info: {e}")
        return None

def get_user_info(user_id):
    """
    Mendapatkan informasi user
    
    Args:
        user_id (str): ID user
        
    Returns:
        dict: Informasi user
    """
    try:
        users_collection = mongo.db.users
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if user:
            # Convert ObjectId to string for JSON serialization
            user["_id"] = str(user["_id"])
            # Remove sensitive information
            user.pop("password", None)
            
        return user
    except Exception as e:
        print(f"Error in get_user_info: {e}")
        return None

def get_card_movement_history(board_id, card_id):
    """
    Mendapatkan riwayat pergerakan card
    
    Args:
        board_id (str): ID board
        card_id (str): ID card
        
    Returns:
        list: Riwayat pergerakan card
    """
    try:
        boards_collection = mongo.db.boards
        board = boards_collection.find_one({"_id": ObjectId(board_id)})
        
        if not board:
            return []
        
        # Cari card dalam lists
        for list_item in board.get("lists", []):
            for card in list_item.get("cards", []):
                if card.get("id") == card_id:
                    return card.get("column_movements", [])
        
        return []
    except Exception as e:
        print(f"Error in get_card_movement_history: {e}")
        return []

def get_study_sessions_for_card(card_id):
    """
    Mendapatkan sesi belajar terkait card
    
    Args:
        card_id (str): ID card
        
    Returns:
        list: Sesi belajar terkait card
    """
    try:
        study_sessions_collection = mongo.db.study_sessions
        sessions = list(study_sessions_collection.find({"card_id": card_id}))
        
        # Convert ObjectId to string for JSON serialization
        for session in sessions:
            session["_id"] = str(session["_id"])
            
        return sessions
    except Exception as e:
        print(f"Error in get_study_sessions_for_card: {e}")
        return []

def get_learning_strategy(strategy_id):
    """
    Mendapatkan informasi strategi belajar
    
    Args:
        strategy_id (str): ID strategi belajar
        
    Returns:
        dict: Informasi strategi belajar
    """
    try:
        if not strategy_id:
            return None
            
        learning_strats_collection = mongo.db.learning_strats
        strategy = learning_strats_collection.find_one({"_id": ObjectId(strategy_id)})
        
        if strategy:
            # Convert ObjectId to string for JSON serialization
            strategy["_id"] = str(strategy["_id"])
            
        return strategy
    except Exception as e:
        print(f"Error in get_learning_strategy: {e}")
        return None

def log_card_movement(user_id, board_id, card_id, from_column, to_column):
    """
    Mencatat pergerakan card ke logs collection
    
    Args:
        user_id (str): ID user yang menggerakkan card
        board_id (str): ID board tempat card berada
        card_id (str): ID card yang digerakkan
        from_column (str): ID kolom asal
        to_column (str): ID kolom tujuan
        
    Returns:
        bool: True jika berhasil, False jika gagal
    """
    try:
        # Dapatkan informasi user untuk username
        user = get_user_info(user_id)
        username = user.get("username", "unknown") if user else "unknown"
        
        # Dapatkan informasi card untuk title
        card = get_card_info(board_id, card_id)
        card_title = card.get("title", "unknown") if card else "unknown"
        
        # Buat deskripsi log
        description = f"{username} moved card '{card_title}' from {from_column} to {to_column}"
        
        # Simpan ke logs collection
        logs_collection = mongo.db.logs
        log_entry = {
            "username": username,
            "user_id": user_id,
            "action_type": "card_movement",
            "description": description,
            "board_id": board_id,
            "card_id": card_id,
            "from_column": from_column,
            "to_column": to_column,
            "created_at": datetime.now()
        }
        
        logs_collection.insert_one(log_entry)
        return True
    except Exception as e:
        print(f"Error in log_card_movement: {e}")
        return False