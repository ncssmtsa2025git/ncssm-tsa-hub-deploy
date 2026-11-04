from datetime import datetime
from typing import Annotated, List, Optional
from pydantic import BaseModel, Field, HttpUrl


# Only plain http(s) links, capped in count and length (the client check is bypassable).
CheckinLink = Annotated[str, Field(max_length=2048, pattern=r"(?i)^https?://.+$")]


class CheckinCreate(BaseModel):
    links: List[CheckinLink] = Field(min_length=1, max_length=10)


class CheckinGrade(BaseModel):
    score: int = Field(ge=0, le=100)
    feedback: Optional[str] = None


class Checkin(BaseModel):
    id: str
    team_id: str
    submitted_at: datetime
    links: List[str]
    created_at: datetime
    approved: Optional[bool] = False
    approved_at: Optional[datetime] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    graded_at: Optional[datetime] = None
