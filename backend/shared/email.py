import logging
import re
import smtplib
import time
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Email validation — only gmail.com and mail.ugm.ac.id are accepted
# ---------------------------------------------------------------------------
_ALLOWED_DOMAINS = {"gmail.com", "mail.ugm.ac.id"}
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


_MIN_USERNAME_LEN = 5


def is_valid_email(email):
    if not email:
        return False
    email = email.strip().lower()
    if not _EMAIL_RE.match(email):
        return False
    username = email.split("@", 1)[0]
    if len(username) < _MIN_USERNAME_LEN:
        return False
    domain = email.rsplit("@", 1)[-1]
    return domain in _ALLOWED_DOMAINS


def should_skip_email(email, role=None):
    if not is_valid_email(email):
        return True
    if role == "admin":
        return True
    return False


def is_bounced(email):
    from shared.db import mongo
    if not email:
        return False
    return mongo.db.email_blacklist.find_one({"email": email.strip().lower()}) is not None


def _mark_bounced(email, reason="", channel=""):
    from shared.db import mongo
    email = email.strip().lower()
    mongo.db.email_blacklist.update_one(
        {"email": email},
        {"$set": {"email": email, "reason": reason, "channel": channel,
                  "bounced_at": datetime.utcnow()}},
        upsert=True,
    )
    logger.warning(f"[Blacklist] Added: {email} — {reason}")


_BOUNCE_SMTP_CODES = {"550", "551", "552", "553", "550 5.1.1", "550 5.7.1", "554"}
_BOUNCE_RESEND_CODES = {"422", "invalid_email", "invalid_recipient", "not_found", "rejected"}


def _looks_like_bounce(error_str):
    s = str(error_str).lower()
    for code in _BOUNCE_SMTP_CODES:
        if code in s:
            return True
    for keyword in _BOUNCE_RESEND_CODES:
        if keyword in s:
            return True
    if "bounce" in s or "does not exist" in s or "no such user" in s or "recipient invalid" in s:
        return True
    return False

# Resend client (lazy init — only created when RESEND_API_KEY exists)
_resend_client = None


def _get_resend_client():
    global _resend_client
    if _resend_client is None and Config.RESEND_API_KEY:
        import resend
        resend.api_key = Config.RESEND_API_KEY
        _resend_client = resend
    return _resend_client


def send_email(to_email, subject, body_html=None, body_text=None, force_channel=None):
    """Send email via Resend API (HTTPS), falling back to SMTP.

    force_channel: "smtp" to skip Resend entirely, "resend" to skip SMTP fallback.
                   None = default behavior (Resend first, SMTP fallback).
    """
    from_email = Config.RESEND_FROM or Config.SMTP_FROM

    # --- Try Resend first (with retry on rate limit) ---
    client = _get_resend_client()
    if client and force_channel != "smtp":
        try:
            params = {
                "from": from_email,
                "to": [to_email],
                "subject": subject,
            }
            if body_html:
                params["html"] = body_html
            if body_text:
                params["text"] = body_text

            for attempt in range(2):  # initial + 1 retry
                try:
                    client.Emails.send(params)
                    logger.info(f"[Resend] Email sent to {to_email}: {subject}")
                    return True
                except Exception as send_err:
                    err_str = str(send_err).lower()
                    is_rate_limit = "429" in err_str or "rate" in err_str or "too many" in err_str
                    if is_rate_limit and attempt == 0:
                        logger.warning(f"[Resend] Rate limited sending to {to_email}, retrying in 2s...")
                        time.sleep(2)
                        continue
                    elif is_rate_limit:
                        logger.warning(f"[Resend] Rate limited again on retry for {to_email} — falling back to SMTP")
                        break
                    else:
                        if _looks_like_bounce(send_err):
                            _mark_bounced(to_email, str(send_err), "resend")
                        logger.warning(f"[Resend] Failed to send to {to_email}: {send_err} — falling back to SMTP")
                        break
        except Exception as e:
            if _looks_like_bounce(e):
                _mark_bounced(to_email, str(e), "resend")
            logger.warning(f"[Resend] Unexpected error for {to_email}: {e} — falling back to SMTP")

    # --- Fallback: SMTP ---
    if force_channel == "resend":
        return False
    if not Config.SMTP_USER or not Config.SMTP_PASSWORD:
        logger.warning("SMTP not configured — email skipped")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = Config.SMTP_FROM
        msg["To"] = to_email

        if body_text:
            msg.attach(MIMEText(body_text, "plain", "utf-8"))
        if body_html:
            msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP_SSL(Config.SMTP_HOST, Config.SMTP_PORT) as server:
            server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
            server.sendmail(Config.SMTP_FROM, to_email, msg.as_string())

        logger.info(f"[SMTP] Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        if _looks_like_bounce(e):
            _mark_bounced(to_email, str(e), "smtp")
        logger.error(f"[SMTP] Failed to send email to {to_email}: {e}")
        return False


def send_templated_email(to_email, template_name, force_channel=None, **kwargs):
    try:
        from shared import email_templates
        render = getattr(email_templates, template_name, None)
        if not render:
            logger.error(f"Email template '{template_name}' not found")
            return False
        subject, body_html, body_text = render(**kwargs)
        return send_email(to_email, subject, body_html, body_text, force_channel=force_channel)
    except Exception as e:
        logger.error(f"Failed to render/send templated email '{template_name}': {e}")
        return False


SMTP_BATCH_SIZE = 50
SMTP_BATCH_DELAY = 5400


def send_batch_smtp(recipients):
    """Send templated emails in batches via SMTP with auto-split.

    recipients: list of dicts, each:
        {
            "email": "user@mail.ugm.ac.id",
            "template": "template_name",
            "vars": {"key": "value", ...}
        }

    Returns {"sent": N, "failed": N, "bounced": N, "batches": M}.
    """
    total = len(recipients)
    if total == 0:
        return {"sent": 0, "failed": 0, "bounced": 0, "batches": 0}

    batches = [recipients[i:i + SMTP_BATCH_SIZE] for i in range(0, total, SMTP_BATCH_SIZE)]
    stats = {"sent": 0, "failed": 0, "bounced": 0, "batches": len(batches)}

    logger.info(f"[Batch] Sending {total} emails in {len(batches)} batch(es) (size={SMTP_BATCH_SIZE}, delay={SMTP_BATCH_DELAY}s)")

    for idx, batch in enumerate(batches):
        logger.info(f"[Batch] Batch {idx + 1}/{len(batches)} — {len(batch)} recipients")
        for r in batch:
            ok = send_templated_email(
                r["email"],
                r.get("template", "generic"),
                force_channel="smtp",
                **(r.get("vars", {})),
            )
            if ok:
                stats["sent"] += 1
            else:
                stats["failed"] += 1
            if is_bounced(r["email"]):
                stats["bounced"] += 1

        if idx < len(batches) - 1:
            logger.info(f"[Batch] Batch {idx + 1} done. Sleeping {SMTP_BATCH_DELAY}s before next batch...")
            time.sleep(SMTP_BATCH_DELAY)

    logger.info(f"[Batch] Complete — sent={stats['sent']}, failed={stats['failed']}, bounced={stats['bounced']}")
    return stats
