from flask import Blueprint
from features.course.controller import get_all, add, update, delete

course_bp = Blueprint("course_bp", __name__)

course_bp.route("/courses", methods=["GET"])(get_all)
course_bp.route("/courses", methods=["POST"])(add)
course_bp.route("/courses/<course_code>", methods=["PUT"])(update)
course_bp.route("/courses/<course_code>", methods=["DELETE"])(delete)
