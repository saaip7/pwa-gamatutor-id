from flask import Blueprint
from features.goal.controller import (
    get_goals,
    set_general_goal,
    get_task_goal,
    set_task_goal,
    delete_task_goal,
    get_course_progress,
)

goals_bp = Blueprint("goals_bp", __name__)

goals_bp.route("/api/goals", methods=["GET"])(get_goals)
goals_bp.route("/api/goals/general", methods=["POST", "PUT"])(set_general_goal)
goals_bp.route("/api/goals/task/<card_id>", methods=["GET"])(get_task_goal)
goals_bp.route("/api/goals/task/<card_id>", methods=["POST", "PUT"])(set_task_goal)
goals_bp.route("/api/goals/task/<card_id>", methods=["DELETE"])(delete_task_goal)
goals_bp.route("/api/goals/course-progress", methods=["GET"])(get_course_progress)
