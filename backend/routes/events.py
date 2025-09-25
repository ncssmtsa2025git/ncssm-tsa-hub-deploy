from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.event import Event
from database import create_event, get_event_by_id, list_events
from utils import verify_token

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=Event)
# async def add_event(event: Event):
#     return await create_event(event.model_dump(exclude_unset=True))
async def add_event(event: Event, user_id: str = Depends(verify_token)):
    return await create_event(event.model_dump(exclude_unset=True))

@router.get("/{event_id}", response_model=Event)
async def fetch_event(event_id: str):
    event = await get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.get("/", response_model=List[Event])
async def fetch_all_events():
    return await list_events()
