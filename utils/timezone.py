from __future__ import annotations

from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))


def now_kst() -> datetime:
    return datetime.now(tz=KST)
