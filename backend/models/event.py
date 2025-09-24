from typing import List, Optional
from pydantic import BaseModel, Field


class Event(BaseModel):
    id: str
    title: str
    theme: Optional[str] = None
    full_theme_url: Optional[str] = Field(None, alias="fullThemeUrl")
    description: str
    category: str
    team_size: str = Field(alias="teamSize")
    types: List[str]
    rubric_url: str = Field(alias="rubricUrl")

    class Config:
        populate_by_name = True  # allows using either alias or field name
        from_attributes = True