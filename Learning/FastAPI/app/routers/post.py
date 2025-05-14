# Path operations converning posts
from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import oauth2
from app.database import get_db

router = APIRouter(
    prefix="/posts",
    tags=['Posts']
)


# Get all of the posts from the database
@router.get("/")
def get_posts(current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT * FROM posts""")
    posts = cursor.fetchall()
    return {"data": posts}

# Create a brand new post with a dependency on having a valid log in token
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_posts(post: sch.Post, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""INSERT INTO posts (title, content, published) VALUES (%s, %s, %s) RETURNING *""", (post.title, post.content, post.published))
    new_post = cursor.fetchone()
    conn.commit()   # changes made to the database must be committed deliberately
    return {"data": new_post}

# Get a single post based on the passed id
@router.get("/{id}")
def get_post(id: int, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT * FROM posts WHERE id = %s""", (str(id),))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    return {"data": post}

# Delete a post based on the passed id
@router.delete("/{id}")
def delete_post(id:int, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (str(id),))
    deleted = cursor.fetchone()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()   # deletion changes the database so it needs to be committed
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Update a post based on id
@router.put("/{id}")
def update_post(id: int, post: sch.Post, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()
    
    cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, str(id),))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()
    return {"data": updated}