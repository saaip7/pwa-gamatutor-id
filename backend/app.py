import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# ── Logging Config ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
# Suppress APScheduler's verbose per-job logs
logging.getLogger("apscheduler.executors.default").setLevel(logging.WARNING)
logging.getLogger("apscheduler.scheduler").setLevel(logging.WARNING)

from config import Config
from shared.db import init_db
from shared.fcm import init_firebase
from shared.scheduler import init_scheduler

# Feature blueprints
from features.auth.routes import auth_bp
from features.user.routes import user_bp
from features.board.routes import board_bp
from features.course.routes import course_bp
from features.learning_strat.routes import learningstrat_bp
from features.study_session.routes import study_session_bp
from features.goal.routes import goals_bp
from features.preferences.routes import preferences_bp
from features.badge.routes import badge_bp
from features.notification.routes import notification_bp
from features.analytics.routes import analytics_bp
from features.character.routes import character_bp
from features.admin.routes import admin_bp
from features.announcement.routes import announcement_bp
from features.report.routes import report_bp

load_dotenv()

app = Flask(__name__)


# CORS
raw = os.getenv("CORS_ORIGINS", "http://localhost:3000, http://localhost:3001")
origins = [o.strip() for o in raw.split(",")]
CORS(app, resources={
    r"/*": {
        "origins": origins,
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
    }
})

# Config
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_TOKEN_LOCATION"] = ["headers"]  # PWA/mobile: headers only, no cookies
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = 86400 * 7  # 7 days

# Init DB
init_db(app)

# Init Firebase Admin SDK
init_firebase()

# Init JWT
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(board_bp)
app.register_blueprint(course_bp)
app.register_blueprint(learningstrat_bp)
app.register_blueprint(study_session_bp)
app.register_blueprint(goals_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(badge_bp)
app.register_blueprint(notification_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(character_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(announcement_bp)
app.register_blueprint(report_bp)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "API gamatutor-pwa ready", "docs": "/api/health"}), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "gamatutor-pwa"}), 200


if os.environ.get("WERKZEUG_RUN_MAIN") == "true" or os.getenv("FLASK_DEBUG", "True") != "True":
    init_scheduler(app)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug, host="0.0.0.0", port=port)
