"""One-time backfill: Award explorer badge to legacy users who already have 4+ unique learning strategies.

Usage:
    python scripts/backfill_explorer_badge.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/gamatutor")


def main():
    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]

    users_with_explorer = db.badges.distinct("user_id", {"badge_type": "explorer"})
    all_users = db.users.find({}, {"_id": 1})

    backfilled = 0
    skipped = 0

    for user in all_users:
        uid = user["_id"]
        if uid in users_with_explorer:
            skipped += 1
            continue

        strategies = db.cards.distinct("learning_strategy", {
            "user_id": uid,
            "learning_strategy": {"$exists": True, "$ne": None},
        })

        if len(strategies) >= 4:
            db.badges.insert_one({
                "user_id": uid,
                "badge_type": "explorer",
                "unlocked_at": datetime.utcnow(),
            })
            backfilled += 1
            print(f"  [+ {backfilled}] {uid} — {len(strategies)} strategies")
        else:
            skipped += 1

    print(f"\nDone. Backfilled: {backfilled}, Skipped: {skipped}")
    client.close()


if __name__ == "__main__":
    from datetime import datetime
    main()
