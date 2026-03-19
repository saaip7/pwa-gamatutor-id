from flask_pymongo import PyMongo
import logging
import os
from dotenv import load_dotenv
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

mongo = PyMongo()

def init_db(app):
    try:
        # Log the connection string (with password masked)
        connection_string = os.getenv('MONGO_URI', '')
        masked_connection = connection_string.replace(
            connection_string.split('@')[0].split(':')[1], 
            '****'
        ) if connection_string else 'Not found'
        logger.info(f"Attempting to connect to MongoDB with URI: {masked_connection}")
        
        # Initialize the app
        mongo.init_app(app)
        
        # Test the connection
        with app.app_context():
            # This will raise an exception if connection fails
            try:
                # Test the connection with a timeout
                mongo.db.command('ping')
                collections = mongo.db.list_collection_names()
                logger.info("Successfully connected to MongoDB Atlas")
                logger.info(f"Database: {mongo.db.name}")
                logger.info(f"Collections: {collections}")
            except ConnectionFailure as e:
                logger.error(f"Connection failure: {str(e)}")
                logger.error("This could be due to network issues or incorrect credentials")
                raise
            except ServerSelectionTimeoutError as e:
                logger.error(f"Server selection timeout: {str(e)}")
                logger.error("This could be due to IP whitelist restrictions or network issues")
                raise
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        logger.error(f"Connection string used: {masked_connection}")
        logger.error(f"App config MONGO_URI: {app.config.get('MONGO_URI', 'Not set')}")
        raise
