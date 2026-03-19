from flask_jwt_extended import decode_token
from models.user_model import User

def get_user_id_from_token(token: str) -> str:
    """Extract user_id from JWT token"""
    try:
        print(f"Received token: {token[:20]}...")
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
            print("Removed 'Bearer ' prefix")
        
        # Decode the token
        print("Attempting to decode token...")
        decoded_token = decode_token(token)
        user_id = decoded_token.get('sub')
        print(f"Decoded user_id: {user_id}")
        
        # Verify user exists
        user = User.find_user_by_id(user_id)
        if not user:
            print(f"User not found for id: {user_id}")
            return None
            
        print(f"User found: {user.get('username')}")
        return user_id
    except Exception as e:
        print(f"Error decoding token: {str(e)}")
        return None 