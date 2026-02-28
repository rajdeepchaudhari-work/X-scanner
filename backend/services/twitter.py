import os
import logging
from datetime import datetime, timezone

import httpx

from database import get_db

logger = logging.getLogger(__name__)

TWITTER_URL = "https://api.twitterapi.io/twitter/tweet/advanced_search"


def build_query(usernames: list[str]) -> str:
    from_parts = " OR ".join(f"from:{u}" for u in usernames)
    return f"({from_parts})"


async def _call_twitter_api(query: str, api_key: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            TWITTER_URL,
            headers={"X-API-Key": api_key},
            params={"query": query, "queryType": "Latest"},
        )
        response.raise_for_status()
        data = response.json()
        return data.get("tweets", [])


async def fetch_and_store_tweets() -> dict:
    api_key = os.getenv("TWITTER_API_KEY", "")
    if not api_key:
        logger.warning("TWITTER_API_KEY not set — skipping fetch")
        return {"error": "TWITTER_API_KEY not configured", "fetched": 0, "stored_new": 0}

    with get_db() as conn:
        rows = conn.execute("SELECT username FROM accounts").fetchall()
        usernames = [r["username"] for r in rows]

    if not usernames:
        logger.info("No accounts configured — skipping fetch")
        return {"fetched": 0, "stored_new": 0, "message": "No accounts configured"}

    query = build_query(usernames)
    logger.info("Fetching tweets for query: %s", query)

    try:
        tweets = await _call_twitter_api(query, api_key)
    except httpx.HTTPStatusError as exc:
        logger.error("Twitter API HTTP error: %s", exc)
        return {"error": f"API error {exc.response.status_code}", "fetched": 0, "stored_new": 0}
    except Exception as exc:
        logger.error("Twitter API error: %s", exc)
        return {"error": str(exc), "fetched": 0, "stored_new": 0}

    now = datetime.now(timezone.utc).isoformat()
    new_count = 0

    with get_db() as conn:
        for t in tweets:
            try:
                conn.execute(
                    """
                    INSERT INTO tweets (id, text, author, created_at, processed, fetched_at)
                    VALUES (?, ?, ?, ?, 0, ?)
                    """,
                    (
                        t["id"],
                        t["text"],
                        t["author"]["userName"],
                        t["createdAt"],
                        now,
                    ),
                )
                new_count += 1
            except Exception:
                # Duplicate tweet id — skip silently
                continue
        conn.commit()

    logger.info("Fetched %d tweets, stored %d new", len(tweets), new_count)
    return {"fetched": len(tweets), "stored_new": new_count}
