from flask import Blueprint
from controllers import course_controller

course_bp = Blueprint("course_bp", __name__)

course_bp.route("/courses", methods=["POST"])(course_controller.add_course)
course_bp.route("/courses", methods=["GET"])(course_controller.get_all_courses)
course_bp.route("/courses/<course_code>", methods=["GET"])(course_controller.get_course_by_code)
course_bp.route("/courses/<course_code>", methods=["PUT"])(course_controller.update_course)
course_bp.route("/courses/<course_code>", methods=["DELETE"])(course_controller.delete_course)
