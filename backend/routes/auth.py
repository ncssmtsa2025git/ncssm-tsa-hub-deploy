from fastapi import APIRouter, HTTPException, Response, Depends
from fastapi.responses import RedirectResponse
import secrets
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel

from models.user import User, GoogleUserInfo
from database import (
    get_user_by_google_id,
    get_user_by_id,
    create_user,
    update_user,
    is_email_whitelisted,
    list_whitelist,
    add_whitelist_email,
    remove_whitelist_email,
    list_users,
)
from utils import create_access_token, verify_token, verify_admin_password, create_admin_token, verify_admin_jwt

import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

# Config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")

ACCESS_COOKIE_NAME = "access_token"
JWT_EXPIRATION_HOURS = 24
ACCESS_COOKIE_MAX_AGE = JWT_EXPIRATION_HOURS * 3600

# --- Helper functions ---
def generate_state() -> str:
    return secrets.token_urlsafe(32)


async def exchange_code_for_token(code: str) -> dict:
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")
        return response.json()


async def get_google_user_info(access_token: str) -> GoogleUserInfo:
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")
        return GoogleUserInfo(**response.json())


# --- Routes ---
@router.get("/login")
async def login():
    state = generate_state()
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"state={state}"
    )
    return {"auth_url": google_auth_url, "state": state}


@router.get("/callback")
async def auth_callback(code: str, state: str, response: Response):
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")

    # Exchange code for token
    token_data = await exchange_code_for_token(code)
    access_token = token_data["access_token"]

    # Get user info
    google_user = await get_google_user_info(access_token)

    # Enforce whitelist membership via Supabase
    allowed = await is_email_whitelisted(google_user.email)
    if not allowed:
        print(f"Unauthorized login attempt for: {google_user.email}")
        raise HTTPException(status_code=403, detail="Email not allowed")

    # Find or create user
    existing_user = await get_user_by_google_id(google_user.id)
    if existing_user:
        user = await update_user(existing_user.id, {
            "name": google_user.name,
            "email": google_user.email,
            "picture": google_user.picture,
        })
    else:
        user = await create_user({
            "email": google_user.email,
            "name": google_user.name,
            "picture": google_user.picture,
            "google_id": google_user.id,
        })

    jwt_token = create_access_token({"sub": user.id, "email": user.email})

    redirect = RedirectResponse(url="http://localhost:3000/auth/success")
    redirect.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_COOKIE_MAX_AGE,
        expires=ACCESS_COOKIE_MAX_AGE,
    )
    return redirect

@router.get("/users")
async def admin_list_users(admin: None = Depends(verify_admin_jwt)):
    """Admin-only: list all users."""
    users = await list_users()
    return {"users": users}

@router.get("/whitelist")
async def get_whitelist(admin: None = Depends(verify_admin_jwt)):
    """List whitelist entries. Protected by admin JWT in `X-Admin-Token` header."""
    return {"whitelist": await list_whitelist()}


@router.post("/whitelist")
async def add_whitelist(email: str, admin: None = Depends(verify_admin_jwt)):
    ok = await add_whitelist_email(email)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to add email")
    return {"added": email}


@router.delete("/whitelist")
async def delete_whitelist(email: str, admin: None = Depends(verify_admin_jwt)):
    ok = await remove_whitelist_email(email)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to remove email")
    return {"removed": email}



class AdminLoginRequest(BaseModel):
    password: str


@router.post("/admin/login")
async def admin_login(payload: AdminLoginRequest):
    """Exchange admin password for a short-lived admin JWT. Send JSON body: {"password":"..."}"""
    if not verify_admin_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    token = create_admin_token()
    return {"admin_token": token}


@router.get("/me", response_model=User)
async def get_current_user(user_id: str = Depends(verify_token)):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(ACCESS_COOKIE_NAME)
    return {"message": "Logged out successfully"}
