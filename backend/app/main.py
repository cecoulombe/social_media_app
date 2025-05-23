from fastapi import Body, FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import post, user, auth, like, media
from app.config import settings
from fastapi.staticfiles import StaticFiles

# Create a FastAPI application
app = FastAPI()

# Mount the /media path to serve static files
app.mount("/media", StaticFiles(directory="media"), name="media")

# Include your dynamic media routes
# app.include_router(media.router, prefix="/api/media", tags=["media"])

# determines which domains can access the api (currently set to all but will change to the website domain when published)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(like.router)
app.include_router(media.router)