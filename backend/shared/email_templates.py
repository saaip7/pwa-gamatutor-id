"""HTML email templates for GAMATUTOR notifications.

Table-based layout, inlined styles, external PNG logo.
Single brand accent (#3B82F6) across all templates — urgency conveyed through copy, not color.
Each public function returns (subject, html_body, plain_text) tuple.
"""

import re as _re

_LOGO_URI = "https://v2.gamatutor.id/icon-512x512-secondary.png"

_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
_PRIMARY = "#2563EB"
_PRIMARY_DARK = "#1D4ED8"
_PRIMARY_BG = "#EFF6FF"
_NEUTRAL_800 = "#1F2937"
_NEUTRAL_500 = "#6B7280"
_NEUTRAL_400 = "#9CA3AF"
_NEUTRAL_200 = "#E5E7EB"
_NEUTRAL_100 = "#F3F4F6"
_NEUTRAL_50 = "#F8F9FA"

_FOOTER = (
    '<tr><td style="padding:0 28px;"><div style="height:1px;background:' + _NEUTRAL_200 + ';font-size:1px;line-height:1px;">&nbsp;</div></td></tr>'
    '<tr><td style="padding:16px 28px 20px;">'
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>'
    '<td style="vertical-align:middle;">'
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
    '<td style="width:22px;height:22px;">'
    '<img src="' + _LOGO_URI + '" width="22" height="22" alt="" style="display:block;border:0;outline:none;"/>'
    '</td>'
    '<td style="padding:0 0 0 8px;font-size:11px;font-weight:700;color:' + _NEUTRAL_500 + ';">GAMATUTOR</td>'
    '</tr></table>'
    '</td>'
    '<td style="text-align:right;vertical-align:middle;">'
    '<span style="font-size:11px;color:' + _NEUTRAL_400 + ';">'
    'Atur notifikasi di <a href="https://v2.gamatutor.id/account" style="color:' + _NEUTRAL_400 + ';text-decoration:underline;">Settings</a>'
    '</span>'
    '</td>'
    '</tr></table>'
    '</td></tr>'
)

_WRAPPER_START = (
    '<!DOCTYPE html>'
    '<html lang="id"><head><meta charset="UTF-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1.0">'
    '<title>{subject}</title></head>'
    '<body style="margin:0;padding:0;background-color:' + _NEUTRAL_50 + ';'
    'font-family:' + _FONT + ';color:' + _NEUTRAL_800 + ';">'
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">'
    '<tr><td align="center" style="padding:40px 16px;">'
    '<table role="presentation" width="540" cellspacing="0" cellpadding="0" border="0" style="max-width:540px;width:100%;'
    'background-color:#ffffff;border-radius:20px;border:0.5px solid ' + _NEUTRAL_200 + ';border-spacing:0;'
    '-webkit-border-radius:20px;-moz-border-radius:20px;overflow:hidden;">'
    '<tr><td style="height:3px;background-color:{accent};"></td></tr>'
    '<tr><td style="padding:20px 28px 16px;">'
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
    '<td style="width:32px;height:32px;">'
    '<img src="' + _LOGO_URI + '" width="32" height="32" alt="GAMATUTOR" style="display:block;border:0;outline:none;"/>'
    '</td>'
    '<td style="padding:0 0 0 10px;font-size:18px;font-weight:700;letter-spacing:1.5px;color:' + _NEUTRAL_800 + ';">'
    'GAMATUTOR</td></tr></table></td></tr>'
    '<tr><td style="padding:0 28px;"><div style="height:0.5px;background:' + _NEUTRAL_200 + ';font-size:1px;line-height:1px;">&nbsp;</div></td></tr>'
    '<tr><td style="padding:32px 28px 0;">'
)

_WRAPPER_END = '</td></tr>' + _FOOTER + '</table></td></tr>'
_WRAPPER_END += (
    '<tr><td align="center" style="padding:16px 16px 40px;">'
    '<p style="margin:0;font-size:11px;color:' + _NEUTRAL_400 + ';">'
    '&copy; 2026 GAMATUTOR &middot; <a href="https://v2.gamatutor.id" style="color:' + _NEUTRAL_400 + ';text-decoration:underline;">v2.gamatutor.id</a>'
    '</p></td></tr>'
)
_WRAPPER_END += '</table></body></html>'


def _render(subject, body_html, body_text, accent=_PRIMARY, badge=None):
    html = (
        _WRAPPER_START
        .replace("{subject}", subject)
        .replace("{accent}", accent)
    )
    if badge:
        html += (
            '<div style="display:inline-block;background:' + _PRIMARY_BG + ';border-radius:6px;padding:5px 10px;margin:0 0 20px;">'
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
            '<td style="width:6px;height:6px;background:' + _PRIMARY + ';border-radius:50%;vertical-align:middle;"></td>'
            '<td style="padding:0 0 0 6px;font-size:11px;font-weight:500;color:' + _PRIMARY_DARK + ';letter-spacing:0.5px;">' + badge + '</td>'
            '</tr></table></div>'
        )
    html += body_html + _WRAPPER_END
    return subject, html, body_text


def _heading(text):
    return '<h2 style="margin:0 0 12px;font-size:22px;font-weight:500;color:' + _NEUTRAL_800 + ';line-height:1.3;">' + text + '</h2>'


def _paragraph(text):
    return '<p style="margin:0 0 28px;font-size:14px;color:' + _NEUTRAL_500 + ';line-height:1.75;">' + text + '</p>'


def _info_box(title, desc):
    """Info card with icon, title, description — like the "Board kamu menunggu" block."""
    return (
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;'
        'background:' + _NEUTRAL_100 + ';border-radius:12px;border:0.5px solid ' + _NEUTRAL_200 + ';">'
        '<tr><td style="padding:16px 18px;">'
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
        '<td style="width:40px;height:40px;background:#DBEAFE;border-radius:10px;text-align:center;vertical-align:middle;">'
        '<img src="' + _LOGO_URI + '" width="20" height="20" alt="" style="display:block;border:0;outline:none;border-radius:5px;"/>'
        '</td>'
        '<td style="padding:0 0 0 14px;vertical-align:middle;">'
    ) + (
        '<p style="margin:0 0 2px;font-size:13px;font-weight:500;color:' + _NEUTRAL_800 + ';">' + title + '</p>'
        '<p style="margin:0;font-size:12px;color:' + _NEUTRAL_500 + ';">' + desc + '</p>'
        '</td></tr></table></td></tr></table>'
    )


def _detail_rows(pairs, value_color=_NEUTRAL_800):
    rows = ""
    for label, value in pairs:
        rows += (
            '<tr>'
            '<td style="font-size:13px;color:' + _NEUTRAL_400 + ';width:100px;vertical-align:top;padding:5px 0;">' + label + '</td>'
            '<td style="font-size:14px;color:' + value_color + ';font-weight:600;vertical-align:top;padding:5px 0;">' + value + '</td>'
            '</tr>'
        )
    return (
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"'
        ' style="margin:0 0 16px 0;">' + rows + '</table>'
    )


def _cta(url, text, accent=_PRIMARY):
    return (
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 32px;">'
        '<tr><td style="background-color:' + accent + ';border-radius:10px;text-align:center;">'
        '<a href="' + url + '" style="display:inline-block;padding:13px 20px;font-size:13px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">' + text + '</a>'
        '</td></tr></table>'
    )


def _strip_tags(html):
    return _re.sub(r"<[^>]+>", "", html).replace("&amp;", "&").replace("&rarr;", "->")


# ---------------------------------------------------------------------------
# Deadline reminders (3 tiers — urgency signaled by color)
# ---------------------------------------------------------------------------

_AMBER = "#F59E0B"
_RED = "#EF4444"

def deadline_early(task_name, hours_left):
    """12-24h before deadline. Blue accent. Calm tone."""
    hours_text = f"{hours_left} jam" if hours_left > 1 else "kurang dari 1 jam"
    subject = f"Deadline: {task_name}"
    html = "\n".join([
        _heading("Deadline mendekat"),
        _paragraph(f"<strong>{task_name}</strong> harus diselesaikan dalam {hours_text}."),
        _detail_rows([("Tugas", task_name), ("Sisa waktu", hours_text)]),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"Deadline mendekat\n\n{task_name} harus diselesaikan dalam {hours_text}.\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


def deadline_urgent(task_name, hours_left):
    """3-12h before deadline. Amber accent."""
    hours_text = f"{hours_left} jam" if hours_left > 1 else "kurang dari 1 jam"
    subject = f"Deadline sebentar lagi: {task_name}"
    hours_colored = f'<strong style="color:{_AMBER};">{hours_text}</strong>'
    html = "\n".join([
        _heading("Tinggal beberapa jam lagi"),
        _paragraph(f"<strong>{task_name}</strong> \u2014 sisa {hours_colored} sebelum deadline."),
        _detail_rows([("Tugas", task_name), ("Sisa waktu", hours_text)]),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192", accent=_AMBER),
    ])
    text = f"Tinggal beberapa jam lagi\n\n{task_name} - sisa {hours_text} sebelum deadline.\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text, accent=_AMBER)


def deadline_critical(task_name, hours_left):
    """0-3h before deadline. Red accent."""
    hours_text = f"{hours_left} jam" if hours_left > 1 else "kurang dari 1 jam"
    subject = f"SEGERA: {task_name}"
    hours_colored = f'<strong style="color:{_RED};">{hours_text}</strong>'
    html = "\n".join([
        _heading("Deadline sudah dekat"),
        _paragraph(f"<strong>{task_name}</strong> harus diselesaikan dalam {hours_colored}. Segera kerjakan."),
        _detail_rows([("Tugas", task_name), ("Sisa waktu", hours_text)]),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192", accent=_RED),
    ])
    text = f"Deadline sudah dekat\n\n{task_name} harus diselesaikan dalam {hours_text}. Segera kerjakan.\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text, accent=_RED)


def deadline_reminder(task_name, hours_left):
    return deadline_early(task_name, hours_left)


# ---------------------------------------------------------------------------
# Smart reminders (3 activity groups — differentiated by copy, not color)
# ---------------------------------------------------------------------------

def smart_reminder_a():
    messages = [
        ("Rutinitas belajarmu sedang bagus", "Kamu konsisten belajar beberapa hari terakhir. Pertahankan momentumnya hari ini."),
        ("Hari produktif", "Rutinitas yang kamu bangun mulai menghasilkan. Hari ini punya potensi yang sama."),
        ("Di jalur yang benar", "Kamu sudah menunjukkan kedisiplinan yang baik. Belajar teratur membawa hasil."),
    ]
    import random
    title, body = random.choice(messages)
    subject = f"GAMATUTOR: {title}"
    html = "\n".join([
        _heading(title),
        _paragraph(body),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"{title}\n\n{body}\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


def smart_reminder_b():
    messages = [
        ("Yuk kembali belajar", "Ada rencana belajar yang bisa dilanjutkan hari ini. Satu langkah kecil sudah cukup."),
        ("Kanbanmu menunggu", "Tugasmu masih menunggu di Kanban. Yuk lanjutkan progresnya hari ini."),
        ("Langkah kecil hari ini", "Tidak perlu banyak. Satu tugas kecil hari ini sudah cukup."),
    ]
    import random
    title, body = random.choice(messages)
    subject = f"GAMATUTOR: {title}"
    html = "\n".join([
        _heading(title),
        _paragraph(body),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"{title}\n\n{body}\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


def smart_reminder_c():
    messages = [
        ("Langkah kecil untuk hari ini", "Langkah besar dimulai dari hal kecil. Cicil satu tugas kecil saja hari ini."),
        ("Buka Kanbanmu", "Belajar tidak harus sempurna. Buka Kanbanmu \u2014 itu sudah langkah awal."),
        ("Tidak apa-apa", "Tidak apa-apa belum sempat belajar beberapa hari ini. Hari ini bisa mulai lagi."),
    ]
    import random
    title, body = random.choice(messages)
    subject = f"GAMATUTOR: {title}"
    html = "\n".join([
        _heading(title),
        _paragraph(body),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"{title}\n\n{body}\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


def smart_reminder(task_name, tier):
    tier_fn = {"A": smart_reminder_a, "B": smart_reminder_b, "C": smart_reminder_c}.get(tier, smart_reminder_b)
    return tier_fn()


# ---------------------------------------------------------------------------
# Streak nudge
# ---------------------------------------------------------------------------

def streak_nudge(streak_count):
    subject = f"Streak {streak_count} hari \u2014 jangan putus!"
    html = "\n".join([
        _heading(f"Streak {streak_count} hari"),
        _paragraph(f"Kamu sudah belajar <strong>{streak_count} hari</strong> berturut-turut. "
                   "Satu tugas kecil hari ini cukup untuk menjaganya."),
        _cta("https://v2.gamatutor.id", "Mulai sesi belajar \u2192"),
    ])
    text = (f"Streak {streak_count} hari\n\n"
            f"Kamu sudah belajar {streak_count} hari berturut-turut. "
            "Satu tugas kecil hari ini cukup untuk menjaganya.\n\n"
            "Mulai sesi: https://v2.gamatutor.id")
    return _render(subject, html, text)


# ---------------------------------------------------------------------------
# Session emails
# ---------------------------------------------------------------------------

def idle_session():
    subject = "Masih belajar?"
    html = "\n".join([
        _heading("Masih belajar?"),
        _paragraph("Kamu belum terlihat aktif beberapa waktu terakhir. "
                   "Buka aplikasi untuk melanjutkan sesi belajarmu."),
        _cta("https://v2.gamatutor.id", "Buka GAMATUTOR \u2192"),
    ])
    text = ("Masih belajar?\n\n"
            "Kamu belum terlihat aktif beberapa waktu terakhir. "
            "Buka aplikasi untuk melanjutkan sesi belajarmu.\n\n"
            "Buka GAMATUTOR: https://v2.gamatutor.id")
    return _render(subject, html, text)


def auto_end(session_duration):
    subject = "Sesi diakhiri otomatis"
    html = "\n".join([
        _heading("Sesi belajar diakhiri"),
        _paragraph(f"Sesi belajarmu telah diakhiri otomatis setelah tidak aktif selama {session_duration}."),
        _cta("https://v2.gamatutor.id", "Mulai sesi baru \u2192"),
    ])
    text = (f"Sesi belajar diakhiri\n\n"
            f"Sesi belajarmu telah diakhiri otomatis setelah tidak aktif selama {session_duration}.\n\n"
            "Mulai sesi baru: https://v2.gamatutor.id")
    return _render(subject, html, text)


# ---------------------------------------------------------------------------
# Badge unlocked
# ---------------------------------------------------------------------------

def badge_unlocked(badge_name, badge_tier="bronze"):
    subject = f"Badge baru: {badge_name}"
    html = "\n".join([
        _heading("Badge baru terbuka!"),
        _paragraph(f"Kamu mendapatkan <strong>{badge_name}</strong>. Teruskan!"),
        _detail_rows([("Badge", badge_name)]),
        _cta("https://v2.gamatutor.id/progress", "Lihat badge \u2192"),
    ])
    text = f"Badge baru terbuka!\n\nKamu mendapatkan {badge_name}. Teruskan!\n\nLihat badge: https://v2.gamatutor.id/progress"
    return _render(subject, html, text)


# ---------------------------------------------------------------------------
# Social presence
# ---------------------------------------------------------------------------

def social_presence(active_count):
    subject = f"{active_count} mahasiswa sedang belajar"
    html = "\n".join([
        _heading("Teman Sedang Belajar"),
        _paragraph(f"Saat ini ada <strong>{active_count} mahasiswa</strong> yang sedang aktif belajar. "
                   "Yuk bergabung dan lanjutkan progresmu!"),
        _cta("https://v2.gamatutor.id", "Mulai belajar \u2192"),
    ])
    text = (f"Teman Sedang Belajar\n\n"
            f"Saat ini ada {active_count} mahasiswa yang sedang aktif belajar. "
            "Yuk bergabung dan lanjutkan progresmu!\n\n"
            "Mulai belajar: https://v2.gamatutor.id")
    return _render(subject, html, text)


# ---------------------------------------------------------------------------
# Generic / fallback
# ---------------------------------------------------------------------------

def generic(subject, body):
    html = "\n".join([
        _heading(subject),
        _paragraph(body),
    ])
    text = f"{subject}\n\n{body}"
    return _render(subject, html, text)


def generic_nudge(title, message):
    return generic(title, message)
