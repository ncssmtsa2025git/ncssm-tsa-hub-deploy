import os
import secrets
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header
from passlib.context import CryptContext
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Config
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
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
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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


def create_admin_token(exp_minutes: int = 60) -> str:
    """Create a short-lived JWT for admin sessions."""
    to_encode = {"role": "admin"}
    expire = datetime.utcnow() + timedelta(minutes=exp_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_admin_jwt(token: Optional[str] = Header(None, alias="X-Admin-Token")) -> None:
    """Dependency for FastAPI routes that requires a valid admin JWT in X-Admin-Token header.

    Raises HTTPException(401) if missing/invalid.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Admin token required")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Invalid admin token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")