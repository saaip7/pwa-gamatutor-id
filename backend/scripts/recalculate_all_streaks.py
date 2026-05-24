"""
Recalculate streak (current + longest) untuk semua user berdasarkan active_dates.

Script ini memperbaiki inkonsistensi data akibat bug:
  Bug #1: Reset streak ke 1 (harusnya 0) saat gap > 1
  Bug #2: Scheduler reset streak meski gap baru 1 hari (grace period)
  Bug #3: longest tidak di-update saat current melampaui nilai lama

Logic streak yang dipakai (TIDAK berubah):
  - gap 0: lanjut (aktif hari yang sama)
  - gap 1: lanjut (grace period)
  - gap >= 2: reset current ke 0
  - freeze date: hari freeze dianggap aktif, sehingga gap 2 dengan freeze di tengah = gap efektif 1

Cara pakai:
    # Preview dulu, TIDAK ada perubahan ke DB
    python scripts/recalculate_all_streaks.py --dry-run

    # Apply ke DB (backup otomatis dibuat sebelum apply)
    python scripts/recalculate_all_streaks.py

    # Apply ke DB tanpa backup (tidak disarankan)
    python scripts/recalculate_all_streaks.py --no-backup
"""

import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/gamatutor")

# ---------------------------------------------------------------------------
# Streak calculator (sama persis dengan logic di streak.py)
# ---------------------------------------------------------------------------

def calculate_streak_from_dates(active_dates, freeze_dates=None, today=None):
    """
    Hitung current dan longest streak dari active_dates.

    Args:
        active_dates: list of "YYYY-MM-DD" strings
        freeze_dates: list of "YYYY-MM-DD" strings (hari freeze = dianggap aktif)
        today: date object, default = hari ini WIB

    Returns:
        (current, longest)
    """
    if not active_dates:
        return 0, 0

    if today is None:
        from datetime import date
        # WIB = UTC+7
        today = (datetime.utcnow() + timedelta(hours=7)).date()

    dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in active_dates])
    freeze_set = set(
        datetime.strptime(d, "%Y-%m-%d").date() for d in (freeze_dates or [])
    )

    # Bangun segments (streak runs)
    segments = []
    current_segment = []

    for date in dates:
        if not current_segment:
            current_segment = [date]
        else:
            prev_date = current_segment[-1]
            gap = (date - prev_date).days

            # Cek apakah ada freeze di dalam gap
            gap_frozen = any(
                prev_date + timedelta(days=d) in freeze_set
                for d in range(1, gap)
            )

            # gap 1 = lanjut (grace period)
            # gap 2 dengan frozen di tengah = efektif gap 1 = lanjut
            effective_gap = gap - 1 if gap_frozen else gap
            if effective_gap <= 1:
                current_segment.append(date)
            else:
                segments.append(current_segment)
                current_segment = [date]

    if current_segment:
        segments.append(current_segment)

    # Hitung current (dari segment terakhir)
    last_segment = segments[-1] if segments else []
    last_date = last_segment[-1] if last_segment else None

    if last_date:
        gap_from_today = (today - last_date).days
        # gap 0 (aktif hari ini) atau gap 1 (grace period) = streak masih hidup
        current = len(last_segment) if gap_from_today <= 1 else 0
    else:
        current = 0

    # Hitung longest
    longest = max((len(seg) for seg in segments), default=0)

    return current, longest


# ---------------------------------------------------------------------------
# Backup helper
# ---------------------------------------------------------------------------

def backup_streak_data(db, backup_dir):
    """
    Backup field streak dari semua user_preferences ke file JSON.
    Returns path ke file backup.
    """
    os.makedirs(backup_dir, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(backup_dir, f"streak_backup_{ts}.json")

    docs = list(db.user_preferences.find(
        {},
        {"_id": 1, "user_id": 1, "streak": 1}
    ))

    # Convert ObjectId to string untuk JSON serializable
    def serialize(obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return str(obj)

    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(docs, f, default=serialize, indent=2, ensure_ascii=False)

    return backup_path, len(docs)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    dry_run = "--dry-run" in sys.argv
    no_backup = "--no-backup" in sys.argv

    print("=" * 60)
    print("RECALCULATE ALL STREAKS")
    print("=" * 60)
    if dry_run:
        print("MODE: DRY RUN (tidak ada perubahan ke DB)")
    else:
        print("MODE: APPLY (akan update DB)")
    print()

    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]

    # ---------------------------------------------------------------------------
    # Step 1: Backup (skip kalau dry-run atau --no-backup)
    # ---------------------------------------------------------------------------

    if not dry_run and not no_backup:
        print("Step 1: Backup data streak saat ini...")
        backup_dir = os.path.join(os.path.dirname(__file__), "..", "backups")
        backup_path, total_backed = backup_streak_data(db, backup_dir)
        print(f"  Backup: {backup_path}")
        print(f"  Total dokumen di-backup: {total_backed}")
        print()
    elif dry_run:
        print("Step 1: Backup — SKIP (dry-run mode)")
        print()
    else:
        print("Step 1: Backup — SKIP (--no-backup flag)")
        print()

    # ---------------------------------------------------------------------------
    # Step 2: Load semua user dengan active_dates
    # ---------------------------------------------------------------------------

    print("Step 2: Load user preferences...")
    today_wib = (datetime.utcnow() + timedelta(hours=7)).date()
    print(f"  Today WIB: {today_wib}")

    all_prefs = list(db.user_preferences.find({}))
    users_with_dates = [p for p in all_prefs if p.get("streak", {}).get("active_dates")]
    users_without_dates = [p for p in all_prefs if not p.get("streak", {}).get("active_dates")]

    print(f"  Total user_preferences: {len(all_prefs)}")
    print(f"  Users dengan active_dates: {len(users_with_dates)}")
    print(f"  Users tanpa active_dates (skip): {len(users_without_dates)}")
    print()

    # ---------------------------------------------------------------------------
    # Step 3: Hitung & bandingkan
    # ---------------------------------------------------------------------------

    print("Step 3: Kalkulasi streak...")
    print()

    results = []
    for pref in users_with_dates:
        user_id = pref.get("user_id")
        streak = pref.get("streak", {})

        current_old = streak.get("current", 0)
        longest_old = streak.get("longest", 0)
        active_dates = streak.get("active_dates", [])
        freeze_dates = streak.get("freeze_dates", [])

        current_new, longest_new = calculate_streak_from_dates(
            active_dates, freeze_dates, today=today_wib
        )

        changed = (current_old != current_new) or (longest_old != longest_new)
        results.append({
            "pref_id": pref["_id"],
            "user_id": user_id,
            "current_old": current_old,
            "longest_old": longest_old,
            "current_new": current_new,
            "longest_new": longest_new,
            "changed": changed,
        })

    changed_results = [r for r in results if r["changed"]]
    unchanged_results = [r for r in results if not r["changed"]]

    # Tampilkan perubahan
    if changed_results:
        print(f"  Users yang akan berubah ({len(changed_results)}):")
        print()
        for r in sorted(changed_results, key=lambda x: abs(x["current_old"] - x["current_new"]), reverse=True):
            uid = str(r["user_id"])
            c_old = r["current_old"]
            c_new = r["current_new"]
            l_old = r["longest_old"]
            l_new = r["longest_new"]
            c_arrow = f"{c_old} -> {c_new}" + (" (TURUN)" if c_new < c_old else " (NAIK)" if c_new > c_old else " (SAMA)")
            l_arrow = f"{l_old} -> {l_new}" + (" (TURUN)" if l_new < l_old else " (NAIK)" if l_new > l_old else " (SAMA)")
            print(f"    User {uid}")
            print(f"      current : {c_arrow}")
            print(f"      longest : {l_arrow}")
            print()
    else:
        print("  Tidak ada user yang berubah.")
        print()

    # ---------------------------------------------------------------------------
    # Step 4: Summary
    # ---------------------------------------------------------------------------

    print("-" * 60)
    print("SUMMARY")
    print("-" * 60)
    print(f"  Total user_preferences  : {len(all_prefs)}")
    print(f"  Users dengan active_dates: {len(users_with_dates)}")
    print(f"  Akan berubah             : {len(changed_results)}")
    print(f"  Tidak berubah            : {len(unchanged_results)}")
    print(f"  Tanpa active_dates (skip): {len(users_without_dates)}")
    print()

    if dry_run:
        print("DRY RUN selesai. Tidak ada perubahan ke DB.")
        print("Jalankan tanpa --dry-run untuk apply.")
        client.close()
        return

    # ---------------------------------------------------------------------------
    # Step 5: Apply ke DB
    # ---------------------------------------------------------------------------

    if not changed_results:
        print("Tidak ada perubahan. Selesai.")
        client.close()
        return

    print(f"Step 5: Apply {len(changed_results)} update ke DB...")
    updated = 0
    errors = 0

    for r in changed_results:
        try:
            db.user_preferences.update_one(
                {"_id": r["pref_id"]},
                {
                    "$set": {
                        "streak.current": r["current_new"],
                        "streak.longest": r["longest_new"],
                        "updated_at": datetime.utcnow(),
                    }
                }
            )
            updated += 1
        except Exception as e:
            print(f"  ERROR user {r['user_id']}: {e}")
            errors += 1

    print()
    print(f"  Berhasil diupdate : {updated}")
    print(f"  Error             : {errors}")
    print()
    print("Selesai.")
    client.close()


if __name__ == "__main__":
    main()
