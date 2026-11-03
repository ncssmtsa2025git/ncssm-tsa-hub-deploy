from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


class CheckinCreate(BaseModel):
    links: List[str]


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
