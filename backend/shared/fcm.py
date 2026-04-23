import os
import json
import logging
from firebase_admin import initialize_app, messaging, credentials, get_app

logger = logging.getLogger(__name__)

_firebase_app = None


def init_firebase():
    """Initialize Firebase Admin SDK from service account JSON."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")

    if not sa_path and not sa_json:
        logger.warning("Firebase credentials not set — push notifications disabled")
        return None

    try:
        if sa_json:
            import json
            cred_dict = json.loads(sa_json)
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate(sa_path)
        _firebase_app = initialize_app(cred)
        logger.info("Firebase Admin SDK initialized")
        return _firebase_app
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")
        return None


def send_push(token, title, body, data=None):
    """Send FCM push notification to a single device.

    Args:
        token: FCM registration token
        title: Notification title
        body: Notification body text
        data: Optional dict of key-value data payload

    Returns:
        True if sent successfully, False otherwise.
    """
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=token,
            android=messaging.AndroidConfig(priority="high"),
        )
        messaging.send(message)
        logger.info(f"Push sent to {token[:12]}...")
        return True
    except messaging.UnregisteredError:
        logger.warning(f"Token unregistered: {token[:12]}...")
        return False
    except Exception as e:
        logger.error(f"Push failed: {e}")
        return False


def send_push_batch(tokens, title, body, data=None):
    if not tokens:
        return {"success": 0, "failure": 0}

    cleaned = [t.strip() for t in tokens if t and isinstance(t, str) and t.strip()]
    if not cleaned:
        logger.warning("send_push_batch: no valid tokens after cleaning")
        return {"success": 0, "failure": 0}

    logger.info(f"send_push_batch: {len(cleaned)}/{len(tokens)} valid tokens, sending...")

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        tokens=cleaned,
        android=messaging.AndroidConfig(priority="high"),
    )

    try:
        batch_response = messaging.send_each_for_multicast(message)
        return {"success": batch_response.success_count, "failure": batch_response.failure_count}
    except Exception as e:
        logger.error(f"Batch push failed: {e}")
        return {"success": 0, "failure": len(cleaned)}
