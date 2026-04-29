"""HTML email templates for GAMATUTOR notifications.

Table-based layout, inlined styles, base64-embedded SVG logo.
Single brand accent (#3B82F6) across all templates — urgency conveyed through copy, not color.
Each public function returns (subject, html_body, plain_text) tuple.
"""

import base64
import re as _re

_LOGO_SVG = (
    '<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">'
    '<rect width="512" height="512" rx="120" fill="#3B82F6"/>'
    '<path d="M290.536 163.071C308.147 166.078 324.534 173.106 338.72 183.144C327.616 184.972 318.165 194.96 318.165 206.33C318.165 218.918 326.989 222.908 339.578 222.908C349.692 220.246 355.701 211.429 360.139 202.467C378.663 223.624 390 251.203 390 280.928C388.111 316.059 372.77 348.504 348.648 370.694L331.979 357.598C327.835 361.282 319.41 368.787 318.856 369.34C318.304 369.893 301.127 375.097 292.608 377.629C276.264 380.392 243.442 386.053 242.877 386.608C242.407 387.078 238.904 391.248 236.451 394.183C207.649 384.207 183.354 363.036 168.704 336.292L194.525 313.392L233.206 278.166L249.093 263.66L278.794 288.526L279.345 289C285.027 293.801 289.998 295.433 298.134 295.433C316.826 295.433 331.979 279.971 331.979 260.897C331.979 241.823 316.826 226.361 298.134 226.361C295.521 226.361 292.978 226.663 290.536 227.235V207.021H301.588V207.004C301.817 207.014 302.048 207.021 302.279 207.021C311.053 207.021 318.165 199.908 318.165 191.134C318.165 182.361 311.053 175.248 302.279 175.248C302.048 175.248 301.817 175.253 301.588 175.263V175.248H290.536V163.071Z" fill="#D9E7FF"/>'
    '<mask id="mask0_41_5" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="168" y="163" width="222" height="232">'
    '<path opacity="0.5" d="M290.536 163.071C308.147 166.078 324.533 173.106 338.719 183.144C327.615 184.972 318.165 194.961 318.165 206.33C318.165 218.919 326.989 222.907 339.577 222.907C349.692 220.246 355.701 211.428 360.14 202.466C378.664 223.623 390 251.203 390 280.928C388.111 316.059 372.771 348.505 348.648 370.695L331.979 357.598C327.835 361.282 319.408 368.788 318.856 369.34C318.303 369.893 301.127 375.096 292.608 377.629C276.261 380.392 243.429 386.056 242.876 386.608C242.406 387.078 238.906 391.248 236.453 394.183C207.651 384.208 183.355 363.037 168.705 336.292L194.526 313.392L233.206 278.165L249.093 263.66L278.794 288.526C284.71 293.693 289.736 295.433 298.134 295.433C316.826 295.433 331.979 279.971 331.979 260.897C331.979 254.762 330.41 249.003 327.661 244.009L330.705 240.557L324.558 239.32C318.356 231.421 308.825 226.361 298.134 226.361C295.522 226.361 292.979 226.663 290.536 227.235V207.021H301.588V207.003C301.817 207.013 302.047 207.021 302.278 207.021C311.052 207.021 318.165 199.908 318.165 191.134C318.165 182.36 311.052 175.247 302.278 175.247C302.047 175.247 301.817 175.254 301.588 175.264V175.247H290.536V163.071Z" fill="#D9D9D9"/>'
    '</mask>'
    '<g mask="url(#mask0_41_5)">'
    '<path d="M291.226 332.041V291.289L280.175 282.309L249.092 260.206L226.989 279.547L291.226 332.041Z" fill="white"/>'
    '</g>'
    '<path d="M206.268 151.763L291.918 82V283L249.093 245.701L206.268 283V151.763Z" fill="white"/>'
    '<mask id="mask1_41_5" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="206" y="82" width="86" height="202">'
    '<path d="M206.268 151.763L291.918 82V283L249.093 245.701L206.268 283V151.763Z" fill="#D9D9D9"/>'
    '</mask>'
    '<g mask="url(#mask1_41_5)">'
    '<path d="M302.279 159.361L206.268 231.887L202.124 234.65L201.433 290.598H297.444L302.279 159.361Z" fill="#D9E7FF"/>'
    '</g>'
    '<path d="M193.835 313.392L233.206 278.165L334.504 359.6C311.984 382.253 280.796 396.279 246.33 396.279C177.665 396.279 122 340.614 122 271.949C122 222.042 151.405 179.003 193.835 159.213V313.392Z" fill="white"/>'
    '</svg>'
)

_LOGO_URI = "data:image/svg+xml;base64," + base64.b64encode(_LOGO_SVG.encode("utf-8")).decode("utf-8")

_FONT = "'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
_PRIMARY = "#3B82F6"
_PRIMARY_HOVER = "#0B5DE3"
_NEUTRAL_800 = "#1f2937"
_NEUTRAL_500 = "#6b7280"
_NEUTRAL_400 = "#9ca3af"
_NEUTRAL_200 = "#e5e7eb"
_NEUTRAL_50 = "#f8f9fa"

_FOOTER = (
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0">'
    '<tr><td style="padding:24px 0 0 0;border-top:1px solid ' + _NEUTRAL_200 + ';"></td></tr>'
    '<tr><td style="padding:20px 0 0 0;font-size:12px;color:' + _NEUTRAL_400 + ';line-height:1.6;">'
    'Notifikasi ini dikirim oleh GAMATUTOR. Atur preferensi notifikasi di '
    '<a href="https://v2.gamatutor.id/account" style="color:' + _NEUTRAL_500 + ';text-decoration:underline;">Settings &rarr; Notification</a>.'
    '</td></tr></table>'
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
    '<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">'
    '<tr><td style="height:3px;background-color:' + _PRIMARY + ';"></td></tr>'
    '<tr><td style="padding:12px 0 8px 0;">'
    '<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>'
    '<td style="width:36px;height:36px;">'
    '<img src="' + _LOGO_URI + '" width="36" height="36" alt="GAMATUTOR" style="display:block;border:0;outline:none;text-decoration:none;"/>'
    '</td>'
    '<td style="padding:0 0 0 10px;font-size:16px;font-weight:700;color:' + _NEUTRAL_800 + ';letter-spacing:1.5px;">'
    'GAMATUTOR</td></tr></table></td></tr>'
    '<tr><td style="border-top:1px solid ' + _NEUTRAL_200 + ';"></td></tr>'
    '<tr><td style="padding:28px 0 0 0;">'
)

_WRAPPER_END = '</td></tr>' + _FOOTER + '</table></td></tr></table></body></html>'


def _render(subject, body_html, body_text):
    html = _WRAPPER_START.replace("{subject}", subject) + body_html + _WRAPPER_END
    return subject, html, body_text


def _heading(text):
    return (
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">'
        '<tr><td style="font-size:20px;font-weight:700;color:' + _NEUTRAL_800 + ';line-height:1.3;">' + text + '</td></tr></table>'
    )


def _paragraph(text):
    return (
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px 0;">'
        '<tr><td style="font-size:15px;color:' + _NEUTRAL_500 + ';line-height:1.6;">' + text + '</td></tr></table>'
    )


def _detail_rows(pairs):
    rows = ""
    for label, value in pairs:
        rows += (
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">'
            '<tr>'
            '<td style="font-size:13px;color:' + _NEUTRAL_400 + ';width:100px;vertical-align:top;padding:4px 0;">' + label + '</td>'
            '<td style="font-size:14px;color:' + _NEUTRAL_800 + ';vertical-align:top;padding:4px 0;">' + value + '</td>'
            '</tr></table>'
        )
    return rows


def _cta(url, text):
    return (
        '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 8px 0;">'
        '<tr><td style="background-color:' + _PRIMARY + ';padding:12px 24px;border-radius:10px;">'
        '<a href="' + url + '" style="display:inline-block;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">' + text + '</a>'
        '</td></tr></table>'
    )


def _strip_tags(html):
    return _re.sub(r"<[^>]+>", "", html).replace("&amp;", "&").replace("&rarr;", "->")


# ---------------------------------------------------------------------------
# Deadline reminders (3 tiers — differentiated by copy, not color)
# ---------------------------------------------------------------------------

def deadline_early(task_name, hours_left):
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
    hours_text = f"{hours_left} jam" if hours_left > 1 else "kurang dari 1 jam"
    subject = f"Deadline sebentar lagi: {task_name}"
    html = "\n".join([
        _heading("Tinggal beberapa jam lagi"),
        _paragraph(f"<strong>{task_name}</strong> \u2014 sisa <strong>{hours_text}</strong> sebelum deadline."),
        _detail_rows([("Tugas", task_name), ("Sisa waktu", hours_text)]),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"Tinggal beberapa jam lagi\n\n{task_name} - sisa {hours_text} sebelum deadline.\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


def deadline_critical(task_name, hours_left):
    hours_text = f"{hours_left} jam" if hours_left > 1 else "kurang dari 1 jam"
    subject = f"SEGERA: {task_name}"
    html = "\n".join([
        _heading("Deadline sudah dekat"),
        _paragraph(f"<strong>{task_name}</strong> harus diselesaikan dalam <strong>{hours_text}</strong>. Segera kerjakan."),
        _detail_rows([("Tugas", task_name), ("Sisa waktu", hours_text)]),
        _cta("https://v2.gamatutor.id/board", "Buka Board \u2192"),
    ])
    text = f"Deadline sudah dekat\n\n{task_name} harus diselesaikan dalam {hours_text}. Segera kerjakan.\n\nBuka Board: https://v2.gamatutor.id/board"
    return _render(subject, html, text)


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

def idle_session(session_duration):
    subject = "Sesi belajar berhenti"
    html = "\n".join([
        _heading("Masih belajar?"),
        _paragraph(f"Sesi belajarmu sudah tidak aktif selama {session_duration}. "
                   "Ketuk untuk kembali, atau sesi akan diakhiri otomatis."),
        _cta("https://v2.gamatutor.id", "Kembali belajar \u2192"),
    ])
    text = (f"Masih belajar?\n\n"
            f"Sesi belajarmu sudah tidak aktif selama {session_duration}. "
            "Ketuk untuk kembali.\n\n"
            "Kembali belajar: https://v2.gamatutor.id")
    return _render(subject, html, text)


def auto_end_session(session_duration):
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
# Reflection
# ---------------------------------------------------------------------------

def reflection_reminder():
    subject = "Sudah refleksi hari ini?"
    html = "\n".join([
        _heading("Refleksi belajar"),
        _paragraph("Luangkan beberapa menit untuk meninjau apa yang sudah dipelajari hari ini."),
        _cta("https://v2.gamatutor.id/progress", "Lihat Progress \u2192"),
    ])
    text = ("Refleksi belajar\n\n"
            "Luangkan beberapa menit untuk meninjau apa yang sudah dipelajari hari ini.\n\n"
            "Lihat Progress: https://v2.gamatutor.id/progress")
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
