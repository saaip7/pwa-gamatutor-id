from datetime import datetime, timedelta
import pytz

def analyze_movement_context(movement_info):
    """
    Menganalisis konteks pergerakan card dan mengembalikan jenis respons
    
    Args:
        movement_info (dict): Informasi pergerakan card dari trigger detector
        
    Returns:
        dict: Hasil analisis konteks
    """
    try:
        card = movement_info["card"]
        user = movement_info["user"]
        from_column = movement_info["from_column"]
        to_column = movement_info["to_column"]
        
        # Analisis pola pergerakan
        movement_pattern = analyze_movement_pattern(movement_info["movement_history"])
        
        # Analisis waktu belajar
        time_analysis = analyze_study_time(movement_info["study_sessions"])
        
        # Analisis difficulty dan priority
        difficulty_priority_analysis = analyze_difficulty_priority(card)
        
        # Analisis pergerakan kolom
        column_analysis = analyze_column_movement(from_column, to_column)
        
        # Tentukan jenis respons berdasarkan konteks
        response_type = determine_response_type(
            from_column, 
            to_column, 
            movement_pattern, 
            time_analysis, 
            difficulty_priority_analysis
        )
        
        return {
            "response_type": response_type,
            "context": {
                "movement_pattern": movement_pattern,
                "time_analysis": time_analysis,
                "difficulty_priority_analysis": difficulty_priority_analysis,
                "column_analysis": column_analysis
            }
        }
    except Exception as e:
        print(f"Error in analyze_movement_context: {e}")
        return {
            "response_type": "general",
            "context": {
                "movement_pattern": {},
                "time_analysis": {},
                "difficulty_priority_analysis": {},
                "column_analysis": {}
            }
        }

def analyze_movement_pattern(movement_history):
    """
    Menganalisis pola pergerakan card
    
    Args:
        movement_history (list): Riwayat pergerakan card
        
    Returns:
        dict: Hasil analisis pola pergerakan
    """
    try:
        if not movement_history:
            return {
                "total_movements": 0,
                "pattern": "new",
                "is_first_movement": True,
                "frequent_back_and_forth": False,
                "stuck_in_column": False
            }
        
        total_movements = len(movement_history)
        
        # Analisis pergerakan maju dan mundur
        forward_movements = 0
        backward_movements = 0
        
        # Definisikan urutan kolom
        column_order = ["initial", "list1", "list2", "list3", "list4"]
        
        for i in range(1, len(movement_history)):
            from_col = movement_history[i-1].get("toColumn", "")
            to_col = movement_history[i].get("toColumn", "")
            
            try:
                from_idx = column_order.index(from_col) if from_col in column_order else -1
                to_idx = column_order.index(to_col) if to_col in column_order else -1
                
                if from_idx != -1 and to_idx != -1:
                    if to_idx > from_idx:
                        forward_movements += 1
                    elif to_idx < from_idx:
                        backward_movements += 1
            except ValueError:
                continue
        
        # Deteksi pergerakan bolak-balik yang sering
        frequent_back_and_forth = backward_movements > total_movements * 0.3
        
        # Deteksi card yang terjebak di kolom tertentu
        current_column = movement_history[-1].get("toColumn", "")
        time_in_current_column = 0
        
        if len(movement_history) > 1:
            last_movement_time = movement_history[-1].get("timestamp", "")
            if last_movement_time:
                try:
                    last_movement_dt = datetime.fromisoformat(last_movement_time.replace('Z', '+00:00'))
                    time_in_current_column = (datetime.now(pytz.UTC) - last_movement_dt).days
                except:
                    pass
        
        stuck_in_column = time_in_current_column > 7  # Lebih dari 7 hari
        
        # Tentukan pola pergerakan
        if total_movements == 1:
            pattern = "first_movement"
        elif frequent_back_and_forth:
            pattern = "back_and_forth"
        elif stuck_in_column:
            pattern = "stuck"
        elif backward_movements == 0:
            pattern = "steady_progress"
        else:
            pattern = "normal"
        
        return {
            "total_movements": total_movements,
            "pattern": pattern,
            "is_first_movement": total_movements == 1,
            "frequent_back_and_forth": frequent_back_and_forth,
            "stuck_in_column": stuck_in_column,
            "forward_movements": forward_movements,
            "backward_movements": backward_movements
        }
    except Exception as e:
        print(f"Error in analyze_movement_pattern: {e}")
        return {
            "total_movements": 0,
            "pattern": "unknown",
            "is_first_movement": False,
            "frequent_back_and_forth": False,
            "stuck_in_column": False
        }

def analyze_study_time(study_sessions):
    """
    Menganalisis waktu belajar dari sesi belajar
    
    Args:
        study_sessions (list): Daftar sesi belajar
        
    Returns:
        dict: Hasil analisis waktu belajar
    """
    try:
        if not study_sessions:
            return {
                "total_sessions": 0,
                "total_time_minutes": 0,
                "average_session_time": 0,
                "study_pattern": "no_data",
                "productive_hours": [],
                "longest_session": 0,
                "shortest_session": 0
            }
        
        total_sessions = len(study_sessions)
        total_time_minutes = 0
        session_times = []
        productive_hours = [0] * 24  # Count sessions per hour
        
        for session in study_sessions:
            start_time = session.get("start_time")
            end_time = session.get("end_time")
            
            if start_time and end_time:
                try:
                    start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                    end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                    
                    # Hitung durasi dalam menit
                    duration = (end_dt - start_dt).total_seconds() / 60
                    if duration > 0:
                        total_time_minutes += duration
                        session_times.append(duration)
                        
                        # Hitung jam produktif (dalam UTC+7)
                        local_hour = (start_dt.hour + 7) % 24
                        productive_hours[local_hour] += 1
                except:
                    continue
        
        # Hitung statistik
        average_session_time = total_time_minutes / total_sessions if total_sessions > 0 else 0
        longest_session = max(session_times) if session_times else 0
        shortest_session = min(session_times) if session_times else 0
        
        # Tentukan pola belajar
        if total_sessions == 0:
            study_pattern = "no_data"
        elif total_sessions <= 3:
            study_pattern = "beginner"
        elif average_session_time < 15:
            study_pattern = "short_sessions"
        elif average_session_time > 60:
            study_pattern = "long_sessions"
        else:
            study_pattern = "regular"
        
        # Temukan jam paling produktif
        max_productive_hour = productive_hours.index(max(productive_hours)) if productive_hours else 0
        
        return {
            "total_sessions": total_sessions,
            "total_time_minutes": total_time_minutes,
            "total_time_formatted": format_duration(total_time_minutes),
            "average_session_time": round(average_session_time, 2),
            "study_pattern": study_pattern,
            "productive_hours": productive_hours,
            "most_productive_hour": max_productive_hour,
            "longest_session": longest_session,
            "shortest_session": shortest_session
        }
    except Exception as e:
        print(f"Error in analyze_study_time: {e}")
        return {
            "total_sessions": 0,
            "total_time_minutes": 0,
            "average_session_time": 0,
            "study_pattern": "error",
            "productive_hours": [],
            "longest_session": 0,
            "shortest_session": 0
        }

def analyze_difficulty_priority(card):
    """
    Menganalisis difficulty dan priority card
    
    Args:
        card (dict): Informasi card
        
    Returns:
        dict: Hasil analisis difficulty dan priority
    """
    try:
        difficulty = card.get("difficulty", "medium").lower()
        priority = card.get("priority", "medium").lower()
        
        # Mapping difficulty ke level numerik
        difficulty_levels = {"easy": 1, "medium": 2, "hard": 3}
        difficulty_level = difficulty_levels.get(difficulty, 2)
        
        # Mapping priority ke level numerik
        priority_levels = {"low": 1, "medium": 2, "high": 3}
        priority_level = priority_levels.get(priority, 2)
        
        # Analisis kombinasi difficulty dan priority
        if difficulty_level == 3 and priority_level == 3:
            complexity = "very_high"
        elif difficulty_level >= 2 and priority_level >= 2:
            complexity = "high"
        elif difficulty_level == 1 and priority_level == 1:
            complexity = "low"
        else:
            complexity = "medium"
        
        # Estimasi waktu berdasarkan difficulty
        if difficulty == "easy":
            estimated_time = "30-60 menit"
        elif difficulty == "medium":
            estimated_time = "1-2 jam"
        else:  # hard
            estimated_time = "2-4 jam"
        
        return {
            "difficulty": difficulty,
            "priority": priority,
            "difficulty_level": difficulty_level,
            "priority_level": priority_level,
            "complexity": complexity,
            "estimated_time": estimated_time,
            "needs_attention": complexity in ["high", "very_high"]
        }
    except Exception as e:
        print(f"Error in analyze_difficulty_priority: {e}")
        return {
            "difficulty": "medium",
            "priority": "medium",
            "difficulty_level": 2,
            "priority_level": 2,
            "complexity": "medium",
            "estimated_time": "1-2 jam",
            "needs_attention": False
        }

def analyze_column_movement(from_column, to_column):
    """
    Menganalisis pergerakan antar kolom
    
    Args:
        from_column (str): ID kolom asal
        to_column (str): ID kolom tujuan
        
    Returns:
        dict: Hasil analisis pergerakan kolom
    """
    try:
        # Definisikan nama kolom
        column_names = {
            "initial": "Backlog",
            "list1": "Planning (To Do)",
            "list2": "Monitoring (In Progress)",
            "list3": "Controlling (Review)",
            "list4": "Reflection (Done)"
        }
        
        # Definisikan urutan kolom
        column_order = ["initial", "list1", "list2", "list3", "list4"]
        
        # Tentukan jenis pergerakan
        try:
            from_idx = column_order.index(from_column) if from_column in column_order else -1
            to_idx = column_order.index(to_column) if to_column in column_order else -1
            
            if from_idx == -1 or to_idx == -1:
                movement_type = "unknown"
            elif to_idx > from_idx:
                movement_type = "forward"
            elif to_idx < from_idx:
                movement_type = "backward"
            else:
                movement_type = "same"
        except ValueError:
            movement_type = "unknown"
        
        # Tentukan fase pergerakan
        phase_transitions = {
            ("initial", "list1"): "backlog_to_planning",
            ("list1", "list2"): "planning_to_monitoring",
            ("list2", "list3"): "monitoring_to_controlling",
            ("list3", "list4"): "controlling_to_reflection",
            ("list2", "list1"): "monitoring_to_planning",
            ("list3", "list2"): "controlling_to_monitoring",
            ("list4", "list3"): "reflection_to_controlling"
        }
        
        phase = phase_transitions.get((from_column, to_column), "other")
        
        # Tentukan apakah ini pergerakan milestone
        milestone_movements = [
            ("list1", "list2"),  # Mulai mengerjakan
            ("list3", "list4")   # Selesai
        ]
        
        is_milestone = (from_column, to_column) in milestone_movements
        
        return {
            "from_column": from_column,
            "to_column": to_column,
            "from_column_name": column_names.get(from_column, from_column),
            "to_column_name": column_names.get(to_column, to_column),
            "movement_type": movement_type,
            "phase": phase,
            "is_milestone": is_milestone,
            "is_forward": movement_type == "forward",
            "is_backward": movement_type == "backward"
        }
    except Exception as e:
        print(f"Error in analyze_column_movement: {e}")
        return {
            "from_column": from_column,
            "to_column": to_column,
            "from_column_name": from_column,
            "to_column_name": to_column,
            "movement_type": "unknown",
            "phase": "other",
            "is_milestone": False,
            "is_forward": False,
            "is_backward": False
        }

def determine_response_type(from_column, to_column, movement_pattern, time_analysis, difficulty_priority_analysis):
    """
    Menentukan jenis respons berdasarkan analisis konteks
    
    Args:
        from_column (str): ID kolom asal
        to_column (str): ID kolom tujuan
        movement_pattern (dict): Hasil analisis pola pergerakan
        time_analysis (dict): Hasil analisis waktu belajar
        difficulty_priority_analysis (dict): Hasil analisis difficulty dan priority
        
    Returns:
        str: Jenis respons
    """
    try:
        # Prioritaskan berdasarkan pergerakan kolom
        if from_column == "list1" and to_column == "list2":
            return "start_task"
        elif from_column == "list2" and to_column == "list3":
            return "review_task"
        elif from_column == "list3" and to_column == "list4":
            return "complete_task"
        elif from_column == "list2" and to_column == "list1":
            return "step_back_to_planning"
        elif from_column == "list3" and to_column == "list2":
            return "step_back_to_monitoring"
        elif from_column == "list4" and to_column == "list3":
            return "step_back_to_controlling"
        
        # Pertimbangkan pola pergerakan
        if movement_pattern.get("frequent_back_and_forth"):
            return "struggling_pattern"
        elif movement_pattern.get("stuck_in_column"):
            return "stuck_pattern"
        
        # Pertimbangkan analisis waktu
        if time_analysis.get("study_pattern") == "short_sessions":
            return "short_sessions_pattern"
        elif time_analysis.get("study_pattern") == "long_sessions":
            return "long_sessions_pattern"
        
        # Pertimbangkan complexity
        if difficulty_priority_analysis.get("needs_attention"):
            return "high_complexity"
        
        # Default response
        return "general"
    except Exception as e:
        print(f"Error in determine_response_type: {e}")
        return "general"

def format_duration(minutes):
    """
    Format durasi dalam menit ke format yang mudah dibaca
    
    Args:
        minutes (float): Durasi dalam menit
        
    Returns:
        str: Durasi yang diformat
    """
    try:
        if minutes < 60:
            return f"{round(minutes)} menit"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            if remaining_minutes > 0:
                return f"{int(hours)} jam {int(remaining_minutes)} menit"
            else:
                return f"{int(hours)} jam"
    except:
        return f"{round(minutes)} menit"