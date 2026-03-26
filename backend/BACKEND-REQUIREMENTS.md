# Backend Requirements — Gamatutor PWA

**Last Updated:** March 26, 2026
**Reference:** `D:/context_skripsi/workspace/gamatutor-id/backend/` (kakak tingkat)
**Schema:** `D:/context_skripsi/technical/database-schema.md` (v2.1, 10 collections)
**Features:** `D:/context_skripsi/fitur-revisi.md` (26 features)

---

## Status

- Folder: **Empty** (hanya `requirements.txt` + empty `config/`, `features/`, `utils/`)
- Reference backend: **Fully functional** (Flask + MongoDB Atlas + JWT)
- Target: Flask backend dengan 10 collections, mendukung 26 features PWA

---

## Architecture

```
backend/
├── app.py                    # Flask app entry point
├── config.py                 # Config class (MongoDB, JWT, CORS)
├── .env                      # Environment variables (local only)
├── requirements.txt          # Already exists (Flask, PyMongo, JWT, etc.)
│
├── models/                   # MongoDB data access layer
│   ├── user_model.py
│   ├── board_model.py
│   ├── course_model.py
│   ├── learning_strat_model.py
│   ├── study_session_model.py
│   ├── log_model.py
│   ├── goal_model.py         # NEW
│   ├── badge_model.py        # NEW
│   ├── user_preferences_model.py  # NEW
│   └── notification_model.py      # NEW
│
├── routes/                   # API endpoints (blueprints)
│   ├── auth_routes.py        # POST /api/register, /api/login, /api/refresh, /api/logout
│   ├── board_routes.py       # GET/POST board & card CRUD
│   ├── user_routes.py        # GET/PUT/DELETE user profile
│   ├── course_routes.py      # GET/POST/PUT/DELETE courses
│   ├── learningstrat_routes.py  # GET/POST/PUT/DELETE strategies
│   ├── study_sessions.py     # POST start/end, GET by card
│   ├── goal_routes.py        # NEW - Goal Hierarchy CRUD
│   ├── badge_routes.py       # NEW - Badge unlock & gallery
│   ├── preferences_routes.py # NEW - User preferences & theme
│   ├── notification_routes.py # NEW - Notifications & push
│   └── analytics_routes.py   # NEW - Progress, streaks, strategy effectiveness
│
└── utils/
    ├── db.py                 # MongoDB init (PyMongo)
    ├── auth.py               # JWT helpers
    ├── validators.py         # Input validation (Pydantic)
    └── badge_engine.py       # NEW - Badge unlock logic
```

---

## Database: 10 Collections

### Baseline (dari kakak tingkat, sudah proven)

| Collection | Purpose | Reference |
|---|---|---|
| `users` | Auth & profile | Identik dengan kating |
| `boards` | Kanban board + embedded cards | Enhanced (lihat schema v2.1) |
| `courses` | Course list (autocomplete) | Identik |
| `learning_strats` | Learning strategies (autocomplete) | Identik |
| `study_sessions` | Timer tracking | Enhanced (user_id → ObjectId) |
| `logs` | Activity logging (research metrics) | Enhanced (more action types) |

### NEW (untuk 26 features PWA)

| Collection | Purpose | Features Supported |
|---|---|---|
| `goals` | 3-level Goal Hierarchy (general → course → task) | #2, #21 |
| `badges` | Milestone badges (achievement record) | #12 |
| `user_preferences` | Notifications, theme, onboarding, streak cache, FCM token | #1, #7, #8, #9, #19, #20 |
| `notifications` | Push notification tracking & scheduling | #7, #8, #13, #15 |

---

## API Endpoints — Complete List

### 1. AUTH (`auth_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | No | Register + create initial board + create user_preferences defaults |
| POST | `/api/login` | No | Login + log session_start |
| POST | `/api/refresh` | Yes | Refresh JWT token |
| POST | `/api/logout` | Yes | Logout + log session_end |

**Delta dari kating:**
- Register: juga buat `user_preferences` default document
- Login: log `session_start` (untuk DAU tracking Sub-RQ 1)

### 2. USER (`user_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Get current user profile |
| PUT | `/update-user` | Yes | Update profile (first_name, last_name, email, username) |
| PUT | `/update-password` | Yes | Change password |
| DELETE | `/delete-user` | Yes | Delete account |

**Identik dengan kating.** Tambahkan `/users/me` endpoint (sebelumnya harus pakai user_id).

### 3. BOARD & CARDS (`board_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/board` | Yes | Get current user's board |
| POST | `/update-board` | Yes | Full board update (drag/drop, add/move/delete cards) |
| POST | `/update-card` | Yes | Update single card properties |
| GET | `/board/card/<card_id>` | Yes | Get single card detail (for focus mode) |

**Delta dari kating:**
- Hapus chatbot trigger logic (PWA tidak pakai chatbot, pakai Focus Mode + Reflection)
- Enhanced card schema: `reflection.*`, `personal_best.*`, `goal_check.*`, `satisfaction_rating`
- Log action types ditambah: `task_created`, `task_moved`, `task_completed`, `reflection_completed`, `badge_unlocked`, dll

### 4. COURSES (`course_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/courses` | Yes | Get all courses (autocomplete) |
| POST | `/courses` | Admin | Add course |
| PUT | `/courses/<code>` | Admin | Update course |
| DELETE | `/courses/<code>` | Admin | Delete course |

**Identik dengan kating.**

### 5. LEARNING STRATEGIES (`learningstrat_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/learningstrats` | Yes | Get all strategies (autocomplete) |
| POST | `/learningstrats` | Admin | Add strategy |
| PUT | `/learningstrats/<id>` | Admin | Update strategy |
| DELETE | `/learningstrats/<id>` | Admin | Delete strategy |

**Identik dengan kating.**

### 6. STUDY SESSIONS (`study_sessions.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/study-sessions/start` | Yes | Start timer for card |
| POST | `/api/study-sessions/end` | Yes | End timer + calculate duration |
| GET | `/api/study-sessions/card/<card_id>` | Yes | Get all sessions + total time |

**Identik dengan kating.**

### 7. GOALS (NEW — `goal_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/goals` | Yes | Get all goals for current user |
| GET | `/api/goals/general` | Yes | Get general goal (Level 1) |
| POST | `/api/goals` | Yes | Create goal (any level) |
| PUT | `/api/goals/<id>` | Yes | Update goal content |
| DELETE | `/api/goals/<id>` | Yes | Delete goal |
| GET | `/api/goals/course/<course_name>` | Yes | Get course goal (Level 2) with fallback to general |
| GET | `/api/goals/task/<card_id>` | Yes | Get task goal (Level 3) with fallback to course → general |

**Business Logic:**
- Onboarding: create general goal (type: "general")
- First task per course: prompt course goal (type: "course", parent_id: general_goal._id)
- Task goal (optional): override per task
- Fallback chain: task → course → general

### 8. BADGES (NEW — `badge_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/badges` | Yes | Get all badges for current user (unlocked + locked list) |
| GET | `/api/badges/stats` | Yes | Badge summary (count unlocked, total available) |
| POST | `/api/badges/check` | Yes | Check & unlock badges after action (internal trigger) |

**Business Logic (badge_engine.py):**
- 10 badge types defined in schema v2.1
- Check triggers: task_completed, reflection_completed, streak_milestone, grade_improvement
- Prevent duplicates via unique index (user_id + badge_type)
- Set `displayed: false` on unlock → set `true` after celebration shown to user

### 9. USER PREFERENCES (NEW — `preferences_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/preferences` | Yes | Get current preferences |
| PUT | `/api/preferences/notifications` | Yes | Update notification settings |
| PUT | `/api/preferences/theme` | Yes | Update theme (mode, color_scheme) |
| PUT | `/api/preferences/onboarding` | Yes | Update onboarding state |
| PUT | `/api/preferences/fcm-token` | Yes | Update FCM token (push notifications) |
| GET | `/api/preferences/streak` | Yes | Get streak data (cached) |

**Business Logic:**
- Default preferences created on register
- Streak cache: updated by analytics engine (not by user)
- FCM token: updated from frontend on login/device change

### 10. NOTIFICATIONS (NEW — `notification_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | Yes | Get all notifications (paginated) |
| GET | `/api/notifications/unread-count` | Yes | Get unread notification count |
| PUT | `/api/notifications/<id>/read` | Yes | Mark notification as read |
| PUT | `/api/notifications/read-all` | Yes | Mark all as read |

**Note:** Push notification sending (FCM) bisa diimplementasi di Phase 2-3.
Saat ini fokus: notification tracking & in-app notification center.

### 11. ANALYTICS (NEW — `analytics_routes.py`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/dashboard` | Yes | Dashboard stats (total tasks, done, streak, badges) |
| GET | `/api/analytics/progress` | Yes | Progress over time (weekly/monthly task completion) |
| GET | `/api/analytics/strategy-effectiveness` | Yes | Strategy performance (avg confidence per strategy) |
| GET | `/api/analytics/confidence-trend` | Yes | Confidence rating trend over time |
| GET | `/api/analytics/streak` | Yes | Current + longest streak |

**Business Logic:**
- Dashboard stats: aggregate from boards (count cards per list)
- Strategy effectiveness: group by `reflection.q1_strategy`, avg `q2_confidence`
- Confidence trend: timeline of `reflection.q2_confidence` per card
- Streak: calculate from `logs` where `action_type: "session_start"`, update cache in `user_preferences.streak`

---

## Enhanced Log Action Types

Baseline kating hanya punya: `login`, `logout`, `card_movement`

PWA perlu:
```python
# Authentication
"login", "logout"

# Task Management
"task_created", "task_moved", "task_completed", "task_deleted", "task_archived"

# SRL Activities
"reflection_completed", "grade_added", "strategy_changed"

# Gamification
"badge_unlocked", "goal_set", "goal_checked"

# Session Tracking (DAU - Sub-RQ 1)
"session_start", "session_end"

# Onboarding
"onboarding_started", "onboarding_completed", "onboarding_skipped"

# Notifications
"notification_sent", "notification_clicked", "notification_dismissed"
```

---

## Implementation Phases

### Phase 1: Foundation (Auth + User + Board + Courses + Strategies + Sessions)
**Priority:** P0 — FE sudah butuh ini sekarang
**Scope:** Port dari kating dengan delta minimal

1. `app.py` + `config.py` — Flask setup, CORS, JWT, MongoDB init
2. `utils/db.py` + `utils/auth.py` + `utils/validators.py`
3. `models/` — user, board, course, learning_strat, study_session, log (port dari kating)
4. `routes/auth_routes.py` — register (+ create user_preferences), login (+ session_start log), refresh, logout
5. `routes/user_routes.py` — get me, update, delete
6. `routes/board_routes.py` — get board, update board, update card, get card detail
7. `routes/course_routes.py` — CRUD (port dari kating)
8. `routes/learningstrat_routes.py` — CRUD (port dari kating)
9. `routes/study_sessions.py` — start, end, get by card (port dari kating)

**Delta dari kating di Phase 1:**
- Register → also create `user_preferences` defaults
- Login → log `session_start`
- Board → enhanced card schema (reflection, personal_best, goal_check)
- Logs → extended action types
- NO chatbot logic

### Phase 2: New Features (Goals + Badges + Preferences + Notifications)
**Priority:** P1 — FE mulai butuh setelah Phase 1

1. `models/goal_model.py` + `routes/goal_routes.py`
2. `models/badge_model.py` + `routes/badge_routes.py` + `utils/badge_engine.py`
3. `models/user_preferences_model.py` + `routes/preferences_routes.py`
4. `models/notification_model.py` + `routes/notification_routes.py`

### Phase 3: Analytics + Smart Features
**Priority:** P1-P2

1. `routes/analytics_routes.py` — dashboard, progress, strategy effectiveness, confidence trend, streaks
2. Badge auto-unlock engine (triggered on task_complete, reflection, streak milestones)
3. Streak calculation + cache update (daily cron or on session_start)

---

## Key Differences from Reference Backend (kating)

| Aspect | Kating | PWA |
|---|---|---|
| Chatbot | Yes (n8n integration, context analysis, response generation) | **NO** — diganti Focus Mode + Guided Reflection |
| Card schema | Basic (title, description, difficulty, priority, grades) | Enhanced (+ reflection, personal_best, goal_check) |
| Collections | 6 (users, boards, courses, learning_strats, study_sessions, logs) | **10** (+ goals, badges, user_preferences, notifications) |
| Action types | login, logout, card_movement | **16 types** (task events, gamification, session tracking, etc.) |
| User preferences | None | Full (notifications, theme, onboarding, streak, FCM) |
| Push notifications | None | FCM integration (Phase 2-3) |
| Board lists | 4 (Planning, Monitoring, Controlling, Reflection) | Same 4 SRL pillars |
| Auth | JWT (headers + cookies) | JWT headers only (PWA/mobile) |

---

## Environment Variables

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET_KEY=<generate_new>
CORS_ORIGINS=http://localhost:3000
FLASK_DEBUG=True
PORT=5001

# Optional (Phase 2-3: Push Notifications)
# FCM_SERVER_KEY=
# FCM_SERVICE_ACCOUNT_JSON=
```

**Important:** Pakai MongoDB Atlas database BARU (bukan database kating). Fresh start sesuai schema v2.1.

---

## Reference Files

| File | Location |
|---|---|
| Database Schema (v2.1) | `D:/context_skripsi/technical/database-schema.md` |
| Fitur Lengkap (26 features) | `D:/context_skripsi/fitur-revisi.md` |
| Reference Backend (kating) | `D:/context_skripsi/workspace/gamatutor-id/backend/` |
| Reference app.py | `D:/context_skripsi/workspace/gamatutor-id/backend/app.py` |
| Reference models/ | `D:/context_skripsi/workspace/gamatutor-id/backend/models/` |
| Reference routes/ | `D:/context_skripsi/workspace/gamatutor-id/backend/routes/` |
| Reference controllers/ | `D:/context_skripsi/workspace/gamatutor-id/backend/controllers/` |
| Reference config | `D:/context_skripsi/workspace/gamatutor-id/backend/config.py` |
| Reference utils/ | `D:/context_skripsi/workspace/gamatutor-id/backend/utils/` |
| FE Memory | `D:/context_skripsi/workspace/pwa-gamatutor-id/memory.md` |
| Ledger | `D:/context_skripsi/thoughts/ledgers/CONTINUITY_CLAUDE-skripsi-fitur-analysis.md` |
