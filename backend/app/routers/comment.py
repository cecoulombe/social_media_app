# File: comment.py
# Path operations related to comments
# Author: Caitlin Coulombe
# Last Updated: 2025-06-26

from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import oauth2
from app.database import get_db

router = APIRouter(
    tags=['comment']
)

# path operation to get all of the comments for a specific post
@router.get("/{post_id}")
def get_comments(post_id: int, current_user: int = Depends(oauth2.get_current_user), limit: int = 100, skip: int = 0):
    conn, cursor = get_db()

    # check if the post exists
    cursor.execute("""SELECT 1 FROM posts WHERE id = %s""", (str(post_id),))
    post_exists = cursor.fetchone()
    if not post_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id = {post_id} does not exist")

    # get comments for the post
    cursor.execute("""SELECT comments.*, 
                   users.id AS author_id,
                   users.email AS author_email,
                   users.created_at AS author_created_at,
                   users.display_name AS author_display_name
                   FROM comments
                   JOIN users ON comments.user_id = users.id
                   WHERE post_id = %s
                   ORDER BY comments.id DESC
                   LIMIT %s OFFSET %s""", (str(post_id), limit, skip,))
    comments = cursor.fetchall()

    result = []
    for comment in comments:
        comment_dict = dict(comment)

        # get the profile picture for the user
        cursor.execute("""SELECT filename, filepath FROM profile_pictures WHERE user_id = %s""", (str(comment_dict["author_id"]),))
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
            "id": comment_dict["author_id"],
            "email": comment_dict["author_email"],
            "created_at": comment_dict["author_created_at"],
            "display_name": comment_dict["author_display_name"],
            "profile_pic": profile_pic
        }

        comment_dict["author"] = author_data

        # remove the flattened author fields to avoid conflict
        del comment_dict["author_id"]
        del comment_dict["author_email"]
        del comment_dict["author_created_at"]
        del comment_dict["author_display_name"]

        result.append(sch.CommentOut(**comment_dict))

    cursor.close()
    conn.close()

    return {"data": result}

# path operation to get all of parent comments for a specific post
@router.get("/parent/{post_id}")
def get_comments(post_id: int, current_user: int = Depends(oauth2.get_current_user), limit: int = 100, skip: int = 0):
    conn, cursor = get_db()

    # check if the post exists
    cursor.execute("""SELECT 1 FROM posts WHERE id = %s""", (str(post_id),))
    post_exists = cursor.fetchone()
    if not post_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id = {post_id} does not exist")

    # get comments for the post
    cursor.execute("""SELECT comments.*, 
                   users.id AS author_id,
                   users.email AS author_email,
                   users.created_at AS author_created_at,
                   users.display_name AS author_display_name
                   FROM comments
                   JOIN users ON comments.user_id = users.id
                   WHERE post_id = %s AND parent_id IS NULL
                   ORDER BY comments.id DESC
                   LIMIT %s OFFSET %s""", (str(post_id), limit, skip,))
    comments = cursor.fetchall()

    result = []
    for comment in comments:
        comment_dict = dict(comment)

        # get the profile picture for the user
        cursor.execute("""SELECT filename, filepath FROM profile_pictures WHERE user_id = %s""", (str(comment_dict["author_id"]),))
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
            "id": comment_dict["author_id"],
            "email": comment_dict["author_email"],
            "created_at": comment_dict["author_created_at"],
            "display_name": comment_dict["author_display_name"],
            "profile_pic": profile_pic
        }

        comment_dict["author"] = author_data

        # remove the flattened author fields to avoid conflict
        del comment_dict["author_id"]
        del comment_dict["author_email"]
        del comment_dict["author_created_at"]
        del comment_dict["author_display_name"]

        result.append(sch.CommentOut(**comment_dict))

    cursor.close()
    conn.close()

    return {"data": result}

# path operation to create a new comment for a post
@router.post("/{post_id}", status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, comment: sch.CreateComment, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""INSERT INTO comments (content, post_id, user_id) VALUES (%s, %s, %s) RETURNING *""", (comment.content, str(post_id), current_user.id,))
    new_comment = cursor.fetchone()
    if not new_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Comment could not be created")
    conn.commit()

    cursor.close()
    conn.close()
    # print("NEW COMMENT DATA: " + new_comment)
    return {"data" :sch.CreateCommentOut(**new_comment)}

# create a child comment
@router.post("/{post_id}/{parent_id}", status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, parent_id: int, comment: sch.CreateComment, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    # check that the "parent" comment is not itelf a child (only one level of parenthood)
    cursor.execute("""SELECT parent_id FROM comments WHERE id = %s""", (str(parent_id),))
    is_childRow = cursor.fetchone()
    if is_childRow and is_childRow["parent_id"] is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Comment with id = {parent_id} is a child and cannot be a parent as well: " + str(is_childRow))

    # check that there is a comment with the entered id for the post id
    cursor.execute("""SELECT 1 FROM comments WHERE post_id = %s AND id = %s""", (str(post_id), str(parent_id),))
    parent_exists = cursor.fetchone()
    if not parent_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"There is not a comment with the id = {parent_id} on the post with the id = {post_id}")

    cursor.execute("""INSERT INTO comments (content, post_id, user_id, parent_id) VALUES (%s, %s, %s, %s) RETURNING *""", (comment.content, str(post_id), current_user.id, str(parent_id),))
    new_comment = cursor.fetchone()
    if not new_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Comment could not be created")
    conn.commit()

    cursor.close()
    conn.close()
    # print("NEW COMMENT DATA: " + new_comment)
    return {"data" :sch.CreateCommentOut(**new_comment)}

# edit a comment?

# delete a comment