from flask import jsonify, request
from features.course.model import Course


def get_all():
    courses = Course.find_all()
    for c in courses:
        c["_id"] = str(c["_id"])
    return jsonify(courses), 200


def add():
    data = request.json
    course_code = data.get("course_code")
    course_name = data.get("course_name")
    if not course_code or not course_name:
        return jsonify({"message": "course_code and course_name are required"}), 400
    cid = Course.create(course_code, course_name)
    return jsonify({"message": "Course added", "course_id": str(cid)}), 201


def update(course_code):
    updates = request.json
    if not updates:
        return jsonify({"message": "No data provided"}), 400
    allowed = {"course_code", "course_name", "materials"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        return jsonify({"message": "No valid fields to update"}), 400
    result = Course.update(course_code, filtered)
    if result.modified_count == 0:
        return jsonify({"message": "Course not found or no changes"}), 404
    return jsonify({"message": "Course updated"}), 200


def delete(course_code):
    result = Course.delete(course_code)
    if result.deleted_count == 0:
        return jsonify({"message": "Course not found"}), 404
    return jsonify({"message": "Course deleted"}), 200
