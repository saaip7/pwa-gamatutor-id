from flask import Blueprint
from features.analytics.controller import (
    dashboard,
    progress,
    strategy_effectiveness,
    confidence_trend,
    streak,
    streak_history,
)

analytics_bp = Blueprint("analytics_bp", __name__)

analytics_bp.route("/api/analytics/dashboard", methods=["GET"])(dashboard)
analytics_bp.route("/api/analytics/progress", methods=["GET"])(progress)
analytics_bp.route("/api/analytics/strategy-effectiveness", methods=["GET"])(strategy_effectiveness)
analytics_bp.route("/api/analytics/confidence-trend", methods=["GET"])(confidence_trend)
analytics_bp.route("/api/analytics/streak", methods=["GET"])(streak)
analytics_bp.route("/api/analytics/streak/history", methods=["GET"])(streak_history)
