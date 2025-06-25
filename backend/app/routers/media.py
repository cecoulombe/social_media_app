# File: media.py
# Path operations concerning adding media
# Author: Caitlin Coulombe
# Last Updated: 2025-06-20
from typing import List, Optional
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

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"}   # for now just allowing still images, not mov or mp4 (big and expensive)

# for uploading a media file: 
@router.post("/upload/{post_id}", status_code=status.HTTP_201_CREATED)
async def upload_file(post_id: int, files: List[UploadFile] = File(...), current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()
    uploaded_urls = []
    
    # only add media to the user's post
    cursor.execute("""SELECT user_id FROM posts WHERE id = %s""", (str(post_id),))
    user_id = cursor.fetchone()
    if not user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {post_id} was not found")

    if user_id["user_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not authorized to perform requested action.")

    for file in files:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Invalid file type")

        filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
        file_path = os.path.join("media", filename)

        # save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # save metadata to database
        cursor.execute("""INSERT INTO files (filename, filepath, uploaded_at, post_id)
                    VALUES (%s, %s, NOW(), %s)""", (filename, file_path, post_id))
        
        uploaded_urls.append(f"/media/{filename}")

    conn.commit()

    cursor.close()
    conn.close()

    return {"urls": uploaded_urls}

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

# for uploading a profile picture 
@router.post("/profile/upload/{user_id}", status_code=status.HTTP_201_CREATED)
async def upload_file(user_id: int, file: UploadFile = File(...), current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()
    uploaded_urls = []

    # only add profile picture to self
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not authorized to perform requested action.")


    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid file type")

    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join("media/profile_picture", filename)

    # save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # save metadata to database
    cursor.execute("""INSERT INTO profile_pictures (filename, filepath, uploaded_at, user_id)
                VALUES (%s, %s, NOW(), %s)""", (filename, file_path, user_id))

    conn.commit()

    cursor.close()
    conn.close()

    return {"url": f"/media/profile_picture/{filename}"}

# for retrieving the data for the profile picture for the user
@router.get("/by-user/{user_id}")
def get_media(user_id: int):
    conn, cursor = get_db()

    cursor.execute("SELECT 1 FROM users WHERE id = %s", (user_id,))
    postExists = cursor.fetchone()

    if not postExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"user with id: {user_id} was not found")
    
    cursor.execute("SELECT filename, filepath FROM profile_pictures WHERE user_id = %s", (user_id,))
    file = cursor.fetchone()

    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail=f"No media associated with user {user_id}")


    cursor.close()
    conn.close()

    return {"file": file}

# for updating an existing profile picture
@router.put("/profile/update/{user_id}", status_code=status.HTTP_201_CREATED)
async def upload_file(user_id: int, file: UploadFile = File(...), current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()
    uploaded_urls = []

    # only change own profile picture
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not authorized to perform requested action.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid file type")

    # Get current file path before overwriting
    cursor.execute("SELECT filepath FROM profile_pictures WHERE user_id = %s", (str(user_id),))
    old = cursor.fetchone()
    old_filepath = old["filepath"] if old else None

    # delete old file from storage
    if old_filepath and os.path.exists(old_filepath):
        os.remove(old_filepath)

    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join("media/profile_picture", filename)

    # save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
   
    cursor.execute("""UPDATE profile_pictures SET filename = %s, filepath = %s, uploaded_at = NOW() WHERE user_id = %s RETURNING *""", (filename, file_path, str(user_id),))
    updated = cursor.fetchone()

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                        detail=f"No media associated with user {user_id}")

    conn.commit()

    cursor.close()
    conn.close()

    return {"url": f"/media/profile_picture/{filename}"}