from flask_pymongo import PyMongo
import logging
import os
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mongo = PyMongo()


def init_db(app):
    try:
        connection_string = os.getenv("MONGO_URI", "")
        masked = connection_string.split("@")[0] + "@***" if "@" in connection_string else "Not found"
        logger.info(f"Connecting to MongoDB: {masked}")

        mongo.init_app(app)

        with app.app_context():
            mongo.db.command("ping")
            collections = mongo.db.list_collection_names()
            logger.info(f"Connected to MongoDB Atlas. Database: {mongo.db.name}, Collections: {collections}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"MongoDB connection failed: {e}")
        raise
    except Exception as e:
        logger.error(f"DB init error: {e}")
        raise
