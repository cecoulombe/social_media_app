# File: media.py
# Path operations concerning adding media
# Author: Caitlin Coulombe
# Last Updated: 2025-06-04

from typing import Optional
from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter, UploadFile, Form, File
from fastapi.responses import JSONResponse
import os
import shutil
from datetime import datetime
from app import schema as sch
from app import oauth2
from app.database import get_db

router = APIRouter(
    tags=["media"]
)

UPLOAD_DIR = "media"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpg", "image/jpeg", "image/gif"}   # for now just allowing still images, not mov or mp4 (big and expensive)

# for uploading a media file: 
@router.post("/upload/{post_id}", status_code=status.HTTP_201_CREATED)
async def upload_file(post_id: int, file: UploadFile = File(...), description: str  = Form(...), current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid file type")

    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join("media", filename)

    # save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # save metadata to database
    cursor.execute("""INSERT INTO files (filename, filepath, description, uploaded_at, post_id)
                   VALUES (%s, %s, %s, NOW(), %s)""", (filename, file_path, description, post_id))

    conn.commit()

    cursor.close()
    conn.close()

    return {"url": f"/media/{filename}"}

# for retrieving the data for all media related to a specific post
@router.get("/by-id/{post_id}")
def get_media(post_id: int):
    conn, cursor = get_db()

    cursor.execute("SELECT 1 FROM posts WHERE id = %s", (post_id,))
    postExists = cursor.fetchone()

    if not postExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {post_id} was not found")

    cursor.execute("SELECT filename, filepath FROM files WHERE post_id = %s", (post_id,))
    rows = cursor.fetchall()

    if not rows:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail=f"No media associated with post {post_id}")

    files = [{"filename": row["filename"], "url": row["filepath"]} for row in rows]

    cursor.close()
    conn.close()

    return {"files": files}

