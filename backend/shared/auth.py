from flask_jwt_extended import decode_token
from features.auth.model import User


def get_user_id_from_token(token: str) -> str:
    """Extract user_id from JWT token string (with or without Bearer prefix)."""
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        decoded = decode_token(token)
        user_id = decoded.get("sub")
        if not user_id:
            return None
        user = User.find_by_id(user_id)
        return user_id if user else None
    except Exception:
        return None
