from flask import Blueprint
from shared.admin import admin_required
from features.admin.controller import (
    list_users,
    get_user_detail,
    list_logs,
    list_boards,
    get_user_board,
    get_user_analytics,
    send_broadcast_email,
    get_scheduler_status,
    trigger_scheduler_job,
    toggle_scheduler_job,
    get_scheduler_logs,
)

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/admin")

# Users
admin_bp.route("/users", methods=["GET"])(admin_required(list_users))
admin_bp.route("/users/<user_id>", methods=["GET"])(admin_required(get_user_detail))

# Boards
admin_bp.route("/boards", methods=["GET"])(admin_required(list_boards))
admin_bp.route("/boards/<user_id>", methods=["GET"])(admin_required(get_user_board))

# Analytics
admin_bp.route("/analytics/<user_id>", methods=["GET"])(admin_required(get_user_analytics))

# Logs
admin_bp.route("/logs", methods=["GET"])(admin_required(list_logs))

# Email
admin_bp.route("/send-email", methods=["POST"])(admin_required(send_broadcast_email))

# Scheduler
admin_bp.route("/scheduler/status", methods=["GET"])(admin_required(get_scheduler_status))
admin_bp.route("/scheduler/trigger", methods=["POST"])(admin_required(trigger_scheduler_job))
admin_bp.route("/scheduler/toggle", methods=["POST"])(admin_required(toggle_scheduler_job))
admin_bp.route("/scheduler/logs", methods=["GET"])(admin_required(get_scheduler_logs))
