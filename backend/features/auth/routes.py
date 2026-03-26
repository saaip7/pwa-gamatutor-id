from flask import Blueprint
from features.auth.controller import register, login, refresh, logout

auth_bp = Blueprint("auth_bp", __name__)

auth_bp.route("/api/register", methods=["POST"])(register)
auth_bp.route("/api/login", methods=["POST"])(login)
auth_bp.route("/api/refresh", methods=["POST"])(refresh)
auth_bp.route("/api/logout", methods=["POST"])(logout)
