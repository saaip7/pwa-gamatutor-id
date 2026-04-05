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
    if not sa_path:
        logger.warning("FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled")
        return None

    try:
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
    """Send FCM push to multiple devices.

    Args:
        tokens: List of FCM registration tokens
        title: Notification title
        body: Notification body text
        data: Optional dict of key-value data payload

    Returns:
        Dict with 'success' and 'failure' counts.
    """
    if not tokens:
        return {"success": 0, "failure": 0}

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        tokens=tokens,
        android=messaging.AndroidConfig(priority="high"),
    )

    try:
        response = messaging.send_multicast(message)
        logger.info(f"Batch push: {response.success_count} success, {response.failure_count} failure")
        return {"success": response.success_count, "failure": response.failure_count}
    except Exception as e:
        logger.error(f"Batch push failed: {e}")
        return {"success": 0, "failure": len(tokens)}
