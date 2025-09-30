from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl


class CheckinCreate(BaseModel):
    links: List[str]


class Checkin(BaseModel):
    id: str
    team_id: str
    submitted_at: datetime
    links: List[str]
    created_at: datetime
