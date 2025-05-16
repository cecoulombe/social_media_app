# Path operations converning posts
from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import oauth2
from app.database import get_db

router = APIRouter(
    prefix="/posts",
    tags=['Posts']
)

# TODO currently returning the email of the post creator but change that to the user/display name instead

# Get all of the posts from the database and return the username for the creator of the post
# Note: because this is a social media, posts are public and therefore getting posts will return everyone's posts; however, this would be changed for a private app such as a note taking app.
@router.get("/")
def get_posts(current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT posts.*,
                   users.id AS author_id,
                   users.email AS author_email,
                   users.created_at AS author_created_at
                   FROM posts 
                   JOIN users ON posts.user_id = users.id""")
    posts = cursor.fetchall()

    result = []
    for post in posts:
        post_dict = dict(post)

        # Create nested author object that is expected by sch.Post
        author_data = {
            "id": post_dict["author_id"],
            "email": post_dict["author_email"],
            "created_at": post_dict["author_created_at"]
        }
        post_dict["author"] = author_data

        # remove the flattened author fields to avoid conflict
        del post_dict["author_id"]
        del post_dict["author_email"]
        del post_dict["author_created_at"]

        result.append(sch.Post(**post_dict))

    return {"data": result}

# Create a brand new post with a dependency on having a valid log in token
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_posts(post: sch.PostCreate, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""INSERT INTO posts (title, content, published, user_id) VALUES (%s, %s, %s, %s) RETURNING *""", (post.title, post.content, post.published, current_user.id))
    new_post = cursor.fetchone()
    conn.commit()   # changes made to the database must be committed deliberately
    return {"data": sch.Post(**new_post)}

# Get a single post based on the passed id and return the username for the creator of the post
@router.get("/{id}")
def get_post(id: int, current_user: int = Depends(oauth2.get_current_user)):
    conn, cursor = get_db()

    cursor.execute("""SELECT posts.*,
                   users.id AS author_id,
                   users.email AS author_email,
                   users.created_at AS author_created_at
                   FROM posts
                   JOIN users on posts.user_id = users.id
                   WHERE posts.id = %s""", (str(id),))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    
    post_dict = dict(post)
    author_data = {
        "id": post_dict["author_id"],
        "email": post_dict["author_email"],
        "created_at": post_dict["author_created_at"]
    }
    post_dict["author"] = author_data

    # remove the flattened author fields to avoid conflict
    del post_dict["author_id"]
    del post_dict["author_email"]
    del post_dict["author_created_at"]

    return {"data": sch.Post(**post_dict)}

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

    cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (str(id),))
    deleted = cursor.fetchone()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()   # deletion changes the database so it needs to be committed
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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not authorized to perform requested action.")
    
    cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, str(id),))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()
    return {"data": sch.Post(**updated)}