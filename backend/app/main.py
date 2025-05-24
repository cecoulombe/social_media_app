import os
from fastapi import Body, FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import post, user, auth, like, media
from app.config import settings
from fastapi.staticfiles import StaticFiles

# Create a FastAPI application
app = FastAPI()

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")

# Include API routers first
app.include_router(post.router, prefix="/api/posts")
app.include_router(user.router, prefix="/api/users")
app.include_router(auth.router, prefix="/api/login")  # Your login router here
app.include_router(like.router, prefix="/api/likes")
app.include_router(media.router, prefix="/api/media")

# Mount media files (optional)
app.mount("/media", StaticFiles(directory="media"), name="media")


# Then mount frontend static files at root "/"
app.mount("/frontend", StaticFiles(directory=frontend_path, html=True), name="frontend")

# determines which domains can access the api (currently set to all but will change to the website domain when published)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/test")
async def test_post():
    return {"message": "POST works"}