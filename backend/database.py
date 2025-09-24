from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from models.user import User
from models.event import Event

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def get_user_by_google_id(google_id: str) -> Optional[User]:
    try:
        response = supabase.table("users").select("*").eq("google_id", google_id).execute()
        if response.data:
            return User(**response.data[0])
        return None
    except Exception as e:
        print(f"Error fetching user by Google ID: {e}")
        return None


async def get_user_by_id(user_id: str) -> Optional[User]:
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        return None
    except Exception as e:
        print(f"Error fetching user by ID: {e}")
        return None


async def create_user(user_data: dict) -> User:
    try:
        user_data["created_at"] = datetime.utcnow().isoformat()
        user_data["updated_at"] = datetime.utcnow().isoformat()

        response = supabase.table("users").insert(user_data).execute()
        if response.data:
            return User(**response.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to create user")
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def update_user(user_id: str, user_data: dict) -> User:
    try:
        user_data["updated_at"] = datetime.utcnow().isoformat()

        response = supabase.table("users").update(user_data).eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    

async def create_event(event_data: dict) -> Event:
    try:
        response = supabase.table("events").insert(event_data).execute()
        if response.data:
            return Event(**response.data[0])
        else:
            raise HTTPException(status_code=500, detail="Failed to create event")
    except Exception as e:
        print(f"Error creating event: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def get_event_by_id(event_id: str) -> Optional[Event]:
    try:
        response = supabase.table("events").select("*").eq("id", event_id).execute()
        if response.data:
            return Event(**response.data[0])
        return None
    except Exception as e:
        print(f"Error fetching event: {e}")
        return None


async def list_events() -> list[Event]:
    try:
        response = supabase.table("events").select("*").order("id", desc=True).execute()
        return [Event(**e) for e in response.data] if response.data else []
    except Exception as e:
        print(f"Error listing events: {e}")
        return []
