from flask import jsonify, request
from models.board_model import Board
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

@jwt_required()
def get_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board = Board.find_board_by_user_id(user_id)

    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": board["lists"]
    }), 200

def get_all_boards():
    boards = Board.get_all_boards()
    return jsonify([
        {"id": str(board["_id"]), "name": board["name"], "lists": board["lists"]}
        for board in boards
    ]), 200

def get_board_by_user_id(user_id):
    board = Board.find_board_by_user_id(user_id)
    if not board:
        return jsonify({"message": "Board not found"}), 404

    return jsonify({
        "id": str(board["_id"]),
        "name": board["name"],
        "lists": board["lists"]
    }), 200

@jwt_required()
def update_board():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    board_id = request.json.get("boardId")
    lists = request.json.get("lists")

    if not board_id or not lists:
        return jsonify({"message": "Missing Board ID or lists data"}), 400

    result = Board.update_board(board_id, user_id, lists)

    if result.modified_count == 0:
        return jsonify({"message": "Board not found or not modified"}), 404

    return jsonify({"message": "Board updated successfully"}), 200

@jwt_required()
def search_boards():
    user_id = get_jwt_identity()
    query = request.args.get("q", "")
    
    if not query:
        return jsonify({"message": "Missing search query"}), 400
    
    boards = Board.search_boards(user_id, query)
    
    return jsonify([
        {"id": str(board["_id"]), "name": board["name"]}
        for board in boards
    ]), 200

def update_card():
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    card_id = request.json.get("card_id")
    title = request.json.get("title")
    sub_title = request.json.get("sub_title")
    description = request.json.get("description")
    difficulty = request.json.get("difficulty")

    if not card_id:
        return jsonify({"message": "Missing card ID"}), 400

    result, status_code = Board.update_card(user_id, card_id, title, sub_title, description, difficulty)
    return jsonify(result), status_code

@jwt_required()
def get_progress_report():
    user_id = get_jwt_identity()
    board = Board.find_board_by_user_id(user_id)
    
    if not board:
        return jsonify({"message": "Board not found"}), 404

    lists = board.get("lists", [])
    total_cards = 0
    done_cards = 0
    report = {}
    strategy_stats = {}
    course_stats = {}  # New dictionary for course statistics
    strategy_usage = {}  # Track learning strategy usage per course

    # Get all active (non-archived, non-deleted) cards
    active_cards = []
    for list_data in lists:
        list_name = list_data.get("title", "Unknown")
        cards = list_data.get("cards", [])
        card_count = len([c for c in cards if not c.get("archived") and not c.get("deleted")])
        report[list_name] = card_count
        total_cards += card_count
        
        if list_name == "Reflection (Done)":
            done_cards = card_count
        
        # Add non-archived, non-deleted cards to active_cards
        active_cards.extend([c for c in cards if not c.get("archived") and not c.get("deleted")])

    # Collect grade statistics and strategy usage
    for card in active_cards:
        strategy = card.get("learning_strategy")
        title_parts = card.get("title", "").split("[")
        if len(title_parts) >= 2:
            course_name = title_parts[0].strip()
        else:
            continue  # Skip if card title doesn't follow the expected format

        # Track strategy usage per course
        if strategy and course_name:
            if strategy not in strategy_usage:
                strategy_usage[strategy] = {}
            if course_name not in strategy_usage[strategy]:
                strategy_usage[strategy][course_name] = 0
            strategy_usage[strategy][course_name] += 1

        # Initialize strategy stats if needed
        if strategy and strategy not in strategy_stats:
            strategy_stats[strategy] = {
                "pre_test": {"grades": [], "min": 100, "q1": 0, "median": 0, "q3": 0, "max": 0, "count": 0},
                "post_test": {"grades": [], "min": 100, "q1": 0, "median": 0, "q3": 0, "max": 0, "count": 0}
            }
        
        # Initialize course stats if needed
        if course_name and course_name not in course_stats:
            course_stats[course_name] = {
                "pre_test": {"grades": [], "avg": 0, "count": 0},
                "post_test": {"grades": [], "avg": 0, "count": 0}
            }

        # Add pre-test grade if available
        pre_test_grade = card.get("pre_test_grade")
        if pre_test_grade and pre_test_grade.strip():
            try:
                grade = float(pre_test_grade)
                if strategy:
                    strategy_stats[strategy]["pre_test"]["grades"].append(grade)
                if course_name:
                    course_stats[course_name]["pre_test"]["grades"].append(grade)
            except ValueError:
                pass

        # Add post-test grade if available
        post_test_grade = card.get("post_test_grade")
        if post_test_grade and post_test_grade.strip():
            try:
                grade = float(post_test_grade)
                if strategy:
                    strategy_stats[strategy]["post_test"]["grades"].append(grade)
                if course_name:
                    course_stats[course_name]["post_test"]["grades"].append(grade)
            except ValueError:
                pass

    # Calculate statistics for each strategy
    for strategy in strategy_stats:
        for grade_type in ["pre_test", "post_test"]:
            grades = strategy_stats[strategy][grade_type]["grades"]
            if grades:
                grades.sort()
                count = len(grades)
                strategy_stats[strategy][grade_type].update({
                    "min": grades[0],
                    "max": grades[-1],
                    "count": count
                })
                
                if count >= 4:
                    q1_index = count // 4
                    median_index = count // 2
                    q3_index = (3 * count) // 4
                    
                    strategy_stats[strategy][grade_type].update({
                        "q1": grades[q1_index],
                        "median": grades[median_index],
                        "q3": grades[q3_index]
                    })
                elif count > 0:
                    # For small samples, use the same value for all quartiles
                    strategy_stats[strategy][grade_type].update({
                        "q1": grades[0],
                        "median": grades[0],
                        "q3": grades[0]
                    })

            # Clean up the grades array as it's no longer needed
            del strategy_stats[strategy][grade_type]["grades"]

    # Calculate average grades for each course
    for course_name in course_stats:
        for grade_type in ["pre_test", "post_test"]:
            grades = course_stats[course_name][grade_type]["grades"]
            if grades:
                avg = sum(grades) / len(grades)
                course_stats[course_name][grade_type].update({
                    "avg": round(avg, 2),
                    "count": len(grades)
                })
            # Clean up the grades array as it's no longer needed
            del course_stats[course_name][grade_type]["grades"]

    # Calculate progress percentage
    progress_percentage = (done_cards / total_cards * 100) if total_cards > 0 else 0

    # Get top 3 learning strategies with their most used course
    top_strategies = []
    for strategy, courses in strategy_usage.items():
        total_usage = sum(courses.values())
        most_used_course = max(courses.items(), key=lambda x: x[1])[0]
        top_strategies.append({
            "strategy": strategy,
            "count": total_usage,
            "most_used_in": most_used_course
        })
    
    # Sort by count and take top 3
    top_strategies.sort(key=lambda x: x["count"], reverse=True)
    top_strategies = top_strategies[:3]

    return jsonify({
        "total_cards": total_cards,
        "done_cards": done_cards,
        "progress_percentage": progress_percentage,
        "list_report": report,
        "strategy_stats": strategy_stats,
        "course_stats": course_stats,
        "top_strategies": top_strategies
    }), 200
