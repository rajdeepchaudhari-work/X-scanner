import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from services.twitter import fetch_and_store_tweets

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="UTC")

DEFAULT_INTERVAL = 2  # minutes


def start_scheduler(interval_minutes: int = DEFAULT_INTERVAL) -> None:
    scheduler.add_job(
        fetch_and_store_tweets,
        trigger="interval",
        minutes=interval_minutes,
        id="tweet_fetch",
        replace_existing=True,
        misfire_grace_time=30,
    )
    scheduler.start()
    logger.info("Scheduler started — polling every %d minute(s)", interval_minutes)


def update_interval(minutes: int) -> None:
    """Reschedule the fetch job with a new interval without restarting."""
    if scheduler.running:
        scheduler.reschedule_job(
            "tweet_fetch",
            trigger="interval",
            minutes=minutes,
        )
        logger.info("Scheduler interval updated to %d minute(s)", minutes)
    else:
        logger.warning("Scheduler is not running — interval not updated")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
