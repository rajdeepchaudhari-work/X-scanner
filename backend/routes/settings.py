from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

from database import get_db
from services.scheduler import update_interval as scheduler_update_interval

router = APIRouter(prefix="/settings", tags=["settings"])

_DEFAULT_INTERVAL = 2  # minutes


class SettingsUpdate(BaseModel):
    poll_interval_minutes: int = Field(ge=1, le=60, description="How often to fetch tweets (1–60 min)")


def _get_interval(conn) -> int:
    row = conn.execute(
        "SELECT value FROM settings WHERE key = 'poll_interval_minutes'"
    ).fetchone()
    return int(row["value"]) if row else _DEFAULT_INTERVAL


@router.get("")
def get_settings():
    with get_db() as conn:
        return {"poll_interval_minutes": _get_interval(conn)}


@router.put("")
def update_settings(body: SettingsUpdate):
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
            """,
            (
                "poll_interval_minutes",
                str(body.poll_interval_minutes),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()

    scheduler_update_interval(body.poll_interval_minutes)
    return {"status": "updated", "poll_interval_minutes": body.poll_interval_minutes}
