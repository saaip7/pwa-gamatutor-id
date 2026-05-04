import logging
import re
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Email validation — only gmail.com and mail.ugm.ac.id are accepted
# ---------------------------------------------------------------------------
_ALLOWED_DOMAINS = {"gmail.com", "mail.ugm.ac.id"}
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")


def is_valid_email(email):
    """Return True if *email* has valid format AND domain is whitelisted."""
    if not email:
        return False
    email = email.strip().lower()
    if not _EMAIL_RE.match(email):
        return False
    domain = email.rsplit("@", 1)[-1]
    return domain in _ALLOWED_DOMAINS


def should_skip_email(email, role=None):
    """Return True if we should NOT send email to this address.

    Reasons to skip:
      - invalid format or non-whitelisted domain
      - user role is 'admin'
    """
    if not is_valid_email(email):
        return True
    if role == "admin":
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


def send_email(to_email, subject, body_html=None, body_text=None):
    """Send email via Resend API (HTTPS), falling back to SMTP.

    Resend works on Railway free tier because it uses HTTPS (port 443)
    instead of raw SMTP which Railway blocks on non-Pro plans.
    """
    from_email = Config.RESEND_FROM or Config.SMTP_FROM

    # --- Try Resend first (with retry on rate limit) ---
    client = _get_resend_client()
    if client:
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
                        logger.warning(f"[Resend] Failed to send to {to_email}: {send_err} — falling back to SMTP")
                        break
        except Exception as e:
            logger.warning(f"[Resend] Unexpected error for {to_email}: {e} — falling back to SMTP")

    # --- Fallback: SMTP ---
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
        logger.error(f"[SMTP] Failed to send email to {to_email}: {e}")
        return False


def send_templated_email(to_email, template_name, **kwargs):
    """Send an email using a template from shared.email_templates.

    Args:
        to_email: recipient email address
        template_name: name of the template function in email_templates
        **kwargs: variables passed to the template

    Returns True on success, False on failure.
    """
    try:
        from shared import email_templates
        render = getattr(email_templates, template_name, None)
        if not render:
            logger.error(f"Email template '{template_name}' not found")
            return False
        subject, body_html, body_text = render(**kwargs)
        return send_email(to_email, subject, body_html, body_text)
    except Exception as e:
        logger.error(f"Failed to render/send templated email '{template_name}': {e}")
        return False
