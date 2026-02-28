from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    username: str


class MemoryCreate(BaseModel):
    tweet_id: str
    interpretation: str
    tags: list[str]
    importance: float = Field(ge=0.0, le=1.0)
