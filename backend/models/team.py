from pydantic import BaseModel, Field
from typing import List
from models.user import User
from models.event import Event

class Team(BaseModel):
    id: str | None = None
    event: Event = Field(..., alias="event")
    team_number: str = Field(..., alias="teamNumber")
    conference: str
    members: List[User]
    captain: User
    check_in_date: str = Field(..., alias="checkInDate")

    class Config:
        populate_by_name = True 
        from_attributes = True