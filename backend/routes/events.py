from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.event import Event
from database import create_event, get_event_by_id, list_events, update_event, delete_event
from utils import verify_token, verify_admin_jwt

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=Event)
async def add_event(event: Event, admin: None = Depends(verify_admin_jwt)):
    return await create_event(event.model_dump(exclude_unset=True))

@router.get("/{event_id}", response_model=Event)
async def fetch_event(event_id: str):
    event = await get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=Event)
async def update_event_route(event_id: str, event: Event, admin: None = Depends(verify_admin_jwt)):
    return await update_event(event_id, event.model_dump(exclude_unset=True))


@router.delete("/{event_id}")
async def delete_event_route(event_id: str, admin: None = Depends(verify_admin_jwt)):
    ok = await delete_event(event_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Event not found or already deleted")
    return {"deleted": event_id}

@router.get("/", response_model=List[Event])
async def fetch_all_events():
    return await list_events()
