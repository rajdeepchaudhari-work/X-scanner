from fastapi import APIRouter, Query

from database import get_db

router = APIRouter(prefix="/tweets", tags=["tweets"])


@router.get("/new")
def get_new_tweets(limit: int = Query(default=50, le=200)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, text, author, created_at, fetched_at
            FROM tweets
            WHERE processed = 0
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return {"tweets": [dict(r) for r in rows]}


@router.get("")
def get_all_tweets(limit: int = Query(default=50, le=200)):
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, text, author, created_at, processed, fetched_at
            FROM tweets
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        result = []
        for r in rows:
            row = dict(r)
            row["processed"] = bool(row["processed"])
            result.append(row)
        return {"tweets": result}
