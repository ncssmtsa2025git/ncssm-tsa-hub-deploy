from fastapi import APIRouter, Depends, HTTPException
from typing import List

from utils import verify_token, verify_admin_jwt
from models.checkin import CheckinCreate, Checkin
import database

router = APIRouter()


async def _user_is_on_team(user_id: str, team_id: str) -> bool:
    # lightweight async check: captain or member
    team = await database.get_team_by_id(team_id)
    if not team:
        return False
    if team.captain and getattr(team.captain, "id", None) == user_id:
        return True
    for m in team.members or []:
        if getattr(m, "id", None) == user_id:
            return True
    return False


@router.post("/teams/{team_id}/checkins", response_model=Checkin)
async def create_checkin_endpoint(team_id: str, payload: CheckinCreate, user_id: str = Depends(verify_token)):
    # Only allow team members or captain to submit
    # If you prefer open submission, remove this check
    if not await _user_is_on_team(user_id, team_id):
        raise HTTPException(status_code=403, detail="User not authorized to submit checkin for this team")

    return await database.create_checkin(team_id, payload)


@router.get("/teams/{team_id}/checkins", response_model=List[Checkin])
async def list_team_checkins(team_id: str):
    return await database.get_checkins_by_team(team_id)


@router.get("/checkins/{checkin_id}", response_model=Checkin)
async def get_checkin(checkin_id: str):
    c = await database.get_checkin_by_id(checkin_id)
    if not c:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return c


@router.delete("/checkins/{checkin_id}")
async def delete_checkin(checkin_id: str, _=Depends(verify_admin_jwt)):
    success = await database.delete_checkin(checkin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return {"deleted": True}
