from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import re
from typing import Literal, Optional
from urllib.parse import quote, urlencode
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
    add_whitelist_emails,
    remove_whitelist_email,
    list_users,
    is_admin_email,
    list_admins,
    add_admin,
    remove_admin,
)
from utils import (
    create_access_token,
    verify_token,
    verify_admin_password,
    create_admin_token,
    verify_admin_jwt,
    create_oauth_state,
    read_oauth_state,
)

import os

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

# Config
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")
REDIRECT_RESPONSE_URL = os.getenv("REDIRECT_RESPONSE_URL", "http://localhost:3000/auth/success")
# Where officers land after signing in to the admin panel with Google
ADMIN_REDIRECT_URL = os.getenv("ADMIN_REDIRECT_URL", "https://ncssm-tsa-hub-admin.vercel.app/login")

JWT_EXPIRATION_HOURS = 24

# --- Helper functions ---
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
async def login(purpose: Literal["member", "admin"] = "member"):
    """Google sign-in URL for members (website) or officers (admin panel). Both use the same callback."""
    state = create_oauth_state(purpose)
    google_auth_url = "https://accounts.google.com/o/oauth2/auth?" + urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "response_type": "code",
        "state": state,
        "prompt": "select_account",
    })
    return {"auth_url": google_auth_url, "state": state}


def _login_error_redirect(reason: str, base: str = REDIRECT_RESPONSE_URL) -> RedirectResponse:
    # The website's /auth/success page and the admin login page turn this into a readable message
    return RedirectResponse(url=f"{base}#error={quote(reason)}")


@router.get("/callback")
async def auth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    # Only accept sign-ins this API started (signed, 10-minute state)
    purpose = read_oauth_state(state)
    if purpose is None:
        return _login_error_redirect("expired")
    base = ADMIN_REDIRECT_URL if purpose == "admin" else REDIRECT_RESPONSE_URL

    # Google sends ?error=access_denied (and no code) when the user cancels
    if error or not code:
        return _login_error_redirect(error or "missing_code", base)

    # Exchange code for token
    token_data = await exchange_code_for_token(code)
    access_token = token_data["access_token"]

    # Get user info
    google_user = await get_google_user_info(access_token)

    # Only trust addresses Google has verified, otherwise the whitelist check means nothing
    if not google_user.verified_email:
        return _login_error_redirect("unverified_email", base)

    # Officers signing in to the admin panel: must be on the admins list
    if purpose == "admin":
        if not await is_admin_email(google_user.email):
            print(f"Admin sign-in refused for: {google_user.email}")
            return _login_error_redirect("not_admin", base)
        token = create_admin_token(google_user.email.lower())
        return RedirectResponse(url=f"{base}#admin_token={token}")

    # Enforce whitelist membership via Supabase
    allowed = await is_email_whitelisted(google_user.email)
    if not allowed:
        print(f"Unauthorized login attempt for: {google_user.email}")
        return _login_error_redirect("not_whitelisted")

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

    # Instead of setting a cookie, redirect with token in URL fragment so frontend JS can read it
    # e.g. REDIRECT_RESPONSE_URL#access_token=<token>
    redirect_url = f"{REDIRECT_RESPONSE_URL}#access_token={jwt_token}"
    return RedirectResponse(url=redirect_url)

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


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class WhitelistBulkRequest(BaseModel):
    emails: list[str]


@router.post("/whitelist/bulk")
async def add_whitelist_bulk(payload: WhitelistBulkRequest, admin: None = Depends(verify_admin_jwt)):
    """Add many emails in one request; duplicates and malformed entries are reported, not fatal."""
    cleaned = list(dict.fromkeys(e.strip().lower() for e in payload.emails if e.strip()))
    valid = [e for e in cleaned if EMAIL_RE.match(e)]
    added = await add_whitelist_emails(valid)
    return {
        "added": added,
        "already": [e for e in valid if e not in added],
        "invalid": [e for e in cleaned if not EMAIL_RE.match(e)],
    }


@router.delete("/whitelist")
async def delete_whitelist(email: str, admin: None = Depends(verify_admin_jwt)):
    ok = await remove_whitelist_email(email)
    if not ok:
        raise HTTPException(status_code=500, detail="Failed to remove email")
    return {"removed": email}



class AdminEmail(BaseModel):
    email: str


def _require_google_admin(admin: Optional[str]) -> None:
    # Chapter-password sessions have no identity; they must not be able to grant themselves lasting access
    if not admin:
        raise HTTPException(status_code=403, detail="Sign in with Google to change the admin list")


@router.get("/admins")
async def get_admins(admin: Optional[str] = Depends(verify_admin_jwt)):
    """Admin-only: who can sign in to the admin panel. `me` is the caller's email (None for password sessions)."""
    return {"admins": await list_admins(), "me": admin}


@router.post("/admins")
async def post_admin(payload: AdminEmail, admin: Optional[str] = Depends(verify_admin_jwt)):
    _require_google_admin(admin)
    email = payload.email.strip().lower()
    if not EMAIL_RE.match(email) or len(email) > 120:
        raise HTTPException(status_code=422, detail="Enter a valid email address")
    await add_admin(email)
    return {"added": email}


@router.delete("/admins")
async def delete_admin(email: str, admin: Optional[str] = Depends(verify_admin_jwt)):
    _require_google_admin(admin)
    email = email.strip().lower()
    admins = await list_admins()
    if email not in admins:
        raise HTTPException(status_code=404, detail="Not an admin")
    if len(admins) == 1:
        raise HTTPException(status_code=409, detail="Can't remove the last admin")
    if email == admin:
        raise HTTPException(status_code=409, detail="You can't remove yourself; ask another admin")
    await remove_admin(email)
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
async def logout():
    # With header-based JWTs the client should discard the token locally.
    # Server-side no-op for stateless JWTs (unless you implement revocation).
    return {"message": "Logged out successfully"}
