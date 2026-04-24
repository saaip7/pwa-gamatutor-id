from flask import Blueprint
from shared.admin import admin_required
from features.report.controller import (
    create_report,
    get_my_reports,
    admin_get_reports,
    admin_respond_report,
)

report_bp = Blueprint("report_bp", __name__)

report_bp.route("/api/reports", methods=["POST"])(create_report)
report_bp.route("/api/reports/mine", methods=["GET"])(get_my_reports)
report_bp.route("/admin/reports", methods=["GET"])(admin_required(admin_get_reports))
report_bp.route("/admin/reports/<report_id>/respond", methods=["PUT"])(
    admin_required(admin_respond_report)
)
