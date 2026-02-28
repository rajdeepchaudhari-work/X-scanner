from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from database import get_db
from models import AccountCreate

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("")
def get_accounts():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT username, added_at FROM accounts ORDER BY added_at DESC"
        ).fetchall()
        return {"accounts": [dict(r) for r in rows]}


@router.post("")
def add_account(body: AccountCreate):
    username = body.username.strip().lstrip("@")
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")

    with get_db() as conn:
        existing = conn.execute(
            "SELECT username FROM accounts WHERE username = ?", (username,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Account already exists")

        conn.execute(
            "INSERT INTO accounts (username, added_at) VALUES (?, ?)",
            (username, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()

    return {"status": "added", "username": username}


@router.delete("/{username}")
def delete_account(username: str):
    with get_db() as conn:
        result = conn.execute(
            "DELETE FROM accounts WHERE username = ?", (username,)
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Account not found")

    return {"status": "deleted", "username": username}
