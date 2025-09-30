from datetime import datetime
from typing import Optional, Union, Any
from pydantic import BaseModel as PydanticBaseModel
from fastapi import HTTPException
from supabase import create_client, Client
import os
from dotenv import load_dotenv

from models.team import Team
from models.user import User
from models.event import Event
from models.checkin import Checkin, CheckinCreate

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
    
async def create_team(team_data: Union[dict, PydanticBaseModel]) -> Team:
    """
    Accepts either a dict or a Pydantic Team model. Frontend may send nested objects
    for `event`, `captain`, and `members`; this function extracts the IDs and
    normalizes the insert.
    """
    try:
        if isinstance(team_data, PydanticBaseModel):
            td = team_data.model_dump(by_alias=True, exclude_unset=True)
        else:
            td = dict(team_data)

        # Extract event_id
        event_id = td.get("event").get("id")
       
        captain_id = td.get("captain").get("id")

        members = td.get("members")
        member_ids = []
        for m in members:
            uid = m.get("id")
            if uid:
                member_ids.append(uid)

        if not event_id:
            raise HTTPException(status_code=400, detail="Missing event_id")
        if not captain_id:
            raise HTTPException(status_code=400, detail="Missing captain_id")

        # Normalize team_number and check_in_date accepting both snake_case and alias keys
        team_number = td.get("team_number") or td.get("teamNumber")
        conference = td.get("conference")
        check_in_date = td.get("check_in_date") or td.get("checkInDate")

        if not team_number:
            raise HTTPException(status_code=400, detail="Missing team_number (teamNumber)")
        if not conference:
            raise HTTPException(status_code=400, detail="Missing conference")

        response = supabase.table("teams").insert({
            "event_id": event_id,
            "team_number": team_number,
            "conference": conference,
            "captain_id": captain_id,
            "check_in_date": check_in_date
        }).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create team")

        team_row = response.data[0]
        team_id = team_row["id"]

        # Insert members
        member_ids = member_ids or []
        for uid in member_ids:
            supabase.table("team_members").insert({
                "team_id": team_id,
                "user_id": uid
            }).execute()

        # Return hydrated team
        return await get_team_by_id(team_id)

    except HTTPException:
        raise
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


async def update_team(team_id: str, team_data: Union[dict, PydanticBaseModel]) -> Team:
    try:
        # Normalize input like create_team
        if isinstance(team_data, PydanticBaseModel):
            td = team_data.model_dump(by_alias=True, exclude_unset=True)
        else:
            td = dict(team_data)

        # Extract captain_id if nested
        captain_id = td.get("captain_id")
        if not captain_id and td.get("captain"):
            cap = td.get("captain")
            captain_id = cap.get("id") if isinstance(cap, dict) else getattr(cap, "id", None)

        # Extract member_ids if nested
        member_ids = td.get("member_ids")
        if member_ids is None and td.get("members") is not None:
            members = td.get("members")
            member_ids = []
            for m in members:
                if isinstance(m, dict):
                    uid = m.get("id") or m.get("user_id") or m.get("google_id")
                else:
                    uid = getattr(m, "id", None) or getattr(m, "user_id", None) or getattr(m, "google_id", None)
                if uid:
                    member_ids.append(uid)

        # Accept alias keys
        team_number = td.get("team_number") or td.get("teamNumber")
        conference = td.get("conference")
        check_in_date = td.get("check_in_date") or td.get("checkInDate")

        update_payload: dict[str, Any] = {}
        if team_number is not None:
            update_payload["team_number"] = team_number
        if conference is not None:
            update_payload["conference"] = conference
        if captain_id is not None:
            update_payload["captain_id"] = captain_id
        if check_in_date is not None:
            update_payload["check_in_date"] = check_in_date
        if "updated_at" in td:
            update_payload["updated_at"] = td["updated_at"]

        if not update_payload and member_ids is None:
            # Nothing to update
            return await get_team_by_id(team_id)

        if update_payload:
            response = supabase.table("teams").update(update_payload).eq("id", team_id).execute()
            if not response.data:
                raise HTTPException(status_code=404, detail="Team not found")

        # Optionally update members: remove and re-insert
        if member_ids is not None:
            supabase.table("team_members").delete().eq("team_id", team_id).execute()
            for uid in member_ids:
                supabase.table("team_members").insert({"team_id": team_id, "user_id": uid}).execute()

        return await get_team_by_id(team_id)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating team: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def delete_team(team_id: str) -> bool:
    try:
        # Delete team members first
        supabase.table("team_members").delete().eq("team_id", team_id).execute()
        response = supabase.table("teams").delete().eq("id", team_id).execute()
        return bool(response.data)
    except Exception as e:
        print(f"Error deleting team: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def create_checkin(team_id: str, checkin_data: Union[dict, PydanticBaseModel]) -> Checkin:
    """Insert a checkin linked to a team. Expects links as list[str] or list[HttpUrl]."""
    try:
        # normalize
        if isinstance(checkin_data, PydanticBaseModel):
            cd = checkin_data.model_dump(by_alias=True, exclude_unset=True)
        else:
            cd = dict(checkin_data)

        links = cd.get("links")
        if not isinstance(links, list) or not links:
            raise HTTPException(status_code=400, detail="`links` must be a non-empty list of URLs")

        payload = {
            "team_id": team_id,
            "links": links,
            # let DB default submitted_at/created_at if present
        }

        response = supabase.table("checkins").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create checkin")

        row = response.data[0]
        return await get_checkin_by_id(row["id"])
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating checkin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def get_checkins_by_team(team_id: str) -> list[Checkin]:
    try:
        response = supabase.table("checkins").select("*").eq("team_id", team_id).order("created_at", desc=True).execute()
        if not response.data:
            return []
        checkins = []
        for r in response.data:
            checkins.append(Checkin(
                id=r["id"],
                team_id=r["team_id"],
                submitted_at=r.get("submitted_at") or r.get("created_at"),
                links=r.get("links", []),
                created_at=r.get("created_at")
            ))
        return checkins
    except Exception as e:
        print(f"Error fetching checkins for team {team_id}: {e}")
        return []


async def get_checkin_by_id(checkin_id: str) -> Optional[Checkin]:
    try:
        response = supabase.table("checkins").select("*").eq("id", checkin_id).execute()
        if not response.data:
            return None
        r = response.data[0]
        return Checkin(
            id=r["id"],
            team_id=r["team_id"],
            submitted_at=r.get("submitted_at") or r.get("created_at"),
            links=r.get("links", []),
            created_at=r.get("created_at")
        )
    except Exception as e:
        print(f"Error fetching checkin by ID: {e}")
        return None


async def delete_checkin(checkin_id: str) -> bool:
    try:
        response = supabase.table("checkins").delete().eq("id", checkin_id).execute()
        return bool(response.data)
    except Exception as e:
        print(f"Error deleting checkin: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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
