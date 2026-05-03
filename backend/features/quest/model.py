from shared.db import mongo
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ─── Quest type constants ──────────────────────────────────────

QUEST_TYPES = ["deep_study", "reflection_done", "checklist_use"]

REWARD_TYPES = ["freeze", "quest_item"]


# ─── Quest Template CRUD ───────────────────────────────────────

class QuestTemplate:
    collection = "quest_templates"

    @staticmethod
    def create(data):
        """Create a new quest template. Returns the inserted doc."""
        now = datetime.utcnow()

        # Validate no overlapping active quest
        start = data.get("start_date")
        end = data.get("end_date")
        if start and end:
            overlapping = mongo.db.quest_templates.find_one({
                "status": "active",
                "$or": [
                    {"start_date": {"$lte": end}, "end_date": {"$gte": start}},
                ],
                "_id": {"$ne": ObjectId(data["_id"])} if "_id" in data else {"$ne": None},
            })
            if overlapping:
                return None, "Quest overlap dengan quest aktif lainnya"

        doc = {
            "description": data.get("description", ""),
            "type": data.get("type"),
            "config": {
                "target_count": data.get("config", {}).get("target_count", 3),
                "min_duration_min": data.get("config", {}).get("min_duration_min", 25),
            },
            "reward": {
                "type": data.get("reward", {}).get("type", "freeze"),
                "value": data.get("reward", {}).get("value", 1),
                "item_slot": data.get("reward", {}).get("item_slot"),
                "item_level": data.get("reward", {}).get("item_level"),
            },
            "start_date": start,
            "end_date": end,
            "status": data.get("status", "active"),
            "created_at": now,
            "updated_at": now,
        }

        result = mongo.db.quest_templates.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc, None

    @staticmethod
    def update(template_id, data):
        """Update a quest template."""
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)

        updates = {}
        simple_fields = ["description", "type", "status", "start_date", "end_date"]
        for field in simple_fields:
            if field in data:
                updates[field] = data[field]

        if "config" in data:
            for k, v in data["config"].items():
                updates[f"config.{k}"] = v

        if "reward" in data:
            for k, v in data["reward"].items():
                updates[f"reward.{k}"] = v

        if not updates:
            return False

        updates["updated_at"] = datetime.utcnow()

        # Validate overlap if dates changed
        start = updates.get("start_date")
        end = updates.get("end_date")
        if start or end:
            current = mongo.db.quest_templates.find_one({"_id": template_id})
            if current:
                check_start = start or current.get("start_date")
                check_end = end or current.get("end_date")
                if check_start and check_end:
                    overlapping = mongo.db.quest_templates.find_one({
                        "status": "active",
                        "_id": {"$ne": template_id},
                        "$or": [
                            {"start_date": {"$lte": check_end}, "end_date": {"$gte": check_start}},
                        ],
                    })
                    if overlapping:
                        return None, "Quest overlap dengan quest aktif lainnya"

        result = mongo.db.quest_templates.update_one(
            {"_id": template_id},
            {"$set": updates},
        )
        return result.modified_count > 0, None

    @staticmethod
    def delete(template_id):
        """Delete a quest template."""
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)
        result = mongo.db.quest_templates.delete_one({"_id": template_id})
        return result.deleted_count > 0

    @staticmethod
    def list_all(status_filter=None):
        """List all templates, optionally filtered by status."""
        query = {}
        if status_filter:
            query["status"] = status_filter
        return list(
            mongo.db.quest_templates.find(query).sort("start_date", -1)
        )

    @staticmethod
    def find_by_id(template_id):
        """Find template by ID."""
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)
        return mongo.db.quest_templates.find_one({"_id": template_id})

    @staticmethod
    def get_active():
        """Get the currently active quest template (at most 1)."""
        now = datetime.utcnow()
        return mongo.db.quest_templates.find_one({
            "status": "active",
            "start_date": {"$lte": now},
            "end_date": {"$gte": now},
        })


# ─── Quest Progress (re-query, on-the-fly) ─────────────────────

class QuestProgress:
    """Calculate quest progress by re-querying source data."""

    @staticmethod
    def get_progress(user_id, template):
        """Return current progress count for a quest template."""
        quest_type = template["type"]
        config = template.get("config", {})
        start_date = template.get("start_date")
        end_date = template.get("end_date")
        now = datetime.utcnow()

        if not start_date:
            return 0

        if quest_type == "deep_study":
            return QuestProgress._count_deep_study(
                user_id, start_date, now, config
            )
        elif quest_type == "reflection_done":
            return QuestProgress._count_reflection_done(
                user_id, start_date, now
            )
        elif quest_type == "checklist_use":
            return QuestProgress._count_checklist_use(
                user_id, start_date, now
            )
        return 0

    @staticmethod
    def _count_deep_study(user_id, start_date, now, config):
        """Count study sessions with duration >= min_duration_min in date range."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        min_duration_ms = config.get("min_duration_min", 25) * 60 * 1000

        # Use aggregation to compute net duration per session
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "start_time": {"$gte": start_date, "$lte": now},
                    "end_time": {"$ne": None},
                    "orphan": {"$ne": True},
                }
            },
            {
                "$project": {
                    "net_duration_ms": {
                        "$max": [
                            0,
                            {
                                "$subtract": [
                                    {"$subtract": ["$end_time", "$start_time"]},
                                    {"$ifNull": ["$hidden_ms", 0]},
                                ]
                            },
                        ]
                    },
                }
            },
            {
                "$match": {
                    "net_duration_ms": {"$gte": min_duration_ms}
                }
            },
            {"$count": "total"},
        ]
        result = list(mongo.db.study_sessions.aggregate(pipeline))
        return result[0]["total"] if result else 0

    @staticmethod
    def _count_reflection_done(user_id, start_date, now):
        """Count cards where reflection was submitted in date range."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        # A card has reflection if reflection field exists and is non-empty
        # We check cards updated in the quest period that have reflection content
        return mongo.db.cards.count_documents({
            "user_id": user_id,
            "updated_at": {"$gte": start_date, "$lte": now},
            "reflection": {"$exists": True, "$ne": None},
            "reflection.q1_strategy": {"$exists": True},
        })

    @staticmethod
    def _count_checklist_use(user_id, start_date, now):
        """Count cards that have non-empty checklists, updated in date range."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        return mongo.db.cards.count_documents({
            "user_id": user_id,
            "updated_at": {"$gte": start_date, "$lte": now},
            "checklists": {"$exists": True, "$ne": []},
        })


# ─── Quest Completions ─────────────────────────────────────────

class QuestCompletion:
    collection = "quest_completions"

    @staticmethod
    def get_status(user_id, template_id):
        """Get completion status for a user + template. Returns doc or None."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)

        return mongo.db.quest_completions.find_one({
            "user_id": user_id,
            "template_id": template_id,
        })

    @staticmethod
    def mark_completed(user_id, template_id):
        """Mark a quest as completed for user."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)

        now = datetime.utcnow()
        doc = {
            "user_id": user_id,
            "template_id": template_id,
            "status": "completed",
            "completed_at": now,
            "reward_applied": False,
        }
        # Upsert — only one completion per user per template
        mongo.db.quest_completions.update_one(
            {"user_id": user_id, "template_id": template_id},
            {"$setOnInsert": doc},
            upsert=True,
        )
        return doc

    @staticmethod
    def apply_reward(user_id, template):
        """Apply quest reward to user. Returns (success, message)."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        reward = template.get("reward", {})
        reward_type = reward.get("type", "freeze")

        if reward_type == "freeze":
            value = reward.get("value", 1)
            # Add to quest_freezes balance in preferences
            mongo.db.user_preferences.update_one(
                {"user_id": user_id},
                {"$inc": {"quest_freezes": value}},
                upsert=True,
            )
            return True, f"Quest freeze +{value} berhasil ditambahkan"

        elif reward_type == "quest_item":
            item_slot = reward.get("item_slot")
            item_level = reward.get("item_level")
            if not item_slot or not item_level:
                return False, "Item reward tidak valid"

            # Add to quest_unlocked_items array
            item_key = f"{item_slot}:{item_level}"
            mongo.db.user_preferences.update_one(
                {"user_id": user_id},
                {"$addToSet": {"quest_unlocked_items": item_key}},
                upsert=True,
            )
            return True, f"Item {item_slot} {item_level} berhasil di-unlock"

        return False, "Unknown reward type"

    @staticmethod
    def mark_reward_applied(user_id, template_id):
        """Mark that reward has been applied."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(template_id, str):
            template_id = ObjectId(template_id)

        mongo.db.quest_completions.update_one(
            {"user_id": user_id, "template_id": template_id},
            {"$set": {"reward_applied": True}},
        )

    @staticmethod
    def mark_expired(user_id, template_id):
        """Mark a quest as expired for user (optional — we just don't record anything)."""
        # We don't need to record expired quests — absence in completions = not completed
        pass

    @staticmethod
    def get_user_history(user_id, limit=20):
        """Get user's completed quests."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(
            mongo.db.quest_completions.find({"user_id": user_id})
            .sort("completed_at", -1)
            .limit(limit)
        )


# ─── Quest Orchestration ───────────────────────────────────────

class QuestEngine:
    """Main engine: check progress, auto-complete, apply rewards."""

    @staticmethod
    def check_and_complete(user_id, event_type=None):
        """
        Check if active quest should be completed.
        Called from event triggers (session end, reflection submit, etc).
        Returns completion info or None.
        """
        template = QuestTemplate.get_active()
        if not template:
            return None

        # Already completed?
        completion = QuestCompletion.get_status(user_id, template["_id"])
        if completion and completion.get("status") == "completed":
            return None

        # Calculate progress
        progress = QuestProgress.get_progress(user_id, template)
        target = template.get("config", {}).get("target_count", 1)

        if progress >= target:
            # Complete!
            QuestCompletion.mark_completed(user_id, template["_id"])
            success, msg = QuestCompletion.apply_reward(user_id, template)
            if success:
                QuestCompletion.mark_reward_applied(user_id, template["_id"])

            logger.info(
                f"[QuestEngine] user={user_id} completed quest={template['_id']} "
                f"type={template['type']} reward={template.get('reward', {}).get('type')}"
            )
            return {
                "template_id": str(template["_id"]),
                "description": template.get("description", ""),
                "type": template["type"],
                "reward": template.get("reward", {}),
                "message": msg,
            }

        return None

    @staticmethod
    def get_active_quest_for_user(user_id):
        """
        Get the current active quest with progress for a user.
        Returns dict with quest info + progress, or None.
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)

        template = QuestTemplate.get_active()
        if not template:
            return None

        # Check if already completed
        completion = QuestCompletion.get_status(user_id, template["_id"])
        if completion and completion.get("status") == "completed":
            return {
                "template_id": str(template["_id"]),
                "description": template.get("description", ""),
                "type": template["type"],
                "config": template.get("config", {}),
                "reward": template.get("reward", {}),
                "start_date": template.get("start_date").isoformat() if template.get("start_date") else None,
                "end_date": template.get("end_date").isoformat() if template.get("end_date") else None,
                "progress": 0,
                "target": template.get("config", {}).get("target_count", 1),
                "status": "completed",
                "completed_at": completion.get("completed_at").isoformat() if completion.get("completed_at") else None,
            }

        # Calculate progress
        progress = QuestProgress.get_progress(user_id, template)
        target = template.get("config", {}).get("target_count", 1)

        # Check if expired
        now = datetime.utcnow()
        end_date = template.get("end_date")
        status = "active"
        if end_date and now > end_date:
            status = "expired"

        return {
            "template_id": str(template["_id"]),
            "description": template.get("description", ""),
            "type": template["type"],
            "config": template.get("config", {}),
            "reward": template.get("reward", {}),
            "start_date": template.get("start_date").isoformat() if template.get("start_date") else None,
            "end_date": template.get("end_date").isoformat() if template.get("end_date") else None,
            "progress": progress,
            "target": target,
            "status": status,
        }

    @staticmethod
    def expire_overdue_quests():
        """
        Mark quests past their end_date as expired.
        For our model, we don't need to do anything special — 
        the status is determined by comparing now vs end_date on read.
        This exists for cleanup if needed later.
        """
        now = datetime.utcnow()
        # Could log stats here
        expired_count = mongo.db.quest_templates.count_documents({
            "status": "active",
            "end_date": {"$lt": now},
        })
        if expired_count > 0:
            logger.info(f"[QuestEngine] {expired_count} quest templates have passed their end_date")
        return expired_count

    @staticmethod
    def get_stats():
        """Get aggregate quest completion stats."""
        total_templates = mongo.db.quest_templates.count_documents({})
        active_templates = mongo.db.quest_templates.count_documents({"status": "active"})
        total_completions = mongo.db.quest_completions.count_documents({"status": "completed"})

        # Completions per template
        pipeline = [
            {"$group": {"_id": "$template_id", "count": {"$sum": 1}}},
        ]
        by_template = list(mongo.db.quest_completions.aggregate(pipeline))

        return {
            "total_templates": total_templates,
            "active_templates": active_templates,
            "total_completions": total_completions,
            "by_template": {str(item["_id"]): item["count"] for item in by_template},
        }
