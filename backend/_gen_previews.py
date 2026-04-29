import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shared import email_templates

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email_previews")
os.makedirs(OUT, exist_ok=True)

templates = [
    ("deadline_early", dict(task_name="Tugas AI", hours_left=20)),
    ("deadline_urgent", dict(task_name="Tugas AI", hours_left=6)),
    ("deadline_critical", dict(task_name="Tugas AI", hours_left=1)),
    ("smart_reminder_a", dict()),
    ("smart_reminder_b", dict()),
    ("smart_reminder_c", dict()),
    ("streak_nudge", dict(streak_count=7)),
    ("streak_nudge_14", dict(streak_count=14)),
    ("streak_nudge_30", dict(streak_count=30)),
    ("idle_session", dict(session_duration="30 menit")),
    ("auto_end_session", dict(session_duration="45 menit")),
    ("reflection_reminder", dict()),
    ("badge_bronze", dict(badge_name="Pemula", badge_tier="bronze")),
    ("badge_gold", dict(badge_name="Konsisten", badge_tier="gold")),
    ("badge_special", dict(badge_name="Pionir", badge_tier="special")),
    ("generic", dict(subject="Notifikasi Umum", body="Ini contoh notifikasi dari GAMATUTOR.")),
]

links = []
for label, kwargs in templates:
    fn_name = label.split("_", 1)[0] if label.startswith("badge_") else label
    if not hasattr(email_templates, fn_name):
        print(f"SKIP {label}: no template")
        continue
    fn = getattr(email_templates, fn_name)
    try:
        subj, html, text = fn(**kwargs)
    except Exception as e:
        print(f"FAIL {label}: {e}")
        continue
    path = os.path.join(OUT, f"{label}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    links.append(label)
    print(f"{label}.html ({len(html)} bytes)")

index_path = os.path.join(OUT, "index.html")
items = "\n".join(f'<li><a href="{l}.html">{l}</a></li>' for l in links)
with open(index_path, "w", encoding="utf-8") as f:
    f.write(f"<!DOCTYPE html><html><head><title>Email Previews</title></head><body><h1>Email Previews</h1><ol>{items}</ol></body></html>")
print(f"\nIndex: {len(links)} templates -> {index_path}")
