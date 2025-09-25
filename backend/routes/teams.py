from fastapi import APIRouter, Depends, HTTPException
from typing import List

from models.team import Team
from models.user import User
from database import create_team, get_team_by_id, list_teams, list_user_teams
from utils import verify_token

router = APIRouter(
    prefix="/teams",
    tags=["teams"]
)


# Create team
@router.post("/", response_model=Team)
async def create_team_route(team_data: dict, user_id: str = Depends(verify_token)):
    return await create_team(team_data)


# Get all teams
@router.get("/", response_model=List[Team])
async def list_teams_route():
    return await list_teams()


# Get teams for current user
@router.get("/me", response_model=List[Team])
async def list_my_teams_route(user_id: str = Depends(verify_token)):
    return await list_user_teams(user_id)


# Get team by id
@router.get("/{team_id}", response_model=Team)
async def get_team_route(team_id: str):
    team = await get_team_by_id(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team
