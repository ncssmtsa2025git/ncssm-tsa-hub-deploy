from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from models.team import Team
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


async def update_event(event_id: str, event_data: dict) -> Event:
    try:
        response = supabase.table("events").update(event_data).eq("id", event_id).execute()
        if response.data:
            return Event(**response.data[0])
        else:
            raise HTTPException(status_code=404, detail="Event not found")
    except Exception as e:
        print(f"Error updating event: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def delete_event(event_id: str) -> bool:
    try:
        response = supabase.table("events").delete().eq("id", event_id).execute()
        # Supabase returns data for deleted rows; if none, treat as not found
        return bool(response.data)
    except Exception as e:
        print(f"Error deleting event: {e}")
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


async def list_users() -> list[User]:
    try:
        response = supabase.table("users").select("*").order("created_at", desc=False).execute()
        return [r for r in response.data] if response.data else []
    except Exception as e:
        print(f"Error listing users: {e}")
        return []
    
async def create_team(team_data: dict) -> Team:
    """
    Expects team_data to have:
    {
        "event_id": str,
        "team_number": str,
        "conference": str,
        "captain_id": str,
        "check_in_date": Optional[str],
        "member_ids": List[str]
    }
    """
    try:
        # Insert team
        response = supabase.table("teams").insert({
            "event_id": team_data["event_id"],
            "team_number": team_data["team_number"],
            "conference": team_data["conference"],
            "captain_id": team_data["captain_id"],
            "check_in_date": team_data.get("check_in_date")
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create team")

        team_row = response.data[0]
        team_id = team_row["id"]

        # Insert members
        member_ids = team_data.get("member_ids", [])
        for uid in member_ids:
            supabase.table("team_members").insert({
                "team_id": team_id,
                "user_id": uid
            }).execute()

        # Return hydrated team
        return await get_team_by_id(team_id)

    except Exception as e:
        print(f"Error creating team: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def get_team_by_id(team_id: str) -> Optional[Team]:
    try:
        # Base team row
        team_res = supabase.table("teams").select("*").eq("id", team_id).execute()
        if not team_res.data:
            return None
        team_row = team_res.data[0]

        # Event
        event = await get_event_by_id(team_row["event_id"])

        # Captain
        captain = await get_user_by_id(team_row["captain_id"])

        # Members
        member_links = supabase.table("team_members").select("*").eq("team_id", team_id).execute()
        members = []
        for ml in member_links.data:
            u = await get_user_by_id(ml["user_id"])
            if u:
                members.append(u)

        return Team(
            id=team_row["id"],
            event=event,
            teamNumber=team_row["team_number"],
            conference=team_row["conference"],
            captain=captain,
            members=members,
            checkInDate=team_row.get("check_in_date")
        )
    except Exception as e:
        print(f"Error fetching team by ID: {e}")
        return None


async def list_teams() -> list[Team]:
    try:
        response = supabase.table("teams").select("id").execute()
        team_ids = [row["id"] for row in response.data] if response.data else []
        teams = []
        for tid in team_ids:
            team = await get_team_by_id(tid)
            if team:
                teams.append(team)
        return teams
    except Exception as e:
        print(f"Error listing teams: {e}")
        return []


# Whitelist helpers
async def is_email_whitelisted(email: str) -> bool:
    try:
        response = supabase.table("whitelist").select("email").eq("email", email.lower()).execute()
        return bool(response.data)
    except Exception as e:
        print(f"Error checking whitelist for {email}: {e}")
        return False


async def list_whitelist() -> list[str]:
    try:
        response = supabase.table("whitelist").select("email").order("added_at", desc=False).execute()
        return [row["email"] for row in response.data] if response.data else []
    except Exception as e:
        print(f"Error listing whitelist: {e}")
        return []


async def add_whitelist_email(email: str) -> bool:
    try:
        row = {"email": email.lower()}
        response = supabase.table("whitelist").insert(row).execute()
        return bool(response.data)
    except Exception as e:
        print(f"Error adding to whitelist: {e}")
        return False


async def remove_whitelist_email(email: str) -> bool:
    try:
        response = supabase.table("whitelist").delete().eq("email", email.lower()).execute()
        return True
    except Exception as e:
        print(f"Error removing from whitelist: {e}")
        return False


async def list_user_teams(user_id: str) -> list[Team]:
    """
    Get all teams where user is a captain or a member
    """
    try:
        # Teams where user is captain
        captain_res = supabase.table("teams").select("id").eq("captain_id", user_id).execute()
        captain_team_ids = [r["id"] for r in captain_res.data] if captain_res.data else []

        # Teams where user is a member
        member_res = supabase.table("team_members").select("team_id").eq("user_id", user_id).execute()
        member_team_ids = [r["team_id"] for r in member_res.data] if member_res.data else []

        all_ids = set(captain_team_ids + member_team_ids)
        teams = []
        for tid in all_ids:
            team = await get_team_by_id(tid)
            if team:
                teams.append(team)
        return teams
    except Exception as e:
        print(f"Error listing user teams: {e}")
        return []
