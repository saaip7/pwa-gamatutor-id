# Database Schema Design: MongoDB Collections

**Project:** Kanban Learning Board Enhancement dengan SDT Framework
**Version:** 2.1 (Fresh Database - 26 Features, Schema Review Applied)
**Database:** MongoDB (NoSQL)
**Date:** February 2026

---

## Overview

Dokumen ini mendefinisikan schema database untuk enhanced Kanban Learning Board. Schema dirancang untuk mendukung **26 features** dengan prinsip:

- **Fresh database** (tidak ada data migration dari kakak tingkat)
- **Baseline-inspired** (mengadopsi struktur yang sudah proven dari kakak tingkat)
- **MongoDB best practices** (embed vs reference strategy)
- **Research-ready** (track all metrics untuk Sub-RQ 1, 2, 3)

---

## Schema Summary

| Collection | Status | Purpose | Features Supported |
|------------|--------|---------|-------------------|
| `users` | Baseline | Authentication & user management | Auth, role management |
| `boards` | Enhanced | Kanban board dengan embedded cards | Baseline + #4, #14, #17, #21 |
| `courses` | Baseline | Admin-managed course list | Autocomplete #3 |
| `learning_strats` | Baseline | Admin-managed learning strategies | Autocomplete, analytics |
| `study_sessions` | Baseline | Timer tracking untuk tasks | Timer + #14, #16 |
| `logs` | Enhanced | Activity logging & analytics | Analytics + #16, #19, Sub-RQ1 |
| `goals` | **NEW** | Goal Hierarchy System (3-level) | #2, #21 |
| `badges` | **NEW** | Milestone badges (gamification) | #12 |
| `user_preferences` | **NEW** | Notification & theme preferences | #1, #9, #20 |
| `notifications` | **NEW** | Push notification tracking | #7, #8, #13, #15 |

**Total:** 10 collections (6 baseline-inspired, 4 new)

---

## 1. Collection: `users`

**Purpose:** Authentication & user management

**Schema:**
```javascript
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  email: String,              // Unique
  username: String,           // Unique
  password: String,           // Hashed (bcrypt)
  role: String,               // "user" | "admin"
  created_at: Date,

  // Password reset (optional)
  reset_token: String,
  reset_token_expiry: Date
}
```

**Indexes:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
```

**Notes:** Standard authentication schema, proven structure dari kakak tingkat.

---

## 2. Collection: `boards`

**Purpose:** Kanban board dengan embedded cards (nested structure)

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users
  name: String,               // e.g., "<username>'s Board"
  lists: [
    {
      id: String,
      title: String,          // "Planning (To Do)", "Monitoring (In Progress)", etc.
      cards: [
        {
          id: String,
          title: String,
          sub_title: String,
          description: String,
          course_name: String,    // NEW: Explicit course field (for querying & goal matching)
          difficulty: "easy" | "medium" | "hard" | "expert",
          priority: "low" | "medium" | "high" | "critical",
          learning_strategy: String,
          archived: Boolean,
          deleted: Boolean,

          // Checklists (sub-tasks)
          checklists: [
            {
              id: String,
              title: String,
              items: [
                { id: String, text: String, completed: Boolean }
              ]
            }
          ],

          // Links (resources)
          links: [
            { id: String, url: String }
          ],

          // Baseline assessment
          satisfaction_rating: Number,  // RENAMED: was 'rating' - overall task satisfaction (1-5)
          notes: String,                // Free-form reflection notes
          pre_test_grade: String,
          post_test_grade: String,
          created_at: Date,             // FIX: was String, now Date

          // Column movement tracking
          column_movements: [
            { fromColumn: String, toColumn: String, timestamp: Date }  // FIX: was String, now Date
          ],

          // ========== ENHANCED FIELDS ==========

          // Feature #4: Guided Reflection
          reflection: {
            q1_strategy: String,        // "Seberapa efektif strategi ini?" (text)
            q2_confidence: Number,      // 1-5 emoji rating
            q3_what_learned: String,    // Optional deep reflection
            q4_value: String,           // Optional OIT value connection
            completed_at: Date
          },

          // Feature #14: Personal Best Tracking
          personal_best: {
            best_time: Number,          // Shortest study time (minutes)
            best_grade: Number,         // Highest grade achieved
            achieved_at: Date
          },

          // Feature #21: Goal Completion Check
          goal_check: {
            rating: Number,             // "Apakah task ini membantu tujuanmu?" (1-5)
            timestamp: Date
          }
        }
      ]
    }
  ]
}
```

**Why Embed Cards:**
- Cards tightly coupled dengan board (tidak exist independently)
- Typical user has ~20-100 cards (bounded size, tidak ribuan)
- Read pattern: Load entire board at once (no N+1 query problem)

**Indexes:**
```javascript
db.boards.createIndex({ "user_id": 1 })
db.boards.createIndex({ "lists.cards.id": 1 })  // For quick card lookup
```

**Enhanced Fields:**
- `course_name`: Explicit course field for querying and goal matching (NEW)
- `satisfaction_rating`: Overall task satisfaction 1-5 (RENAMED from `rating`)
- `created_at`, `column_movements.timestamp`: Now `Date` type (FIX from `String`)
- `reflection`: Guided reflection data (Q1-Q4)
- `personal_best`: Best performance metrics
- `goal_check`: Goal alignment feedback

---

## 3. Collection: `courses`

**Purpose:** Admin-managed course list (untuk autocomplete Feature #3)

**Schema:**
```javascript
{
  _id: ObjectId,
  course_code: String,        // e.g., "CS101"
  course_name: String,        // e.g., "Struktur Data"
  created_at: Date
}
```

**Indexes:**
```javascript
db.courses.createIndex({ "course_code": 1 }, { unique: true })
```

**Usage:** Autocomplete suggestions saat user input course name di card creation.

---

## 4. Collection: `learning_strats`

**Purpose:** Admin-managed learning strategies list

**Schema:**
```javascript
{
  _id: ObjectId,
  learning_strat_name: String,  // e.g., "Pomodoro Technique"
  description: String,
  created_at: Date
}
```

**Indexes:**
```javascript
db.learning_strats.createIndex({ "learning_strat_name": 1 })
```

**Usage:** Autocomplete suggestions untuk learning strategy dropdown + analytics.

---

## 5. Collection: `study_sessions`

**Purpose:** Timer tracking untuk task study sessions

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users (FIX: was String, now ObjectId for consistency)
  card_id: String,            // Ref: boards.lists.cards.id
  start_time: Date,
  end_time: Date              // Nullable (jika session masih running)
}
```

**Indexes:**
```javascript
db.study_sessions.createIndex({ "card_id": 1 })
db.study_sessions.createIndex({ "user_id": 1, "start_time": -1 })
```

**Usage:**
- Feature #14 (Personal Best Tracking) - calculate shortest study time
- Feature #16 (Pattern Detection) - analyze study time patterns per difficulty

---

## 6. Collection: `logs`

**Purpose:** Activity logging & analytics (untuk research Sub-RQ 1)

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users
  username: String,
  action_type: String,        // See action types below
  description: String,
  metadata: Object,           // Flexible additional data
  created_at: Date
}
```

**Action Types:**
```javascript
// Authentication
"login", "logout"

// Task Management
"task_created", "task_moved", "task_completed", "task_deleted", "task_archived"

// SRL Activities
"reflection_completed", "grade_added", "strategy_changed"

// Gamification
"badge_unlocked", "goal_set", "goal_checked"

// Session Tracking (for DAU, engagement metrics - Sub-RQ 1)
"session_start", "session_end"

// Onboarding
"onboarding_started", "onboarding_completed", "onboarding_skipped"

// Notifications
"notification_sent", "notification_clicked", "notification_dismissed"
```

**Example Log Documents:**
```javascript
// Task completed
{
  user_id: ObjectId("..."),
  username: "john_doe",
  action_type: "task_completed",
  description: "Task 'Binary Search Implementation' completed",
  metadata: {
    card_id: "card_456",
    difficulty: "medium",
    time_spent: 45,              // minutes
    confidence_rating: 4,         // from reflection
    column: "Reflection (Done)"
  },
  created_at: ISODate("2026-03-15T10:30:00Z")
}

// Badge unlocked
{
  user_id: ObjectId("..."),
  username: "john_doe",
  action_type: "badge_unlocked",
  description: "Badge unlocked: First Task Completed",
  metadata: {
    badge_id: ObjectId("..."),
    badge_type: "first_task_completed"
  },
  created_at: ISODate("2026-03-15T10:31:00Z")
}

// Session tracking (DAU)
{
  user_id: ObjectId("..."),
  username: "john_doe",
  action_type: "session_start",
  description: "User started session",
  metadata: {
    device: "mobile",
    browser: "Chrome"
  },
  created_at: ISODate("2026-03-15T08:00:00Z")
}
```

**Indexes:**
```javascript
db.logs.createIndex({ "user_id": 1, "created_at": -1 })
db.logs.createIndex({ "action_type": 1, "created_at": -1 })
db.logs.createIndex({ "created_at": -1 })  // For time-based analytics
```

**Usage:**
- **Sub-RQ 1:** Calculate DAU (distinct users with session_start per day)
- **Feature #16:** Pattern detection (analyze activity patterns)
- **Feature #19:** Streaks calculation (consecutive days with session_start)
- **Research Analytics:** Response rate, feature usage, engagement metrics

---

## 7. Collection: `goals` 🆕 NEW

**Purpose:** Goal Hierarchy System (Feature #2) - 3-level structure

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users
  type: String,               // "general" | "course" | "task"
  content: String,            // Goal description
  parent_id: ObjectId,        // Nullable, ref to parent goal (for hierarchy)
  course_name: String,        // Nullable, if type = "course"
  task_id: String,            // Nullable, if type = "task", ref to cards.id
  created_at: Date,
  updated_at: Date
}
```

**Goal Hierarchy (3 Levels):**

**Level 1 - General Goal:**
- Set once during onboarding
- Broad life/academic goal
- Example: "Lulus cumlaude dengan IPK 3.8"
- `type: "general"`, `parent_id: null`

**Level 2 - Course Goal:**
- Set per course (first task creation per course)
- Specific to course context
- Example: "Jago interview untuk jadi software engineer" (Struktur Data)
- `type: "course"`, `parent_id: <general_goal_id>`

**Level 3 - Task Goal (Optional):**
- Optional override per task
- Falls back to course goal if not set
- Example: "Biar paham graph implementation untuk interview"
- `type: "task"`, `parent_id: <course_goal_id>`, `task_id: "card_123"`

**Example Documents:**
```javascript
// General Goal
{
  _id: ObjectId("goal_general_1"),
  user_id: ObjectId("user_123"),
  type: "general",
  content: "Lulus cumlaude dengan IPK 3.8",
  parent_id: null,
  course_name: null,
  task_id: null,
  created_at: ISODate("2026-03-01T08:00:00Z"),
  updated_at: ISODate("2026-03-01T08:00:00Z")
}

// Course Goal
{
  _id: ObjectId("goal_course_1"),
  user_id: ObjectId("user_123"),
  type: "course",
  content: "Jago interview untuk jadi software engineer",
  parent_id: ObjectId("goal_general_1"),
  course_name: "Struktur Data",
  task_id: null,
  created_at: ISODate("2026-03-05T09:30:00Z"),
  updated_at: ISODate("2026-03-05T09:30:00Z")
}

// Task Goal (Optional Override)
{
  _id: ObjectId("goal_task_1"),
  user_id: ObjectId("user_123"),
  type: "task",
  content: "Biar paham graph implementation untuk interview",
  parent_id: ObjectId("goal_course_1"),
  course_name: null,
  task_id: "card_456",
  created_at: ISODate("2026-03-10T14:00:00Z"),
  updated_at: ISODate("2026-03-10T14:00:00Z")
}
```

**Indexes:**
```javascript
db.goals.createIndex({ "user_id": 1, "type": 1 })
db.goals.createIndex({ "task_id": 1 })  // For task goal lookup
db.goals.createIndex({ "user_id": 1, "course_name": 1 })  // For course goal lookup
```

**Query Patterns:**
```javascript
// Get general goal
db.goals.findOne({ user_id: ObjectId("..."), type: "general" })

// Get course goal
db.goals.findOne({
  user_id: ObjectId("..."),
  type: "course",
  course_name: "Struktur Data"
})

// Get task goal with fallback logic
const taskGoal = db.goals.findOne({ task_id: "card_456" })
if (!taskGoal) {
  // Fallback to course goal
  const courseGoal = db.goals.findOne({
    user_id: ObjectId("..."),
    type: "course",
    course_name: "<course_from_task>"
  })
}
```

**Why NEW Collection:**
- Goals have independent lifecycle (exist before/after tasks)
- Hierarchical relationship easier to model as separate documents
- ~1 general + ~5-10 course + optional task goals per user
- OIT Feature (#2) core functionality dengan 90% friction reduction

---

## 8. Collection: `badges` 🆕 NEW

**Purpose:** Milestone badges (Feature #12 - Meaningful Gamification)

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users
  badge_type: String,         // Unique identifier
  title: String,
  description: String,
  icon: String,               // Emoji or SVG identifier
  unlocked_at: Date,
  displayed: Boolean          // Celebration sudah ditampilkan?
}
```

**Badge Types:**
```javascript
// Achievement Milestones
"first_task_completed"        // Complete first task
"tasks_10"                    // Complete 10 tasks
"tasks_25"                    // Complete 25 tasks
"tasks_50"                    // Complete 50 tasks

// Streak Milestones
"streak_3_days"               // 3 consecutive days active
"streak_7_days"               // 7 consecutive days (1 week)
"streak_14_days"              // 14 consecutive days (2 weeks)

// Improvement Milestones
"improvement_first"           // First grade improvement
"improvement_5x"              // 5 tasks with grade improvement
"improvement_master"          // 10 tasks with significant improvement (>20%)

// Reflection Milestones
"reflection_champion"         // Complete reflection 20 times
"reflection_master"           // Complete reflection 50 times

// SRL Milestones
"strategy_explorer"           // Try 5 different learning strategies
"time_tracker"                // Use timer for 20 tasks
```

**Example Document:**
```javascript
{
  _id: ObjectId("badge_123"),
  user_id: ObjectId("user_456"),
  badge_type: "first_task_completed",
  title: "🎉 First Steps",
  description: "You completed your first task! Keep up the momentum!",
  icon: "🎉",
  unlocked_at: ISODate("2026-03-15T10:30:00Z"),
  displayed: true
}
```

**Indexes:**
```javascript
db.badges.createIndex({ "user_id": 1 })
db.badges.createIndex({ "user_id": 1, "badge_type": 1 }, { unique: true })  // Prevent duplicates
db.badges.createIndex({ "unlocked_at": -1 })  // For recent badges query
```

**Why NEW Collection:**
- Badges are independent entities (not tied to specific task)
- Historical record (never deleted, permanent achievement)
- User can have many badges (10-50+)
- Prevents duplicate unlocks via unique index

---

## 9. Collection: `user_preferences` 🆕 NEW

**Purpose:** User preferences (notifications, theme, onboarding state)

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users (unique)

  // Feature #9: Notification Preferences
  notifications: {
    push_enabled: Boolean,
    smart_reminder_enabled: Boolean,
    reminder_time: String,          // "09:00", "14:00", "20:00"
    quiet_hours: {
      enabled: Boolean,
      start: String,                // "22:00"
      end: String                   // "07:00"
    },
    social_presence_enabled: Boolean
  },

  // Feature #20: Theme Customization
  theme: {
    mode: String,                   // "light" | "dark" | "auto"
    color_scheme: String,           // "purple" | "blue" | "green" | "pink" | "custom"
    custom_colors: {
      primary: String,              // Hex color (e.g., "#8B5CF6")
      secondary: String             // Hex color
    }
  },

  // Feature #1: Scaffolding & Onboarding
  onboarding: {
    completed: Boolean,
    current_step: Number,           // 0-based index
    skipped_tour: Boolean,
    completed_at: Date
  },

  // Firebase Cloud Messaging
  fcm_token: String,                // For push notifications (single source of truth)

  // Feature #19: Streak Cache (SHOULD FIX - performance optimization)
  streak: {
    current: Number,                // Current consecutive days active
    longest: Number,                // Best streak ever achieved
    last_active_date: Date,         // Last day user had session_start
    updated_at: Date                // When streak was last calculated
  },

  created_at: Date,
  updated_at: Date
}
```

**Default Values (for new users):**
```javascript
{
  notifications: {
    push_enabled: true,
    smart_reminder_enabled: true,
    reminder_time: "09:00",
    quiet_hours: {
      enabled: false,
      start: "22:00",
      end: "07:00"
    },
    social_presence_enabled: false
  },
  theme: {
    mode: "auto",
    color_scheme: "purple",
    custom_colors: {
      primary: "#8B5CF6",
      secondary: "#EC4899"
    }
  },
  onboarding: {
    completed: false,
    current_step: 0,
    skipped_tour: false,
    completed_at: null
  },
  fcm_token: null,
  streak: {
    current: 0,
    longest: 0,
    last_active_date: null,
    updated_at: null
  }
}
```

**Indexes:**
```javascript
db.user_preferences.createIndex({ "user_id": 1 }, { unique: true })
```

**Why NEW Collection:**
- 1-to-1 relationship with user (separate lifecycle)
- Frequently read (every page load), infrequently written
- Cleaner separation (users = auth, preferences = UX settings)

---

## 10. Collection: `notifications` 🆕 NEW

**Purpose:** Push notification tracking & smart reminder scheduling

**Schema:**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Ref: users
  type: String,               // "push" | "smart_reminder" | "social_presence" | "encouragement"
  title: String,
  message: String,

  // For push notifications (Feature #7)
  // NOTE: fcm_token removed - get from user_preferences.fcm_token to avoid redundancy
  sent_at: Date,              // Nullable, when notification was sent
  delivered: Boolean,         // Delivery status
  delivery_error: String,     // Nullable, error if failed

  // For smart reminders (Feature #8)
  scheduled_for: Date,        // Nullable, when to send reminder
  reminder_reason: String,    // "inactive_3_days", "stuck_in_monitoring", etc.

  // For social presence (Feature #13)
  trigger_action: String,     // Nullable, e.g., "user_completed_task"
  trigger_user_id: ObjectId,  // Nullable, for social presence

  // User interaction
  read: Boolean,
  read_at: Date,              // Nullable
  clicked: Boolean,
  clicked_at: Date,           // Nullable

  created_at: Date
}
```

**Notification Types & Examples:**

**1. Push Notification (Feature #7):**
```javascript
{
  user_id: ObjectId("user_123"),
  type: "push",
  title: "🎯 Time to Review!",
  message: "You have 3 tasks in the Monitoring column waiting for review.",
  // fcm_token fetched from user_preferences at send time
  sent_at: ISODate("2026-03-15T09:00:00Z"),
  delivered: true,
  read: false,
  clicked: false,
  created_at: ISODate("2026-03-15T09:00:00Z")
}
```

**2. Smart Reminder (Feature #8):**
```javascript
{
  user_id: ObjectId("user_123"),
  type: "smart_reminder",
  title: "🔔 Haven't seen you in a while!",
  message: "You've been inactive for 3 days. How about checking your board?",
  scheduled_for: ISODate("2026-03-18T09:00:00Z"),
  reminder_reason: "inactive_3_days",
  sent_at: null,  // Not sent yet
  read: false,
  created_at: ISODate("2026-03-15T18:00:00Z")
}
```

**3. Social Presence Notification (Feature #13):**
```javascript
{
  user_id: ObjectId("user_123"),
  type: "social_presence",
  title: "👥 Someone else is studying too!",
  message: "3 other students are actively working on their tasks right now.",
  trigger_action: "aggregate_active_users",
  sent_at: ISODate("2026-03-15T14:30:00Z"),
  delivered: true,
  read: true,
  read_at: ISODate("2026-03-15T14:35:00Z"),
  created_at: ISODate("2026-03-15T14:30:00Z")
}
```

**4. Encouragement Message (Feature #15):**
```javascript
{
  user_id: ObjectId("user_123"),
  type: "encouragement",
  title: "💪 Keep going!",
  message: "You've completed 5 tasks this week. You're doing great!",
  sent_at: ISODate("2026-03-15T16:00:00Z"),
  delivered: true,
  read: false,
  created_at: ISODate("2026-03-15T16:00:00Z")
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ "user_id": 1, "created_at": -1 })
db.notifications.createIndex({ "user_id": 1, "read": 1 })
db.notifications.createIndex({ "scheduled_for": 1 })  // For cron job processing
db.notifications.createIndex({ "type": 1, "sent_at": -1 })
```

**Why NEW Collection:**
- Notification history tracking (untuk analytics)
- Scheduled reminders need persistence
- Track delivery status (research engagement metrics)
- User can view notification history

---

## Schema Relationships (ERD Summary)

**Core Relationships:**

```
users (1) ──────< boards (many)
users (1) ──────< goals (many)
users (1) ──────< badges (many)
users (1) ──────── user_preferences (1)
users (1) ──────< notifications (many)
users (1) ──────< study_sessions (many)
users (1) ──────< logs (many)

boards.lists.cards (embedded) ──── study_sessions (via card_id)
boards.lists.cards (embedded) ──── goals (via task_id, course_name)

courses (reference only) ── boards.lists.cards.course_name
learning_strats (reference only) ── boards.lists.cards.learning_strategy
```

**MongoDB Design Patterns Used:**

| Pattern | Collections | Rationale |
|---------|-------------|-----------|
| **Embed** | `boards` → `lists` → `cards` | 1-to-few, always loaded together, bounded size |
| **Reference** | `users` → `goals`, `badges`, `notifications` | 1-to-many, independent queries, unbounded growth |
| **Hybrid** | `cards` ← `study_sessions`, `goals` | Cards embedded but referenced via card_id |
| **Denormalize** | `courses`, `learning_strats` names stored in cards | Read-heavy, rarely change, avoid joins |

---

## Feature-to-Schema Mapping

Mapping of all 26 features to database schema:

| Feature | Primary Collection(s) | Schema Fields | Type |
|---------|---------------------|---------------|------|
| **#1: Scaffolding & Onboarding** | `user_preferences` | `onboarding.*` | State storage |
| **#2: Goal Hierarchy System** | `goals` | All fields | Full support |
| **#3: Course Free Input** | `courses` | All fields | Reference |
| **#4: Guided Reflection** | `boards.cards` | `reflection.*` | Enhanced |
| **#5: Improvement Visualization** | `boards.cards` | `pre_test_grade`, `post_test_grade` | Aggregate |
| **#6: Strategy Dashboard** | `boards.cards` | `reflection.q1_strategy`, grades | Aggregate |
| **#7: Push Notification** | `notifications`, `user_preferences` | `type: "push"`, `fcm_token` | Full support |
| **#8: Smart Reminder** | `notifications` | `type: "smart_reminder"` | Full support |
| **#9: Notification Preferences** | `user_preferences` | `notifications.*` | Full support |
| **#10: Progress Bar** | `boards.lists.cards` | Count logic | Derived |
| **#11: Celebration** | Event trigger | `column_movements` | Event-based |
| **#12: Badges** | `badges` | All fields | Full support |
| **#13: Social Presence** | `notifications` | `type: "social_presence"` | Full support |
| **#14: Personal Best** | `boards.cards`, `study_sessions` | `personal_best.*` | Enhanced |
| **#15: Encouragement** | `notifications` | `type: "encouragement"` | Full support |
| **#16: Pattern Detection** | `logs`, `study_sessions`, `cards` | Aggregate analysis | Derived |
| **#17: Confidence Trend** | `boards.cards` | `reflection.q2_confidence` | Aggregate |
| **#18: Feedback Animation** | `boards.cards.checklists` | `items[].completed` | UI trigger |
| **#19: Streaks** | `user_preferences`, `logs` | `streak.*` (cache) + `session_start` (source) | Cached + Derived |
| **#20: Theme** | `user_preferences` | `theme.*` | Full support |
| **#21: Goal Check** | `boards.cards` | `goal_check.*` | Enhanced |
| **#22: Swipe Navigation** | - | UI-only | None |
| **#23: Autocomplete** | `courses`, `learning_strats` | Existing data | Reference |
| **#24-26: Integrated** | Various | Existing fields | Logic |

**Legend:**
- **Full support:** Dedicated schema fields
- **Enhanced:** New fields added to baseline structure
- **Aggregate:** Calculated from existing data
- **Derived:** Computed from logs/analytics
- **Event-based:** Triggered by state changes
- **UI-only:** No backend storage needed

---

## Storage Estimates (per user)

| Collection | Docs per User | Avg Size | Total per User |
|------------|---------------|----------|----------------|
| `users` | 1 | 500 bytes | 500 bytes |
| `boards` | 1 | 50 KB | 50 KB |
| `goals` | ~10 | 300 bytes | 3 KB |
| `badges` | ~20 | 200 bytes | 4 KB |
| `user_preferences` | 1 | 1 KB | 1 KB |
| `notifications` | ~100 | 500 bytes | 50 KB |
| `study_sessions` | ~50 | 150 bytes | 7.5 KB |
| `logs` | ~500 | 300 bytes | 150 KB |
| **TOTAL** | | | **~266 KB/user** |

**For 60 users (research sample):** ~16 MB total
**MongoDB Atlas Free Tier:** 512 MB → Adequate ✅

---

## Summary

**Schema Design Philosophy:**
- ✅ **Baseline-Inspired:** Mengadopsi proven structure dari kakak tingkat
- ✅ **Fresh Start:** No migration complexity, clean database
- ✅ **MongoDB Best Practices:** Proper embed vs reference strategy
- ✅ **Research-Ready:** All metrics trackable for Sub-RQ 1, 2, 3
- ✅ **Scalable:** Supports 60+ research participants + future growth
- ✅ **Maintainable:** Clear separation of concerns, indexed for performance

**Next Steps:**
1. ✅ Define API endpoints untuk each collection
2. ✅ Create TypeScript types (Frontend)
3. ✅ Implement Flask models (Backend)
4. ✅ Write seed data untuk testing

---

## Changelog

### Version 2.1 (February 14, 2026) - Schema Review Applied

**MUST FIX (Critical Issues):**
1. ✅ `study_sessions.user_id`: Changed `String` → `ObjectId` for type consistency
2. ✅ `cards.created_at`: Changed `String` → `Date` for proper date operations
3. ✅ `cards.column_movements[].timestamp`: Changed `String` → `Date`
4. ✅ `notifications.fcm_token`: Removed (redundant with `user_preferences.fcm_token`)
5. ✅ `cards.course_name`: Added explicit field for querying & goal matching

**SHOULD FIX (Improvements):**
6. ✅ `cards.rating`: Renamed to `satisfaction_rating` for clarity
7. ✅ `user_preferences.streak`: Added cache object for performance optimization

**Rationale:**
- Type consistency prevents join/lookup failures
- Date types enable proper MongoDB date queries ($gte, $lte, aggregation)
- Removed fcm_token redundancy avoids out-of-sync data
- Explicit course_name enables efficient queries & index usage
- Streak cache improves performance (O(1) vs O(n) log scanning)
- Clear field naming reduces confusion

---

*Last Updated: February 14, 2026*
*Version: 2.1 - Schema Review Applied*
