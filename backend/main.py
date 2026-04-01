import logging
from contextlib import asynccontextmanager

import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import get_db, init_db


def verify_api_key(request: Request) -> None:
    """Reject requests that don't carry the correct X-API-Key header.
    If API_KEY is not set in env, all requests are allowed (dev mode)."""
    expected = os.getenv("API_KEY")
    if not expected:
        return
    key = request.headers.get("X-API-Key")
    if key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
from routes import accounts, fetch, memory, settings, tweets
from services.scheduler import start_scheduler, stop_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Restore saved poll interval from DB (falls back to 2 min default)
    with get_db() as conn:
        row = conn.execute(
            "SELECT value FROM settings WHERE key = 'poll_interval_minutes'"
        ).fetchone()
        interval = int(row["value"]) if row else 2
    start_scheduler(interval_minutes=interval)
    yield
    stop_scheduler()


app = FastAPI(
    title="X Scanner API",
    version="1.0.0",
    description="Twitter AI Monitoring Dashboard backend",
    lifespan=lifespan,
    dependencies=[Depends(verify_api_key)],
)

_cors_origins = [
    "http://localhost:3000",
    # Add your production frontend URL here
    # Additional origins can be added via CORS_ORIGINS env var (comma-separated)
    *[o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(tweets.router)
app.include_router(memory.router)
app.include_router(fetch.router)
app.include_router(settings.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
