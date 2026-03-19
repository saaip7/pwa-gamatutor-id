from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime
import logging

class User:
    @staticmethod
    def create_user(first_name, last_name, email, username, password, role="user"):
        hashed_password = generate_password_hash(password)
        user_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "username": username,
            "password": hashed_password,
            "role": role,
            "created_at": datetime.utcnow()
        }
        user_id = mongo.db.users.insert_one(user_data).inserted_id
        return user_id

    @staticmethod
    def find_user_by_username(username):
        return mongo.db.users.find_one({"username": username})
    
    @staticmethod
    def find_user_by_email(email):
        try:
            user = mongo.db.users.find_one({"email": email})
            return user
        except Exception as e:
            logging.error(f"Error finding user by email: {str(e)}")
            return None

    @staticmethod
    def validate_password(user, password):
        try:
            print(f"Validating password for user: {user['username']}")
            print(f"Input password: {password}")
            print(f"Stored hash: {user['password']}")
            result = check_password_hash(user['password'], password)
            print(f"Password validation result: {result}")
            return result
        except Exception as e:
            print(f"Error validating password: {str(e)}")
            return False

    @staticmethod
    def find_user_by_id(user_id):
        try:
            # First try to find the user directly
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            
            if not user:
                # If not found, try to find by string ID
                user = mongo.db.users.find_one({"_id": user_id})
            
            if not user:
                return None
                
            return user
        except Exception as e:
            print(f"Error finding user by ID: {str(e)}")
            return None

    @staticmethod
    def find_by_email(email):
        """Find user by email."""
        try:
            user = mongo.db.users.find_one({"email": email})
            return user
        except Exception as e:
            logging.error(f"Error finding user by email: {str(e)}")
            return None

    @staticmethod
    def find_by_reset_token(token):
        """Find user by reset token."""
        try:
            user = mongo.db.users.find_one({
                "reset_token": token,
                "reset_token_expiry": {"$gt": datetime.utcnow()}
            })
            return user
        except Exception as e:
            logging.error(f"Error finding user by reset token: {str(e)}")
            return None

    @staticmethod
    def update_reset_token(user_id, token, expiry):
        """Update user's reset token."""
        try:
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$set": {
                        "reset_token": token,
                        "reset_token_expiry": expiry
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error updating reset token: {str(e)}")
            return False

    @staticmethod
    def clear_reset_token(user_id):
        """Clear user's reset token."""
        try:
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {
                    "$unset": {
                        "reset_token": "",
                        "reset_token_expiry": ""
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error clearing reset token: {str(e)}")
            return False

    @staticmethod
    def update_password(user_id, new_password):
        """Update user's password."""
        try:
            hashed_password = generate_password_hash(new_password)
            result = mongo.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"password": hashed_password}}
            )
            return result.modified_count > 0
        except Exception as e:
            logging.error(f"Error updating password: {str(e)}")
            return False

    @staticmethod
    def update_existing_users():
        # Update all existing users that don't have created_at
        current_time = datetime.utcnow()
        result = mongo.db.users.update_many(
            {"created_at": {"$exists": False}},
            {"$set": {"created_at": current_time}}
        )
        return result.modified_count

