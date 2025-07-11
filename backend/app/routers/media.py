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
import boto3
from botocore.exceptions import NoCredentialsError

router = APIRouter(
    tags=["media"]
)

# AWS S3 setup
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
REGION_NAME = os.getenv("AWS_REGION")
s3_client = boto3.client("s3", region_name=REGION_NAME)

# UPLOAD_DIR = "media"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpg", "image/jpeg", "image/gif", "image/webp"}   # for now just allowing still images, not mov or mp4 (big and expensive)

# for uploading the file to s3
def upload_file_to_s3(file_path: str, bucket: str, object_name: str):
    try:
        print(f"Uploading {file_path} to bucket {bucket} with key {object_name}")
        s3_client.upload_file(file_path, bucket, object_name)
        print("Upload successful")
    except NoCredentialsError:
        print("AWS credentials not found!")
        raise HTTPException(status_code=500, 
                            detail="AWS credentials not available")
    except Exception as e:
        print(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, 
                            detail=f"Failed to upload to S3: {str(e)}")

    
# for getting the file from s3
def get_s3_url(filename:str) -> str:
    return f"https://{BUCKET_NAME}.s3.{REGION_NAME}.amazonaws.com/{filename}"

# for uploading a media file: 
@router.post("/upload-s3/{post_id}", status_code=status.HTTP_201_CREATED)
async def upload_file(post_id: int, files: List[UploadFile] = File(...), current_user: int = Depends(oauth2.get_current_user)):
    print("=== HANDLER HIT: CORRECT upload_file() ===")

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
        temp_file_path = f"/tmp/{filename}"

        # save to temp location
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # upload to s3
        print(f"temp_file_path: {temp_file_path} ({type(temp_file_path)})")
        print(f"BUCKET_NAME: {BUCKET_NAME} ({type(BUCKET_NAME)})")
        print(f"filename: {filename} ({type(filename)})")
        upload_file_to_s3(temp_file_path, BUCKET_NAME, filename)

        # delete temp file
        os.remove(temp_file_path)

        s3_url = get_s3_url(filename)

        # save metadata to database
        cursor.execute("""INSERT INTO files (filename, filepath, uploaded_at, post_id)
                    VALUES (%s, %s, NOW(), %s)""", (filename, s3_url, post_id))
        
        uploaded_urls.append(s3_url)

    conn.commit()

    cursor.close()
    conn.close()

    print(uploaded_urls)

    return {"urls": uploaded_urls}

# for retrieving the data for all media related to a specific post
@router.get("/by-id/{post_id}")
def get_media_id(post_id: int):
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

# for uploading a profile picture - occurs during account creation so the user cannot be authorized yet
@router.post("/profile/upload/{user_id}", status_code=status.HTTP_201_CREATED)
# async def upload_file(user_id: int, file: UploadFile = File(...), current_user: int = Depends(oauth2.get_current_user)):
async def upload_profile_picture(user_id: int, file: UploadFile = File(...)):

    conn, cursor = get_db()

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid file type")

    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    temp_file_path = f"/tmp/{filename}"

    # save file to disk
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # upload to s3
    upload_file_to_s3(temp_file_path, BUCKET_NAME, filename)
    os.remove(temp_file_path)

    s3_url = get_s3_url(filename)

    # save metadata to database
    cursor.execute("""INSERT INTO profile_pictures (filename, filepath, uploaded_at, user_id)
                VALUES (%s, %s, NOW(), %s)""", (filename, s3_url, user_id))

    conn.commit()

    cursor.close()
    conn.close()

    return {"url": s3_url}

# for retrieving the data for the profile picture for the user
@router.get("/by-user/{user_id}")
def get_media_user(user_id: int):
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
    print(f"Fetched row from DB: {old}")  # Log the DB result
    old_filepath = old["filepath"] if old else None
    
    # delete old file from s3
    if old_filepath:
            key = old_filepath.split("/")[-1]
            print(f"Attempting to delete: bucket={BUCKET_NAME}, key={key}")
            try:
                s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
                print("Delete successful")
            except Exception as e:
                print(f"Failed to delete S3 object: {e}")
    else:
        print("No filepath found for user, skipping delete.")

    filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    temp_file_path = f"/tmp/{filename}"

    # save file to disk
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # upload new pic to s3
    upload_file_to_s3(temp_file_path, BUCKET_NAME, filename)
    os.remove(temp_file_path)

    s3_url = get_s3_url(filename)
   
    cursor.execute("""UPDATE profile_pictures SET filename = %s, filepath = %s, uploaded_at = NOW() WHERE user_id = %s RETURNING *""", (filename, s3_url, str(user_id),))
    updated = cursor.fetchone()

    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                        detail=f"No media associated with user {user_id}")

    conn.commit()

    cursor.close()
    conn.close()

    return {"url": s3_url}