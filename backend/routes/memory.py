import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from database import get_db
from models import MemoryCreate

router = APIRouter(prefix="/memory", tags=["memory"])


@router.post("")
def store_memory(mem: MemoryCreate):
    with get_db() as conn:
        tweet = conn.execute(
            "SELECT id FROM tweets WHERE id = ?", (mem.tweet_id,)
        ).fetchone()
        if not tweet:
            raise HTTPException(status_code=404, detail="Tweet not found")

        memory_id = str(uuid.uuid4())
        conn.execute(
            """
            INSERT INTO memory (id, tweet_id, interpretation, tags, importance, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                memory_id,
                mem.tweet_id,
                mem.interpretation,
                ",".join(mem.tags),
                mem.importance,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.execute(
            "UPDATE tweets SET processed = 1 WHERE id = ?", (mem.tweet_id,)
        )
        conn.commit()

    return {"status": "stored", "id": memory_id}


@router.get("")
def get_memory(limit: int = Query(default=50, le=200)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT
                m.id, m.tweet_id, m.interpretation, m.tags,
                m.importance, m.created_at,
                t.text AS tweet_text, t.author AS tweet_author
            FROM memory m
            LEFT JOIN tweets t ON m.tweet_id = t.id
            ORDER BY m.created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

        entries = []
        for r in rows:
            row = dict(r)
            row["tags"] = [t for t in row["tags"].split(",") if t] if row["tags"] else []
            entries.append(row)

        return {"memory": entries}
