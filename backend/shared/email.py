import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

logger = logging.getLogger(__name__)


def send_email(to_email, subject, body_html=None, body_text=None):
    """Send email via SMTP. Returns True on success, False on failure."""
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

        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
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
