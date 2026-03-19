from utils.db import mongo
from bson.objectid import ObjectId
from datetime import datetime
import pytz

class Log:
    @staticmethod
    def create_log(username, action_type, description):
        """
        Create a new log entry
        
        Args:
            username (str): The username of the user
            action_type (str): The type of action (login, logout)
            description (str): Description of the log
            
        Returns:
            str: The ID of the created log
        """
        log = {
            "username": username,
            "action_type": action_type,
            "description": description,
            "created_at": datetime.utcnow()
        }
        
        result = mongo.db.logs.insert_one(log)
        return str(result.inserted_id)

    @staticmethod
    def get_all_logs(limit=100):
        """
        Get all logs, sorted by creation date (newest first)
        
        Args:
            limit (int): Maximum number of logs to return
            
        Returns:
            list: List of log objects
        """
        logs = list(mongo.db.logs.find().sort("created_at", -1).limit(limit))
        
        # Convert ObjectId to string and format dates
        for log in logs:
            log["id"] = str(log.pop("_id"))
            
            # Convert UTC datetime to local time zone (example: 'Asia/Kolkata')
            if isinstance(log.get("created_at"), datetime):
                log["created_at"] = Log.convert_to_local_timezone(log["created_at"], "Asia/Kolkata")
                
        return logs

    @staticmethod
    def convert_to_local_timezone(utc_datetime, time_zone_str):
        """
        Convert UTC datetime to a specific time zone
        
        Args:
            utc_datetime (datetime): The UTC datetime object
            time_zone_str (str): The time zone string (e.g., 'Asia/Kolkata')
        
        Returns:
            datetime: The converted local time in the specified time zone
        """
        # Set UTC as the base time zone
        utc_zone = pytz.utc
        utc_datetime = utc_zone.localize(utc_datetime)  # Localize the UTC datetime
        
        # Convert to the desired time zone
        local_zone = pytz.timezone(time_zone_str)
        local_datetime = utc_datetime.astimezone(local_zone)
        
        return local_datetime.isoformat()  # Return ISO format to send to frontend