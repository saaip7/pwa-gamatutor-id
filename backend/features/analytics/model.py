from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta


class Analytics:
    """Aggregation queries for dashboard, progress, strategy, confidence, streak analytics."""

    @staticmethod
    def get_dashboard(user_id):
        """Dashboard overview: stats + study patterns."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # --- Stats ---
        board = mongo.db.boards.find_one({"user_id": user_id})
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})

        total_tasks = 0
        tasks_completed = 0
        if board:
            for lst in board.get("lists", []):
                cards = lst.get("cards", [])
                total_tasks += len(cards)
                if lst.get("id") == "list4":
                    tasks_completed = len(cards)

        streak_current = 0
        if prefs:
            streak_current = prefs.get("streak", {}).get("current", 0)

        badges_unlocked = mongo.db.badges.count_documents({"user_id": user_id})
        total_badges = 10  # fixed count from BADGE_DEFINITIONS

        # Focus hours from study sessions
        focus_pipeline = [
            {"$match": {"user_id": user_id, "end_time": {"$ne": None}}},
            {"$project": {
                "duration_hours": {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 3600000]},
            }},
            {"$group": {"_id": None, "total": {"$sum": "$duration_hours"}}},
        ]
        focus_result = list(mongo.db.study_sessions.aggregate(focus_pipeline))
        focus_hours = round(focus_result[0]["total"], 1) if focus_result else 0

        # --- Patterns (productive time & days) ---
        patterns = Analytics._compute_patterns(user_id)

        return {
            "stats": {
                "streak": streak_current,
                "focusHours": focus_hours,
                "tasksCompleted": tasks_completed,
                "badgesUnlocked": badges_unlocked,
                "totalBadges": total_badges,
            },
            "patterns": patterns,
        }

    @staticmethod
    def get_progress(user_id):
        """Progress page: summary + task distribution."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        board = mongo.db.boards.find_one({"user_id": user_id})

        total_cards = 0
        completed_cards = 0
        dist = {"list1": 0, "list2": 0, "list3": 0, "list4": 0}

        if board:
            for lst in board.get("lists", []):
                count = len(lst.get("cards", []))
                total_cards += count
                lid = lst.get("id", "")
                if lid in dist:
                    dist[lid] = count
                if lid == "list4":
                    completed_cards = count

        completion_rate = round((completed_cards / total_cards) * 100) if total_cards > 0 else 0

        # Personal best — longest single study session
        pb_pipeline = [
            {"$match": {"user_id": user_id, "end_time": {"$ne": None}}},
            {"$project": {
                "duration_min": {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 60000]},
            }},
            {"$sort": {"duration_min": -1}},
            {"$limit": 1},
        ]
        pb_result = list(mongo.db.study_sessions.aggregate(pb_pipeline))
        if pb_result:
            mins = int(pb_result[0]["duration_min"])
            hours, remainder = divmod(mins, 60)
            personal_best = f"{hours}h {remainder}m" if hours > 0 else f"{remainder}m"
        else:
            personal_best = "0m"

        # Distribution percentages
        todo_pct = round((dist["list1"] / total_cards) * 100) if total_cards else 0
        prog_pct = round((dist["list2"] / total_cards) * 100) if total_cards else 0
        rev_pct = round((dist["list3"] / total_cards) * 100) if total_cards else 0
        done_pct = round((dist["list4"] / total_cards) * 100) if total_cards else 0

        return {
            "summary": {
                "totalCards": total_cards,
                "completedCards": completed_cards,
                "completionRate": completion_rate,
                "personalBest": personal_best,
            },
            "taskDistribution": {
                "total": total_cards,
                "todoPercent": todo_pct,
                "progPercent": prog_pct,
                "revPercent": rev_pct,
                "donePercent": done_pct,
            },
        }

    @staticmethod
    def get_strategy_effectiveness(user_id):
        """Per-strategy subjective ratings and objective improvements."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        board = mongo.db.boards.find_one({"user_id": user_id})
        if not board:
            return {"strategies": []}

        # Collect all cards grouped by learning_strategy
        strategy_data = {}
        for lst in board.get("lists", []):
            for card in lst.get("cards", []):
                strat = card.get("learning_strategy")
                if not strat:
                    continue
                if strat not in strategy_data:
                    strategy_data[strat] = {
                        "cards": [],
                        "q1_ratings": [],
                        "improvements": [],
                    }
                strategy_data[strat]["cards"].append(card)

                # Subjective: Q1 effectiveness rating
                q1 = card.get("reflection", {}).get("q1_strategy")
                if q1 is not None:
                    strategy_data[strat]["q1_ratings"].append(q1)

                # Objective: grade improvement
                pre = card.get("pre_test_grade")
                post = card.get("post_test_grade")
                if pre is not None and post is not None and pre > 0:
                    imp = ((post - pre) / pre) * 100
                    strategy_data[strat]["improvements"].append(imp)

        strategies = []
        for name, data in strategy_data.items():
            q1_ratings = data["q1_ratings"]
            improvements = data["improvements"]
            total_cards = len(data["cards"])

            # Subjective stats
            avg_rating = round(sum(q1_ratings) / len(q1_ratings), 1) if q1_ratings else 0
            total_rated = len(q1_ratings)
            positive_pct = round(
                (sum(1 for r in q1_ratings if r >= 4) / len(q1_ratings)) * 100, 1
            ) if q1_ratings else 0

            # Objective stats
            avg_improvement = round(sum(improvements) / len(improvements), 1) if improvements else 0
            total_tracked = len(improvements)
            is_insufficient = total_tracked < 3

            strategies.append({
                "name": name,
                "taskCount": total_cards,
                "subjective": {
                    "avgRating": avg_rating,
                    "totalRated": total_rated,
                    "positivePercent": positive_pct,
                },
                "objective": {
                    "avgImprovement": avg_improvement,
                    "totalTracked": total_tracked,
                    "isDataInsufficient": is_insufficient,
                },
            })

        return {"strategies": strategies}

    @staticmethod
    def get_confidence_trend(user_id, course_name=None):
        """Confidence + learning gain over time, grouped by course.

        Args:
            course_name: Optional course filter. If None, defaults to course with most data.
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # Use logs with action_type "reflection_completed" for timestamps
        logs = list(mongo.db.logs.find(
            {"user_id": user_id, "action_type": "reflection_completed"},
            {"description": 1, "created_at": 1}
        ).sort("created_at", 1))

        if not logs:
            return {"courseName": None, "availableCourses": [], "dataPoints": [], "trend": "stable"}

        board = mongo.db.boards.find_one({"user_id": user_id})

        # Build a lookup: card_id -> card data
        card_map = {}
        if board:
            for lst in board.get("lists", []):
                for card in lst.get("cards", []):
                    card_map[card.get("id")] = card

        # Extract data points from logs, grouped by course
        # Structure: {course_name: {date_str: {confidences: [], gains: []}}}
        course_data = {}
        for log in logs:
            desc = log.get("description", "")
            created = log.get("created_at")
            if not created:
                continue

            # Extract card_id from "Reflection saved for card XXXXXXXX"
            parts = desc.split("card ")
            if len(parts) < 2:
                continue
            card_id = parts[-1].strip()

            card = card_map.get(card_id)
            if not card:
                continue

            card_course = card.get("course_name", "Tanpa Mata Kuliah")
            if card_course not in course_data:
                course_data[card_course] = {}

            date_str = created.strftime("%Y-%m-%d")
            if date_str not in course_data[card_course]:
                course_data[card_course][date_str] = {"confidences": [], "gains": []}

            # Confidence (Q2)
            q2 = card.get("reflection", {}).get("q2_confidence")
            if q2 is not None:
                course_data[card_course][date_str]["confidences"].append(q2)

            # Learning gain (pre → post)
            pre = card.get("pre_test_grade")
            post = card.get("post_test_grade")
            if pre is not None and post is not None and pre > 0:
                gain = ((post - pre) / pre) * 100
                course_data[card_course][date_str]["gains"].append(gain)

        if not course_data:
            return {"courseName": None, "availableCourses": [], "dataPoints": [], "trend": "stable"}

        # Build available courses list with data point counts
        available_courses = []
        for cname, daily in course_data.items():
            count = len(daily)
            available_courses.append({"name": cname, "dataPoints": count})
        available_courses.sort(key=lambda x: x["dataPoints"], reverse=True)

        # Select which course to show
        if course_name:
            selected_course = course_name
        else:
            # Default: course with most data points
            selected_course = available_courses[0]["name"] if available_courses else None

        # Build data points for selected course
        selected_daily = course_data.get(selected_course, {})
        data_points = []
        for date_str in sorted(selected_daily.keys()):
            d = selected_daily[date_str]
            avg_conf = round(sum(d["confidences"]) / len(d["confidences"]), 1) if d["confidences"] else None
            avg_gain = round(sum(d["gains"]) / len(d["gains"]), 1) if d["gains"] else None
            data_points.append({
                "date": date_str,
                "confidence": avg_conf,
                "learningGain": avg_gain,
            })

        # Determine trend from last 3 data points with confidence
        conf_values = [dp["confidence"] for dp in data_points if dp["confidence"] is not None]
        trend = "stable"
        if len(conf_values) >= 3:
            recent = conf_values[-3:]
            if recent[-1] > recent[0]:
                trend = "improving"
            elif recent[-1] < recent[0]:
                trend = "declining"

        return {
            "courseName": selected_course,
            "availableCourses": available_courses,
            "dataPoints": data_points,
            "trend": trend,
        }

    @staticmethod
    def get_streak(user_id):
        """Streak data with current week calendar."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return {"current": 0, "longest": 0, "days": [], "freezesAvailable": 0}

        streak = prefs.get("streak", {})
        current = streak.get("current", 0)
        longest = streak.get("longest", 0)
        active_dates = streak.get("active_dates", [])
        freezes_used = streak.get("freezes_used_this_week", 0)
        freeze_used_at = streak.get("freeze_used_at")

        freezes_available = 1 if freezes_used < 1 else 0

        # Build current week (Mon-Sun)
        now = datetime.utcnow()
        today = now.date()
        monday = today - timedelta(days=today.weekday())

        DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

        # Determine frozen day: freeze covers the day before freeze_used_at
        frozen_date_str = None
        if freeze_used_at:
            if isinstance(freeze_used_at, datetime):
                frozen_day = (freeze_used_at - timedelta(days=1)).date()
            else:
                frozen_day = freeze_used_at - timedelta(days=1)
            # Only count if within current week
            week_start = monday
            week_end = monday + timedelta(days=6)
            if week_start <= frozen_day <= week_end:
                frozen_date_str = frozen_day.isoformat()

        days = []
        for i in range(7):
            day_date = monday + timedelta(days=i)
            day_str = day_date.isoformat()

            if day_date > today:
                state = "future"
            elif day_str == today.isoformat():
                # Today — completed if already active, otherwise "today"
                if day_str in active_dates:
                    state = "completed"
                else:
                    state = "today"
            else:
                # Past day
                if day_str in active_dates:
                    state = "completed"
                elif day_str == frozen_date_str:
                    state = "freeze"
                else:
                    state = "inactive"

            days.append({"label": DAY_LABELS[i], "state": state})

        return {
            "current": current,
            "longest": longest,
            "days": days,
            "freezesAvailable": freezes_available,
        }

    # --- Private helpers ---

    @staticmethod
    def _compute_patterns(user_id):
        """Compute productive time-of-day and productive days of week."""
        sessions = list(mongo.db.study_sessions.find(
            {"user_id": user_id, "start_time": {"$ne": None}},
            {"start_time": 1}
        ))

        if not sessions:
            return {"productiveTime": "Belum ada data", "productiveDays": "Belum ada data"}

        # Count sessions per time period
        time_periods = {"pagi": 0, "siang": 0, "sore": 0, "malam": 0, "dini_hari": 0}
        day_counts = {}

        for s in sessions:
            st = s["start_time"]
            hour = st.hour

            if 6 <= hour < 12:
                time_periods["pagi"] += 1
            elif 12 <= hour < 15:
                time_periods["siang"] += 1
            elif 15 <= hour < 18:
                time_periods["sore"] += 1
            elif 18 <= hour < 24:
                time_periods["malam"] += 1
            else:
                time_periods["dini_hari"] += 1

            day_name = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"][st.weekday()]
            day_counts[day_name] = day_counts.get(day_name, 0) + 1

        # Map period to label
        period_labels = {
            "pagi": "Pagi hari (06:00 - 12:00)",
            "siang": "Siang hari (12:00 - 15:00)",
            "sore": "Sore hari (15:00 - 18:00)",
            "malam": "Malam hari (18:00 - 24:00)",
            "dini_hari": "Dini hari (00:00 - 06:00)",
        }
        top_period = max(time_periods, key=time_periods.get)
        productive_time = period_labels[top_period]

        # Top 1-2 productive days
        sorted_days = sorted(day_counts.items(), key=lambda x: x[1], reverse=True)
        if len(sorted_days) == 1:
            productive_days = sorted_days[0][0]
        elif len(sorted_days) >= 2:
            productive_days = f"{sorted_days[0][0]} & {sorted_days[1][0]}"
        else:
            productive_days = "Belum ada data"

        return {
            "productiveTime": productive_time,
            "productiveDays": productive_days,
        }
