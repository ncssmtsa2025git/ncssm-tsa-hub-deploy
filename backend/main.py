import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import sentry_sdk

from routes.auth import router as auth_router
from routes.events import router as event_router
from routes.teams import router as team_router
from routes.checkins import router as checkin_router
from routes.content import router as content_router

# Error alerts: Sentry reports crashes and 5xx responses once SENTRY_DSN is set (no-op otherwise)
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("VERCEL_ENV", "development"),
        send_default_pii=False,
        traces_sample_rate=0,
    )

# No public /docs or /openapi.json: they map every route for attackers
app = FastAPI(title="Google OAuth 2 API", version="1.0.0", docs_url=None, redoc_url=None, openapi_url=None)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://ncssm-tsa-hub-admin.vercel.app",
    "https://ncssm-tsa-hub.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(event_router)
app.include_router(team_router)
app.include_router(checkin_router)
app.include_router(content_router)


@app.get("/")
async def root():
    return {"message": "NCSSM-D TSA Hub API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
