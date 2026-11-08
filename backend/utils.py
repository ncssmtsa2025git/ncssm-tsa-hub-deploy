import os
import secrets
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header, Request, Response
from passlib.context import CryptContext
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Config
# Fail closed: an empty/short secret would let anyone forge tokens (including admin ones).
JWT_SECRET = os.getenv("JWT_SECRET", "")
if len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must be set to at least 32 characters")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")


def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """Verify JWT token from Authorization header (Bearer) and return user_id (sub).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = parts[1]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# Admin helpers
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_admin_password(password: str) -> bool:
    """Verify plain admin password against the stored ADMIN_TOKEN hash.

    If `ADMIN_TOKEN` is not set, verification fails.
    """
    if not ADMIN_TOKEN:
        return False
    try:
        return pwd_context.verify(password, ADMIN_TOKEN)
    except Exception:
        return False


def create_admin_token(email: Optional[str] = None, exp_minutes: int = 60) -> str:
    """Create a short-lived JWT for admin sessions (email is set for Google sign-ins)."""
    to_encode = {"role": "admin"}
    if email:
        to_encode["email"] = email
    expire = datetime.utcnow() + timedelta(minutes=exp_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_admin_jwt(token: Optional[str] = Header(None, alias="X-Admin-Token")) -> Optional[str]:
    """Dependency for FastAPI routes that requires a valid admin JWT in X-Admin-Token header.

    Returns the admin's email (None for chapter-password sessions). Raises HTTPException(401) if missing/invalid.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Admin token required")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return payload.get("email")


# OAuth `state`: signed and short-lived, so the callback only accepts logins this API started
def create_oauth_state(purpose: str) -> str:
    payload = {"typ": "oauth_state", "purpose": purpose, "nonce": secrets.token_urlsafe(16),
               "exp": datetime.utcnow() + timedelta(minutes=10)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def read_oauth_state(state: Optional[str]) -> Optional[str]:
    """Return the purpose ("member" or "admin") of a valid state, else None."""
    if not state:
        return None
    try:
        payload = jwt.decode(state, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("typ") != "oauth_state":
        return None
    return payload.get("purpose")


def public_cache(request: Request, response: Response) -> None:
    """Let Vercel's CDN serve public GETs for a minute (and stale copies while it refreshes or if the API errors).
    Admin requests always bypass it so officers see their edits immediately.
    Vary is set on every response: Starlette only adds `Vary: Origin` for allowed origins, so without this a request
    with no Origin (curl, server-side fetches) could cache a copy without CORS headers that browsers then reject.
    Varying on X-Admin-Token keeps admin requests from ever matching a public cache entry."""
    response.headers["Vary"] = "Origin, X-Admin-Token"
    if request.headers.get("x-admin-token"):
        response.headers["Cache-Control"] = "no-store"
    else:
        response.headers["Cache-Control"] = "public, max-age=0, s-maxage=60, stale-while-revalidate=600, stale-if-error=86400"
