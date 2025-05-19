from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import oauth2
from app.database import get_db

router = APIRouter(
    prefix="/like",
    tags=['Like']
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def like(like: sch.Like, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    # check that the targetted vote exists
    cursor.execute("""SELECT 1 FROM posts WHERE id = %s""", (like.post_id,))
    post_exists = cursor.fetchone()
    if not post_exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"post with id: {like.post_id} was not found")

    cursor.execute("""SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s""", (current_user.id, like.post_id))
    isLiked = cursor.fetchone()

    if(like.dir == 1):
        if isLiked:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"user {current_user.id} has already liked post {like.post_id}")
            # already liked the post
        cursor.execute("""INSERT INTO likes (post_id, user_id) VALUES (%s, %s)""", (like.post_id, current_user.id))
        conn.commit()   # changes made to the database must be committed deliberately
        return {"message": "successfully added like"}
    else:
        if not isLiked:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Like does not exist")
        cursor.execute("""DELETE FROM likes WHERE user_id = %s AND post_id = %s""", (current_user.id, like.post_id))
        conn.commit()
        return {"message": "successfully removed like"}
