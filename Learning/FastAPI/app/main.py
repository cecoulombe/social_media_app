from fastapi import Body, FastAPI, Response, status, HTTPException
from app.routers import post, user, auth


# Create a FastAPI application
app = FastAPI()

app.include_router(post.router)
app.include_router(user.router)
app.include_router(auth.router)