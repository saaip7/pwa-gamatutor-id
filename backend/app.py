import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from config import Config
from shared.db import init_db

# Feature blueprints
from features.auth.routes import auth_bp
from features.user.routes import user_bp
from features.board.routes import board_bp
from features.course.routes import course_bp
from features.learning_strat.routes import learningstrat_bp
from features.study_session.routes import study_session_bp

load_dotenv()

app = Flask(__name__)

# CORS
raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
origins = [o.strip() for o in raw.split(",")]
CORS(app, resources={
    r"/*": {
        "origins": origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
    }
})

# Config
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_TOKEN_LOCATION"] = ["headers"]  # PWA/mobile: headers only, no cookies
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 10800  # 3 hours
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = 86400 * 7  # 7 days

# Init DB
init_db(app)

# Init JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(board_bp)
app.register_blueprint(course_bp)
app.register_blueprint(learningstrat_bp)
app.register_blueprint(study_session_bp)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "API gamatutor-pwa ready", "docs": "/api/health"}), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "gamatutor-pwa"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug, host="0.0.0.0", port=port)
