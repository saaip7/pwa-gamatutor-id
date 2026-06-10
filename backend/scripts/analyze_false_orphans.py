"""
Analyze orphan study sessions and identify false orphans (sessions wrongly marked
as orphan despite having active heartbeats).

Bug: cleanup_orphan_sessions() only checks start_time, not last_heartbeat.
A session >3 hours with active heartbeats gets falsely orphaned.

False orphan = orphan:True AND last_heartbeat exists AND last_heartbeat >= end_time - 30min
True orphan  = orphan:True AND (no last_heartbeat OR last_heartbeat < end_time - 30min)

Cara pakai:
    # Preview dulu, TIDAK ada perubahan ke DB
    python scripts/analyze_false_orphans.py --dry-run

    # Apply: remove orphan flag from false orphans + backup otomatis
    python scripts/analyze_false_orphans.py

    # Apply tanpa backup (tidak disarankan)
    python scripts/analyze_false_orphans.py --no-backup
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
GRACE_MINUTES = 30  # heartbeat dalam 30 menit sebelum cutoff = masih aktif
HEARTBEAT_GRACE_END = 5  # tambah 5 menit setelah last_heartbeat untuk durasi estimasi


def classify_orphan(session):
    """Klasifikasi false orphan vs true orphan.

    Returns dict dengan klasifikasi + metrik.
    """
    orphan = session.get("orphan", False)
    end_time = session.get("end_time")
    start_time = session.get("start_time")
    last_hb = session.get("last_heartbeat")

    durasi_asli = 0
    durasi_estimasi = 0
    menit_hilang = 0
    klasifikasi = "unknown"

    if start_time and end_time:
        durasi_asli = (end_time - start_time).total_seconds() / 60

    if last_hb and end_time:
        gap_hb_ke_cutoff = (end_time - last_hb).total_seconds() / 60
        if gap_hb_ke_cutoff <= GRACE_MINUTES:
            klasifikasi = "false_orphan"
            # Estimasi durasi: last_heartbeat + 5min grace - start_time
            estimasi_end = last_hb + timedelta(minutes=HEARTBEAT_GRACE_END)
            durasi_estimasi = (estimasi_end - start_time).total_seconds() / 60
            menit_hilang = durasi_estimasi - durasi_asli
        else:
            klasifikasi = "true_orphan"
            durasi_estimasi = durasi_asli
    elif not last_hb:
        klasifikasi = "true_orphan_no_hb"
        durasi_estimasi = durasi_asli
    else:
        klasifikasi = "true_orphan"
        durasi_estimasi = durasi_asli

    return {
        "klasifikasi": klasifikasi,
        "durasi_asli_menit": round(durasi_asli, 1),
        "durasi_estimasi_menit": round(durasi_estimasi, 1),
        "menit_hilang": round(max(0, menit_hilang), 1),
        "gap_hb_ke_cutoff_menit": round(gap_hb_ke_cutoff, 1) if last_hb and end_time else None,
    }


def get_card_name(db, card_id):
    """Cari nama card dari card_id (bisa string atau number)."""
    if not card_id:
        return "(tanpa card_id)"
    try:
        card = db.cards.find_one(
            {"card_id": str(card_id)},
            {"task_name": 1}
        )
        if card and card.get("task_name"):
            return card["task_name"]
    except Exception:
        pass
    return f"card:{card_id}"


def fmt_dt(dt):
    """Format datetime ke string WIB."""
    if not dt:
        return "-"
    wib = dt + timedelta(hours=7)
    return wib.strftime("%d/%m %H:%M")


def fmt_dur(menit):
    """Format menit ke jam:menit."""
    if menit is None or menit < 0:
        return "0m"
    h = int(menit // 60)
    m = int(menit % 60)
    if h > 0:
        return f"{h}j{m:02d}m"
    return f"{m}m"


def serialize(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)


def backup_orphan_data(db, backup_dir):
    """Backup orphan sessions ke file JSON."""
    os.makedirs(backup_dir, exist_ok=True)
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(backup_dir, f"orphan_backup_{ts}.json")

    docs = list(db.study_sessions.find({"orphan": True}))
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(docs, f, default=serialize, indent=2, ensure_ascii=False)

    return backup_path, len(docs)


def main():
    dry_run = "--dry-run" in sys.argv
    no_backup = "--no-backup" in sys.argv

    print("=" * 60)
    print("ANALYZE FALSE ORPHANS")
    print("=" * 60)
    if dry_run:
        print("MODE: DRY RUN (tidak ada perubahan ke DB)")
    else:
        print("MODE: APPLY (akan update DB)")
    print()

    client = MongoClient(MONGO_URI)
    db_name = MONGO_URI.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]

    # -----------------------------------------------------------------------
    # Step 1: Backup (skip kalau dry-run atau --no-backup)
    # -----------------------------------------------------------------------

    if not dry_run and not no_backup:
        print("Step 1: Backup data orphan saat ini...")
        backup_dir = os.path.join(os.path.dirname(__file__), "..", "backups")
        backup_path, total_backed = backup_orphan_data(db, backup_dir)
        print(f"  Backup: {backup_path}")
        print(f"  Total dokumen di-backup: {total_backed}")
        print()
    elif dry_run:
        print("Step 1: Backup — SKIP (dry-run mode)")
        print()
    else:
        print("Step 1: Backup — SKIP (--no-backup flag)")
        print()

    # -----------------------------------------------------------------------
    # Step 2: Load semua orphan sessions
    # -----------------------------------------------------------------------

    print("Step 2: Load orphan sessions...")

    orphan_sessions = list(db.study_sessions.find({"orphan": True}))
    total_orphan = len(orphan_sessions)

    print(f"  Total orphan sessions: {total_orphan}")
    print()

    if total_orphan == 0:
        print("Tidak ada orphan sessions. Selesai.")
        client.close()
        return

    # -----------------------------------------------------------------------
    # Step 3: Klasifikasi tiap orphan session
    # -----------------------------------------------------------------------

    print("Step 3: Klasifikasi orphan sessions...")
    print()

    user_cache = {}

    results = []
    for session in orphan_sessions:
        session_id = str(session["_id"])
        user_id = session.get("user_id")
        card_id = session.get("card_id")
        start = session.get("start_time")
        end = session.get("end_time")
        hidden = session.get("hidden_ms", 0)
        last_hb = session.get("last_heartbeat")

        user_str = str(user_id) if user_id else "(unknown)"

        if user_str not in user_cache:
            user_cache[user_str] = get_card_name(db, card_id)

        info = classify_orphan(session)

        results.append({
            "session_id": session_id,
            "user_id": user_str,
            "card_id": card_id,
            "task_name": get_card_name(db, card_id),
            "start_time": start,
            "end_time": end,
            "last_heartbeat": last_hb,
            "hidden_ms": hidden,
            **info,
        })

    false_orphans = [r for r in results if r["klasifikasi"] == "false_orphan"]
    true_orphans = [r for r in results if r["klasifikasi"] in ("true_orphan", "true_orphan_no_hb")]

    # Group by user
    users_affected = set(r["user_id"] for r in false_orphans)

    # -----------------------------------------------------------------------
    # Step 4: Tampilkan detail
    # -----------------------------------------------------------------------

    print(f"False orphan (salah orphan)       : {len(false_orphans)}")
    print(f"True orphan (bener orphan)         : {len(true_orphans)}")
    print(f"Total user affected                : {len(users_affected)}")
    print()

    if false_orphans:
        print("-" * 60)
        print("DETAIL FALSE ORPHAN")
        print("-" * 60)
        print()

        # Sort by lost time descending
        false_orphans.sort(key=lambda r: r["menit_hilang"], reverse=True)

        header = f"{'No':>3} | {'User':<26} | {'Task':<25} | {'Mulai':<12} | {'Cutoff':<12} | {'Durasi':<8} | {'Estimasi':<8} | {'Hilang':<8} | {'HB gap':<6}"
        sep = "-" * len(header)
        print(header)
        print(sep)

        for i, r in enumerate(false_orphans, 1):
            uid = str(r["user_id"])[:24]
            task = r["task_name"][:23]
            mulai = fmt_dt(r["start_time"])
            cutoff = fmt_dt(r["end_time"])
            durasi = fmt_dur(r["durasi_asli_menit"])
            estimasi = fmt_dur(r["durasi_estimasi_menit"])
            hilang = fmt_dur(r["menit_hilang"])
            hb_gap = f"{r['gap_hb_ke_cutoff_menit']:.0f}m" if r["gap_hb_ke_cutoff_menit"] is not None else "-"

            print(f"{i:>3} | {uid:<26} | {task:<25} | {mulai:<12} | {cutoff:<12} | {durasi:<8} | {estimasi:<8} | {hilang:<8} | {hb_gap:<6}")

        print()

        # Per-user summary
        print("-" * 60)
        print("RINGKASAN PER USER")
        print("-" * 60)
        print()

        user_summary = {}
        for r in false_orphans:
            uid = r["user_id"]
            if uid not in user_summary:
                user_summary[uid] = {
                    "total_sesi": 0,
                    "total_hilang": 0,
                    "total_durasi_asli": 0,
                    "total_durasi_estimasi": 0,
                    "sesi_detail": [],
                }
            us = user_summary[uid]
            us["total_sesi"] += 1
            us["total_hilang"] += r["menit_hilang"]
            us["total_durasi_asli"] += r["durasi_asli_menit"]
            us["total_durasi_estimasi"] += r["durasi_estimasi_menit"]
            us["sesi_detail"].append({
                "task": r["task_name"],
                "durasi_asli": r["durasi_asli_menit"],
                "durasi_estimasi": r["durasi_estimasi_menit"],
                "hilang": r["menit_hilang"],
            })

        for uid, us in sorted(user_summary.items(), key=lambda x: x[1]["total_hilang"], reverse=True):
            print(f"  User: {uid[:24]}")
            print(f"    Total sesi false orphan : {us['total_sesi']}")
            print(f"    Total durasi asli       : {fmt_dur(us['total_durasi_asli'])}")
            print(f"    Total durasi estimasi   : {fmt_dur(us['total_durasi_estimasi'])}")
            print(f"    Total menit hilang      : {fmt_dur(us['total_hilang'])}")

            # Cek sesi >60 menit (kena deep_diver)
            for sd in us["sesi_detail"]:
                if sd["durasi_asli"] < 60 and sd["durasi_estimasi"] >= 60:
                    print(f"    ⚠  Sesi \"{sd['task']}\": "
                          f"{fmt_dur(sd['durasi_asli'])} → {fmt_dur(sd['durasi_estimasi'])} "
                          f"(potensi deep_diver badge terlewat)")

            # Cek personal_best terbesar
            max_est = max((s["durasi_estimasi"] for s in us["sesi_detail"]), default=0)
            max_asli = max((s["durasi_asli"] for s in us["sesi_detail"]), default=0)
            if max_est > max_asli:
                print(f"    ⚠  Personal best terpotong: {fmt_dur(max_asli)} → seharusnya {fmt_dur(max_est)}")
            print()

    # True orphan summary
    if true_orphans:
        print("-" * 60)
        print("TRUE ORPHAN (tidak diubah)")
        print("-" * 60)
        print()

        no_hb = [r for r in true_orphans if r["klasifikasi"] == "true_orphan_no_hb"]
        stale_hb = [r for r in true_orphans if r["klasifikasi"] == "true_orphan"]

        print(f"  Tanpa heartbeat sama sekali : {len(no_hb)}")
        print(f"  Heartbeat stale             : {len(stale_hb)}")
        print()

        if stale_hb:
            print(f"{'No':>3} | {'User':<26} | {'Task':<25} | {'Mulai':<12} | {'HB terakhir':<12}")
            print("-" * 80)
            for i, r in enumerate(stale_hb[:10], 1):
                uid = str(r["user_id"])[:24]
                task = r["task_name"][:23]
                mulai = fmt_dt(r["start_time"])
                hb_last = fmt_dt(r["last_heartbeat"])
                print(f"{i:>3} | {uid:<26} | {task:<25} | {mulai:<12} | {hb_last:<12}")
            if len(stale_hb) > 10:
                print(f"  ... dan {len(stale_hb) - 10} session lainnya")
            print()

    # -----------------------------------------------------------------------
    # Step 5: Summary
    # -----------------------------------------------------------------------

    total_hilang = sum(r["menit_hilang"] for r in results if r["klasifikasi"] == "false_orphan")

    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Total orphan sessions        : {total_orphan}")
    print(f"  False orphan (salah orphan)  : {len(false_orphans)}")
    print(f"  True orphan (bener orphan)   : {len(true_orphans)}")
    print(f"  Total user affected          : {len(users_affected)}")
    print(f"  Total study minutes hilang   : {fmt_dur(total_hilang)}")
    print()

    if dry_run:
        print("DRY RUN selesai. Tidak ada perubahan ke DB.")
        print("Jalankan tanpa --dry-run untuk apply fix.")
        client.close()
        return

    # -----------------------------------------------------------------------
    # Step 6: Apply fix — remove orphan flag from false orphans
    # -----------------------------------------------------------------------

    if not false_orphans:
        print("Tidak ada false orphan. Selesai.")
        client.close()
        return

    print(f"Step 6: Apply fix ke {len(false_orphans)} false orphans...")
    print()

    updated = 0
    errors = 0

    for r in false_orphans:
        try:
            db.study_sessions.update_one(
                {"_id": ObjectId(r["session_id"])},
                {
                    "$unset": {"orphan": ""},
                    "$set": {
                        "hidden_ms": int(r["hidden_ms"]) if r.get("hidden_ms") else 0,
                        "updated_at": datetime.utcnow(),
                    },
                }
            )
            updated += 1
        except Exception as e:
            print(f"  ERROR session {r['session_id']}: {e}")
            errors += 1

    print(f"  Berhasil diupdate : {updated}")
    print(f"  Error             : {errors}")
    print()

    # Hitung total waktu yang dipulihkan
    total_dipulihkan = sum(r["menit_hilang"] for r in false_orphans)
    print(f"  Total menit studi dipulihkan : {fmt_dur(total_dipulihkan)}")
    print()
    print("Selesai.")
    client.close()


if __name__ == "__main__":
    main()
