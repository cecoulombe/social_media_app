from fastapi import Body, FastAPI, Response, HTTPException
from app.routers import post, user, auth, like
from app.config import settings

# Create a FastAPI application
app = FastAPI()

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)
app.include_router(like.router)