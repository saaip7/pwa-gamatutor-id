from shared.db import mongo
from bson import ObjectId
from datetime import datetime, timedelta
from shared.timezone_utils import utc_to_wib


class Analytics:
    """Aggregation queries for dashboard, progress, strategy, confidence, streak analytics."""

    @staticmethod
    def get_dashboard(user_id):
        """Dashboard overview: stats + study patterns."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # --- Stats ---
        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})

        card_query = {"user_id": user_id, "deleted": {"$ne": True}}
        total_tasks = mongo.db.cards.count_documents(card_query)
        tasks_completed = mongo.db.cards.count_documents({**card_query, "column": "list4"})

        streak_current = 0
        if prefs:
            streak_current = prefs.get("streak", {}).get("current", 0)

        badges_unlocked = mongo.db.badges.count_documents({"user_id": user_id})
        total_badges = 10  # fixed count from BADGE_DEFINITIONS

        # Focus hours from study sessions (exclude orphans)
        focus_pipeline = [
            {"$match": {"user_id": user_id, "end_time": {"$ne": None}, "orphan": {"$ne": True}}},
            {"$project": {
                "net_hours": {"$subtract": [
                    {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 3600000]},
                    {"$divide": [{"$ifNull": ["$hidden_ms", 0]}, 3600000]},
                ]},
            }},
            {"$group": {"_id": None, "total": {"$sum": "$net_hours"}}},
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

        card_query = {"user_id": user_id, "deleted": {"$ne": True}}

        total_cards = mongo.db.cards.count_documents(card_query)
        dist = {
            "list1": mongo.db.cards.count_documents({**card_query, "column": "list1"}),
            "list2": mongo.db.cards.count_documents({**card_query, "column": "list2"}),
            "list3": mongo.db.cards.count_documents({**card_query, "column": "list3"}),
            "list4": mongo.db.cards.count_documents({**card_query, "column": "list4"}),
        }
        completed_cards = dist["list4"]

        completion_rate = round((completed_cards / total_cards) * 100) if total_cards > 0 else 0

        # Personal best — longest single study session (exclude orphans)
        pb_pipeline = [
            {"$match": {"user_id": user_id, "end_time": {"$ne": None}, "orphan": {"$ne": True}}},
            {"$project": {
                "net_min": {"$subtract": [
                    {"$divide": [{"$subtract": ["$end_time", "$start_time"]}, 60000]},
                    {"$divide": [{"$ifNull": ["$hidden_ms", 0]}, 60000]},
                ]},
            }},
            {"$sort": {"net_min": -1}},
            {"$limit": 1},
        ]
        pb_result = list(mongo.db.study_sessions.aggregate(pb_pipeline))
        if pb_result:
            mins = int(pb_result[0]["net_min"])
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

        cards = list(mongo.db.cards.find({
            "user_id": user_id,
            "learning_strategy": {"$exists": True, "$ne": None},
        }))

        if not cards:
            return {"strategies": []}

        # Collect all cards grouped by learning_strategy
        strategy_data = {}
        for card in cards:
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

            # Subjective: Q1 effectiveness rating (ensure numeric)
            q1 = (card.get("reflection") or {}).get("q1_strategy")
            if q1 is not None:
                try:
                    strategy_data[strat]["q1_ratings"].append(float(q1))
                except (ValueError, TypeError):
                    pass

            # Objective: grade improvement (ensure numeric)
            pre = card.get("pre_test_grade")
            post = card.get("post_test_grade")
            try:
                pre = float(pre) if pre is not None else None
                post = float(post) if post is not None else None
            except (ValueError, TypeError):
                pre = post = None
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
    def get_confidence_trend(user_id, course_code=None):
        """Confidence + learning gain per reflection, grouped by course.

        Each reflection_completed log creates one data point (no daily aggregation).
        Default auto-selects course with most data.

        Args:
            course_code: Optional course code filter.
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        logs = list(mongo.db.logs.find(
            {"user_id": user_id, "action_type": "reflection_completed"},
            {"description": 1, "created_at": 1}
        ).sort("created_at", 1))

        if not logs:
            return {"courseCode": None, "availableCourses": [], "dataPoints": [], "trend": "stable"}

        # Build card lookup
        user_cards = list(mongo.db.cards.find({"user_id": user_id, "deleted": {"$ne": True}}))
        card_map = {}
        for card in user_cards:
            card_map[card.get("card_id")] = card

        # Build course_name → course_code lookup
        course_code_map = {}
        for c in mongo.db.courses.find({}, {"course_name": 1, "course_code": 1}):
            course_code_map[c.get("course_name")] = c.get("course_code")

        # Build per-reflection data points, grouped by course_name
        course_data = {}
        for log in logs:
            desc = log.get("description", "")
            created = log.get("created_at")
            if not created:
                continue

            parts = desc.split("card ")
            if len(parts) < 2:
                continue
            card_id = parts[-1].strip()

            card = card_map.get(card_id)
            if not card:
                continue

            cname = card.get("course_name", "Tanpa Mata Kuliah")
            if cname not in course_data:
                course_data[cname] = []

            # Confidence (Q2) — safe float conversion
            q2 = (card.get("reflection") or {}).get("q2_confidence")
            try:
                confidence = float(q2) if q2 is not None else None
            except (ValueError, TypeError):
                confidence = None

            # Learning gain (pre → post) — safe float conversion
            gain = None
            pre = card.get("pre_test_grade")
            post = card.get("post_test_grade")
            try:
                pre = float(pre) if pre is not None else None
                post = float(post) if post is not None else None
            except (ValueError, TypeError):
                pre = post = None
            if pre is not None and post is not None and pre > 0:
                gain = round(((post - pre) / pre) * 100, 1)

            course_data[cname].append({
                "date": created.strftime("%Y-%m-%d"),
                "confidence": confidence,
                "learningGain": gain,
            })

        if not course_data:
            return {"courseCode": None, "availableCourses": [], "dataPoints": [], "trend": "stable"}

        # Build available courses list with course codes
        available_courses = []
        for cname, points in course_data.items():
            available_courses.append({
                "code": course_code_map.get(cname) or cname,
                "name": cname,
                "dataPoints": len(points),
            })
        available_courses.sort(key=lambda x: x["dataPoints"], reverse=True)

        # Resolve course_code → course_name for selection
        code_to_name = {c["code"]: c["name"] for c in available_courses}
        selected_cname = None
        if course_code:
            selected_cname = code_to_name.get(course_code)
        if not selected_cname:
            selected_cname = available_courses[0]["name"] if available_courses else None

        data_points = course_data.get(selected_cname, [])

        # Trend from confidence values (first → last)
        conf_values = [dp["confidence"] for dp in data_points if dp["confidence"] is not None]
        trend = "stable"
        if len(conf_values) >= 2:
            if conf_values[-1] > conf_values[0]:
                trend = "improving"
            elif conf_values[-1] < conf_values[0]:
                trend = "declining"

        selected_code = course_code_map.get(selected_cname) or selected_cname

        return {
            "courseCode": selected_code,
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
        freeze_dates_list = streak.get("freeze_dates", [])
        freezes_used = streak.get("freezes_used_this_week", 0)
        freeze_used_at = streak.get("freeze_used_at")

        now = datetime.utcnow()

        # Backfill freeze_dates from freeze_used_at for legacy data
        if not freeze_dates_list and freeze_used_at:
            if isinstance(freeze_used_at, datetime):
                freeze_dates_list = [freeze_used_at.date().isoformat()]
            else:
                freeze_dates_list = [freeze_used_at.isoformat() if hasattr(freeze_used_at, 'isoformat') else str(freeze_used_at)]

        # Check if streak is stale
        last_active = streak.get("last_active_date")
        if current > 0 and last_active:
            if isinstance(last_active, str):
                last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00")).replace(tzinfo=None)
            if isinstance(last_active, datetime):
                last_active_date = last_active.replace(hour=0, minute=0, second=0, microsecond=0)
                yesterday = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
                yesterday_str = yesterday.date().isoformat()
                yesterday_frozen = yesterday_str in freeze_dates_list
                if last_active_date < yesterday and not yesterday_frozen:
                    current = 0

        freezes_available = 1 if freezes_used < 1 else 0

        # Build current week (Mon-Sun)
        today = now.date()
        monday = today - timedelta(days=today.weekday())

        DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

        # Determine frozen day: freeze covers the same day it was used
        frozen_date_str = None
        if freeze_used_at:
            if isinstance(freeze_used_at, datetime):
                frozen_day = freeze_used_at.date()
            else:
                frozen_day = freeze_used_at
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

    @staticmethod
    def get_streak_history(user_id):
        """Full streak history for GitHub-style contribution heatmap."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        prefs = mongo.db.user_preferences.find_one({"user_id": user_id})
        if not prefs:
            return {"active_dates": [], "current": 0, "longest": 0, "freezes_available": 0}

        streak = prefs.get("streak", {})
        active_dates = streak.get("active_dates", [])
        freeze_dates = streak.get("freeze_dates", [])
        active_dates = sorted(set(active_dates))

        # Backfill freeze_dates from freeze_used_at for legacy data
        if not freeze_dates:
            freeze_used_at = streak.get("freeze_used_at")
            if freeze_used_at:
                if isinstance(freeze_used_at, datetime):
                    frozen_day = freeze_used_at.date().isoformat()
                else:
                    frozen_day = freeze_used_at.isoformat() if hasattr(freeze_used_at, 'isoformat') else str(freeze_used_at)
                freeze_dates = [frozen_day]

        current = streak.get("current", 0)
        longest = streak.get("longest", 0)
        freezes_used = streak.get("freezes_used_this_week", 0)
        week_start = streak.get("week_start_date")

        now = datetime.utcnow()
        yesterday = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)

        # Check if streak is stale (last active >= 2 days ago, no freeze for yesterday)
        last_active = streak.get("last_active_date")
        if current > 0 and last_active:
            if isinstance(last_active, str):
                last_active = datetime.fromisoformat(last_active.replace("Z", "+00:00")).replace(tzinfo=None)
            if isinstance(last_active, datetime):
                last_active_date = last_active.replace(hour=0, minute=0, second=0, microsecond=0)
                yesterday_str = (now - timedelta(days=1)).date().isoformat()
                yesterday_frozen = yesterday_str in freeze_dates
                if last_active_date < yesterday and not yesterday_frozen:
                    current = 0

        # Use date comparison to avoid timezone issues
        today = now.date()
        current_week_start_date = today - timedelta(days=today.weekday())

        week_start_date = week_start.date() if week_start else None
        if not week_start_date or week_start_date < current_week_start_date:
            freezes_used = 0

        freezes_available = 1 if freezes_used < 1 else 0

        return {
            "active_dates": active_dates,
            "freeze_dates": sorted(set(freeze_dates)),
            "current": current,
            "longest": longest,
            "freezes_available": freezes_available,
        }

    @staticmethod
    def get_reflection_notes(user_id):
        """Get all q3_improvement notes from cards with reflection data."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        cards = list(mongo.db.cards.find(
            {
                "user_id": user_id,
                "reflection.q3_improvement": {"$exists": True, "$ne": ""},
                "deleted": {"$ne": True},
            },
            {
                "card_id": 1,
                "task_name": 1,
                "course_name": 1,
                "reflection.q3_improvement": 1,
                "reflection.completed_at": 1,
                "learning_strategy": 1,
            },
        ).sort("reflection.completed_at", -1))

        # Build course_name → course_code lookup
        course_map = {}
        for c in mongo.db.courses.find({}, {"course_name": 1, "course_code": 1}):
            course_map[c.get("course_name")] = c.get("course_code")

        notes = []
        for card in cards:
            reflection = card.get("reflection") or {}
            cname = card.get("course_name")
            notes.append({
                "card_id": card.get("card_id", str(card.get("_id", ""))),
                "task_name": card.get("task_name", ""),
                "course_code": course_map.get(cname) if cname else None,
                "q3_improvement": reflection.get("q3_improvement", ""),
                "completed_at": reflection.get("completed_at"),
                "strategy": card.get("learning_strategy"),
            })

        return {"notes": notes}

    # --- Private helpers ---

    @staticmethod
    def _compute_patterns(user_id):
        """Compute productive time-of-day and productive days of week (last 30 days)."""
        now = datetime.utcnow()
        cutoff = now - timedelta(days=30)

        sessions = list(mongo.db.study_sessions.find(
            {"user_id": user_id, "orphan": {"$ne": True}, "start_time": {"$gte": cutoff, "$ne": None}},
            {"start_time": 1}
        ))

        if not sessions:
            return {"productiveTime": "-", "productiveDays": "-"}

        # Count sessions per time period
        time_periods = {"pagi": 0, "siang": 0, "sore": 0, "malam": 0, "dini_hari": 0}
        day_counts = {}

        for s in sessions:
            st = utc_to_wib(s["start_time"])
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

        total = len(sessions)

        # Map period to label
        period_labels = {
            "pagi": "Pagi (06:00-12:00)",
            "siang": "Siang (12:00-15:00)",
            "sore": "Sore (15:00-18:00)",
            "malam": "Malam (18:00-24:00)",
            "dini_hari": "Dini hari (00:00-06:00)",
        }

        # Minimum threshold: 7 sessions for meaningful insight
        if total < 7:
            return {"productiveTime": "-", "productiveDays": "-"}

        top_period_key = max(time_periods, key=time_periods.get)
        top_period_count = time_periods[top_period_key]
        top_period_pct = round((top_period_count / total) * 100)
        productive_time = f"{period_labels[top_period_key]} ({top_period_pct}%)"

        # Top productive day
        sorted_days = sorted(day_counts.items(), key=lambda x: x[1], reverse=True)
        top_day = sorted_days[0]
        top_day_pct = round((top_day[1] / total) * 100)
        productive_days = f"{top_day[0]} ({top_day_pct}%)"

        return {
            "productiveTime": productive_time,
            "productiveDays": productive_days,
        }
