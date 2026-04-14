"""Timezone utilities — all BE times stored as UTC, displayed as WIB (UTC+7)."""
from datetime import datetime, timedelta

WIB_OFFSET = timedelta(hours=7)


def utc_to_wib(dt: datetime) -> datetime:
    """Convert a UTC datetime to WIB (UTC+7)."""
    if dt is None:
        return None
    return dt + WIB_OFFSET


def now_wib() -> datetime:
    """Return current time in WIB (UTC+7)."""
    return datetime.utcnow() + WIB_OFFSET
