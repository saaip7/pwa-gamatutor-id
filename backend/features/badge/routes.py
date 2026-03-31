from flask import Blueprint
from features.badge.controller import get_badges, get_badge_stats, check_and_unlock, mark_displayed

badge_bp = Blueprint("badge_bp", __name__)

badge_bp.route("/api/badges", methods=["GET"])(get_badges)
badge_bp.route("/api/badges/stats", methods=["GET"])(get_badge_stats)
badge_bp.route("/api/badges/check", methods=["POST"])(check_and_unlock)
badge_bp.route("/api/badges/<badge_type>/displayed", methods=["PUT"])(mark_displayed)
