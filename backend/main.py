import os
import httpx
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status, Request, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import secrets
import hashlib

# Load environment variables
load_dotenv()

app = FastAPI(title="Google OAuth 2 API", version="1.0.0")

# CORS configuration - allow requests from your frontend during development
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # use ["*"] to allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET") 
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/callback")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
ACCESS_COOKIE_NAME = "access_token"
ACCESS_COOKIE_MAX_AGE = JWT_EXPIRATION_HOURS * 3600
# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security
security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    id: Optional[str] = None
    email: str
    name: str
    picture: Optional[str] = None
    google_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class GoogleUserInfo(BaseModel):
    id: str
    email: str
    name: str
    picture: str

# Database setup
async def create_users_table():
    """Create users table if it doesn't exist"""
    try:
        # This will create the table via Supabase SQL editor or migration
        # For now, we'll assume the table exists
        pass
    except Exception as e:
        print(f"Error creating table: {e}")

# JWT functions
def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(access_token: Optional[str] = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# User database functions
async def get_user_by_google_id(google_id: str) -> Optional[User]:
    """Get user by Google ID from Supabase"""
    try:
        response = supabase.table("users").select("*").eq("google_id", google_id).execute()
        if response.data:
            return User(**response.data[0])
        return None
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

async def get_user_by_id(user_id: str) -> Optional[User]:
    """Get user by ID from Supabase"""
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if response.data:
            return User(**response.data[0])
        return None
    except Exception as e:
        print(f"Error fetching user: {e}")
        return None

async def create_user(user_data: dict) -> User:
    """Create new user in Supabase"""
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
    """Update user in Supabase"""
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

# OAuth functions
def generate_state() -> str:
    """Generate random state for OAuth security"""
    return secrets.token_urlsafe(32)

async def exchange_code_for_token(code: str) -> dict:
    """Exchange authorization code for access token"""
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
    """Get user info from Google API"""
    user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")
        
        user_data = response.json()
        return GoogleUserInfo(**user_data)

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Google OAuth 2 API with Supabase"}

@app.get("/auth/login")
async def login():
    """Initiate Google OAuth login"""
    state = generate_state()
    
    # Store state in session or cache (simplified here)
    # In production, you'd want to store this securely
    
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"scope=openid email profile&"
        f"response_type=code&"
        f"state={state}"
    )
    
    return {"auth_url": google_auth_url, "state": state}

@app.get("/auth/callback")
async def auth_callback(code: str, state: str, response: Response):
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not provided")

    # Exchange code for token
    token_data = await exchange_code_for_token(code)
    access_token = token_data["access_token"]

    # Get user info
    google_user = await get_google_user_info(access_token)

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
        secure=False,   # must be False for local dev over http
        samesite="lax", # "none" if using different domains + https
        max_age=ACCESS_COOKIE_MAX_AGE,
        expires=ACCESS_COOKIE_MAX_AGE,
    )

    return redirect

@app.get("/auth/me", response_model=User)
async def get_current_user(user_id: str = Depends(verify_token)):
    """Get current authenticated user"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(ACCESS_COOKIE_NAME)
    return {"message": "Logged out successfully"}

@app.get("/users/profile", response_model=User)
async def get_profile(user_id: str = Depends(verify_token)):
    """Get user profile"""
    return await get_current_user(user_id)

@app.put("/users/profile", response_model=User)
async def update_profile(
    name: Optional[str] = None,
    user_id: str = Depends(verify_token)
):
    """Update user profile"""
    update_data = {}
    if name is not None:
        update_data["name"] = name
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    return await update_user(user_id, update_data)

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)