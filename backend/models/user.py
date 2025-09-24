from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class User(BaseModel):
    id: Optional[str] = None
    email: str
    name: str
    picture: Optional[str] = None
    google_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GoogleUserInfo(BaseModel):
    id: str
    email: str
    name: str
    picture: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int