# File: post.py
# Contains path operations related to creating, retrieving, updaing, and deleting posts
# Author: Caitlin Coulombe
# Last Updated: 2025-06-26

import os
from typing import Optional
from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import oauth2
from app import utils
from app.database import get_db
import boto3

router = APIRouter(
    tags=['Posts']
)

s3_client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
BUCKET_NAME = os.getenv("AWS_S3_BUCKET")

# TODO: right now the limit is set to 100, but you'll want to keep that a bit lower out of developement and then use pagination to get more posts
# path operation to get all of the posts
@router.get("/")
def get_posts(current_user: int = Depends(oauth2.get_current_user), limit: int = 100, skip: int = 0, published: bool = True, search: Optional[str] = None):
    conn, cursor = get_db()

    if search:
        # create a relationship between the post and the author of the post
        cursor.execute("""SELECT posts.*,
                    users.id AS author_id,
                    users.email AS author_email,
                    users.created_at AS author_created_at,
                    users.display_name AS author_display_name,
                    COALESCE(like_counts.like_count, 0) AS like_count, 
                    COALESCE(comment_counts.comment_count, 0) AS comment_count 
                    FROM posts 
                    LEFT JOIN users ON posts.user_id = users.id
                    LEFT JOIN (
                            SELECT post_id, 
                            COUNT(*) AS like_count 
                            FROM likes 
                            GROUP BY post_id) AS like_counts ON posts.id = like_counts.post_id 
                       LEFT JOIN (
                            SELECT post_id, 
                            COUNT(*) AS comment_count 
                            FROM comments 
                            GROUP BY post_id) AS comment_counts ON posts.id = comment_counts.post_id 
                    WHERE posts.published = %s AND posts.content ILIKE %s
                    GROUP BY posts.id, users.id, users.email, users.created_at
                    ORDER BY posts.created_at DESC
                    LIMIT %s OFFSET %s""", (published, f"%{search}%", limit, skip,))
    else:
        cursor.execute("""SELECT posts.*, 
                       users.id AS author_id, 
                       users.email AS author_email, 
                       users.created_at AS author_created_at, 
                       users.display_name AS author_display_name, 
                       COALESCE(like_counts.like_count, 0) AS like_count, 
                       COALESCE(comment_counts.comment_count, 0) AS comment_count 
                       FROM posts 
                       JOIN users ON posts.user_id = users.id 
                       LEFT JOIN (
                            SELECT post_id, 
                            COUNT(*) AS like_count 
                            FROM likes 
                            GROUP BY post_id) AS like_counts ON posts.id = like_counts.post_id 
                       LEFT JOIN (
                            SELECT post_id, 
                            COUNT(*) AS comment_count 
                            FROM comments 
                            GROUP BY post_id) AS comment_counts ON posts.id = comment_counts.post_id 
                       WHERE posts.published = %s
                       ORDER BY posts.id DESC 
                       LIMIT %s OFFSET %s""", (published, limit, skip,))
        
    posts = cursor.fetchall()

    result = []
    for post in posts:
        post_dict = dict(post)

        # get the profile picture for the user
        cursor.execute("""SELECT filename, filepath FROM profile_pictures WHERE user_id = %s""", (str(post_dict["author_id"]),))
        # print("AUTHOR_ID:", post_dict["author_id"], type(post_dict["author_id"]))

        profile_pic_row = cursor.fetchone()

        if profile_pic_row:
            profile_pic = {
                "filename":profile_pic_row["filename"],
                "url": profile_pic_row["filepath"]
            }
        else:
            profile_pic = None

        # group the author information
        author_data = {
            "id": post_dict["author_id"],
            "email": post_dict["author_email"],
            "created_at": post_dict["author_created_at"],
            "display_name": post_dict["author_display_name"],
            "profile_pic": profile_pic
        }

        post_dict["author"] = author_data

        # remove the flattened author fields to avoid conflict
        del post_dict["author_id"]
        del post_dict["author_email"]
        del post_dict["author_created_at"]
        del post_dict["author_display_name"]

        # get all of the media for the post and then attach it to the output
        cursor.execute("""SELECT filename, filepath FROM files WHERE post_id = %s""", (post_dict["id"],))
        media_rows = cursor.fetchall()
        media_list = [{"filename": row["filename"], "url": row["filepath"]} for row in media_rows]
        # media_list = [{"filename": row[0], "url": row[1]} for row in media_rows]
        
        post_dict["media"] = media_list

        result.append(sch.PostOut(**post_dict))

    cursor.close()
    conn.close()

    return {"data": result}

# path operation to get all of the posts for the current user
@router.get("/get-user/{user_id}")
def get_posts(user_id: int, current_user: int = Depends(oauth2.get_current_user), limit: int = 100, skip: int = 0, published: bool = True):
    conn, cursor = get_db()

    # check that the user exists
    cursor.execute("""SELECT 1 FROM users WHERE users.id = %s""", (str(user_id),))
    userExists = cursor.fetchone()
    if not userExists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"user with id: {user_id} was not found")

    cursor.execute("""SELECT posts.*, 
            users.id AS author_id, 
            users.email AS author_email, 
            users.created_at AS author_created_at, 
            users.display_name AS author_display_name, 
            COALESCE(like_counts.like_count, 0) AS like_count, 
            COALESCE(comment_counts.comment_count, 0) AS comment_count 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN (
                SELECT post_id, 
                COUNT(*) AS like_count 
                FROM likes 
                GROUP BY post_id) AS like_counts ON posts.id = like_counts.post_id 
            LEFT JOIN (
                SELECT post_id, 
                COUNT(*) AS comment_count 
                FROM comments 
                GROUP BY post_id) AS comment_counts ON posts.id = comment_counts.post_id 
            WHERE posts.user_id = %s AND posts.published = %s 
            ORDER BY posts.id DESC 
            LIMIT %s OFFSET %s""", (str(user_id), published, limit, skip,))
        
    posts = cursor.fetchall()

    result = []
    for post in posts:
        post_dict = dict(post)
        
        # get the profile picture for the user
        cursor.execute("""SELECT filename, filepath FROM profile_pictures WHERE user_id = %s""", (str(post_dict["author_id"]),))
        # print("AUTHOR_ID:", post_dict["author_id"], type(post_dict["author_id"]))

        profile_pic_row = cursor.fetchone()

        if profile_pic_row:
            profile_pic = {
                "filename":profile_pic_row["filename"],
                "url": profile_pic_row["filepath"]
            }
        else:
            profile_pic = None

        # group the author information
        author_data = {
            "id": post_dict["author_id"],
            "email": post_dict["author_email"],
            "created_at": post_dict["author_created_at"],
            "display_name": post_dict["author_display_name"],
            "profile_pic": profile_pic
        }

        post_dict["author"] = author_data

        # remove the flattened author fields to avoid conflict
        del post_dict["author_id"]
        del post_dict["author_email"]
        del post_dict["author_created_at"]
        del post_dict["author_display_name"]

        # get all of the media for the post and then attach it to the output
        cursor.execute("""SELECT filename, filepath FROM files WHERE post_id = %s""", (post_dict["id"],))
        media_rows = cursor.fetchall()
        media_list = [{"filename": row["filename"], "url": row["filepath"]} for row in media_rows]
        # media_list = [{"filename": row[0], "url": row[1]} for row in media_rows]
        
        post_dict["media"] = media_list

        result.append(sch.PostOut(**post_dict))

    cursor.close()
    conn.close()

    return {"data": result}

# Get a single post based on the passed id and return the username for the creator of the post
@router.get("/{id}")
def get_post(id: int, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    # create a relationship between the post and the author of the post
    cursor.execute("""SELECT posts.*, 
            users.id AS author_id, 
            users.email AS author_email, 
            users.created_at AS author_created_at, 
            users.display_name AS author_display_name, 
            COALESCE(like_counts.like_count, 0) AS like_count, 
            COALESCE(comment_counts.comment_count, 0) AS comment_count 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN (
                SELECT post_id, 
                COUNT(*) AS like_count 
                FROM likes 
                GROUP BY post_id) AS like_counts ON posts.id = like_counts.post_id 
            LEFT JOIN (
                SELECT post_id, 
                COUNT(*) AS comment_count 
                FROM comments 
                GROUP BY post_id) AS comment_counts ON posts.id = comment_counts.post_id 
            WHERE posts.id = %s""", (str(id),))
        
    post = cursor.fetchone()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    
    post_dict = dict(post)

    # get the profile picture for the user
    cursor.execute("""SELECT filename, filepath FROM profile_pictures WHERE user_id = %s""", (str(post_dict["author_id"]),))
    # print("AUTHOR_ID:", post_dict["author_id"], type(post_dict["author_id"]))

    profile_pic_row = cursor.fetchone()

    if profile_pic_row:
        profile_pic = {
            "filename":profile_pic_row["filename"],
            "url": profile_pic_row["filepath"]
        }
    else:
        profile_pic = None

    # group the author information
    author_data = {
        "id": post_dict["author_id"],
        "email": post_dict["author_email"],
        "created_at": post_dict["author_created_at"],
        "display_name": post_dict["author_display_name"],
        "profile_pic": profile_pic
    }

    post_dict["author"] = author_data

    # remove the flattened author fields to avoid conflict
    del post_dict["author_id"]
    del post_dict["author_email"]
    del post_dict["author_created_at"]
    del post_dict["author_display_name"]


    # get all of the media for the post and then attach it to the output
    cursor.execute("""SELECT filename, filepath FROM files WHERE post_id = %s""", (str(id),))
    media_rows = cursor.fetchall()
    media_list = [{"filename": row["filename"], "url": row["filepath"]} for row in media_rows]
    # media_list = [{"filename": row[0], "url": row[1]} for row in media_rows]
    
    post_dict["media"] = media_list

    print(post_dict)

    cursor.close()
    conn.close()

    return {"data": sch.PostOut(**post_dict)}

# Create a brand new post with a dependency on having a valid log in token
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_posts(post: sch.PostCreate, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""INSERT INTO posts (content, published, user_id) VALUES (%s, %s, %s) RETURNING *""", (post.content, post.published, current_user.id))
    new_post = cursor.fetchone()
    conn.commit()   # changes made to the database must be committed deliberately
    
    cursor.close()
    conn.close()
    print("NEW POST DATA: ", new_post)
    return {"data": sch.PostCreateOut(**new_post)}

# Delete a post based on the passed id
@router.delete("/{id}")
def delete_post(id:int, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT user_id FROM posts WHERE id = %s""", (str(id),))
    user_id = cursor.fetchone()
    if not user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")


    if user_id["user_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not authorized to perform requested action.")
    
    #  get associated media prior to deleting the post
    cursor.execute("""SELECT filename FROM files WHERE post_id = %s""", (str(id),))
    media_files = cursor.fetchall()

    #  delete the post
    cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (str(id),))
    deleted = cursor.fetchone()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()   # deletion changes the database so it needs to be committed

    # remove associated media from the disk
    print("media_files from DB:", media_files)

    for media in media_files:
        # filename = media["filename"]
        filename = str(media["filename"]) if media["filename"] is not None else None

        if filename:
            try:
                utils.delete_s3_object(filename)
            except Exception as e:
                print(f"posts: Error deleting S3 file {filename}: {e}")
    
    cursor.close()
    conn.close()
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Update a post based on id
@router.put("/{id}")
def update_post(id: int, post: sch.PostCreate, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT user_id FROM posts WHERE id = %s""", (str(id),))
    user_id = cursor.fetchone()
    if not user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")

    if user_id["user_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail=f"Not authorized to perform requested action.")
   
    cursor.execute("""UPDATE posts SET content = %s, published = %s WHERE id = %s RETURNING *""", (post.content, post.published, str(id),))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"data": sch.PostCreate(**updated)}