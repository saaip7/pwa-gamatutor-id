from flask import jsonify, request
from models.course_model import Course

# Add a new course
def add_course():
    data = request.json
    course_code = data.get("course_code")
    course_name = data.get("course_name")

    if not course_code or not course_name:
        return jsonify({"message": "All fields (course_code, course_name) are required"}), 400

    course_id = Course.add_course(course_code, course_name)
    return jsonify({"message": "Course added successfully", "course_id": str(course_id)}), 201

# Get a course by code
def get_course_by_code(course_code):
    course = Course.find_course_by_code(course_code)
    if not course:
        return jsonify({"message": "Course not found"}), 404

    course["_id"] = str(course["_id"])  # Convert ObjectId to string for JSON compatibility
    return jsonify(course), 200

# Get all courses
def get_all_courses():
    courses = Course.find_all_courses()
    for course in courses:
        course["_id"] = str(course["_id"])  # Convert ObjectId to string
    return jsonify(courses), 200

# Update a course
def update_course(course_code):
    updates = request.json
    if not updates:
        return jsonify({"message": "No data provided to update"}), 400

    allowed_updates = {"course_code", "course_name", "materials"}
    filtered_updates = {key: value for key, value in updates.items() if key in allowed_updates}

    if not filtered_updates:
        return jsonify({"message": "No valid fields to update"}), 400

    result = Course.update_course(course_code, filtered_updates)
    if result.modified_count == 0:
        return jsonify({"message": "Course not found or no changes made"}), 404

    return jsonify({"message": "Course updated successfully"}), 200

# Delete a course
def delete_course(course_code):
    result = Course.delete_course(course_code)
    if result.deleted_count == 0:
        return jsonify({"message": "Course not found"}), 404
    return jsonify({"message": "Course deleted successfully"}), 200
