from fastapi import APIRouter

from services.twitter import fetch_and_store_tweets

router = APIRouter(tags=["fetch"])


@router.post("/fetch")
async def manual_fetch():
    result = await fetch_and_store_tweets()
    return result
