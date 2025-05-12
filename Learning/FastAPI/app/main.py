from fastapi import Body, FastAPI, Response, status, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from random import randrange
import psycopg2;
from psycopg2.extras import RealDictCursor;

# Create a FastAPI application
app = FastAPI()

# ----------------------- SCHEMA -----------------------
# schema used to manage post data 
class Post(BaseModel):  #this will expand the basemodel from pydantic
    title: str
    content: str
    published: bool = True     # this gives a default value if the user doesn't enter a value (makes it optional)

# schema used to manage user data
class User(BaseModel):
    email: EmailStr
    password: str

    
# ----------------------- DATABASE CONNECTION -----------------------
# connection to the database using psycopg2. Connections can fail so use the try statement. Need to pass all of these values, including cursor_factory=RealDictCursor in order to have it actually give the column name properly
try:
    conn = psycopg2.connect(host='localhost', 
                            database='fastapi', 
                            user='postgres', 
                            password='12345678', 
                            cursor_factory=RealDictCursor)
    cursor = conn.cursor()
    print("Database connection was successful")
except Exception as error:
    print("Connection to database failed")
    print("Error: ", error)
    exit(0)


# ----------------------- POSTS LOGIC -----------------------
# Get all of the posts from the database
@app.get("/posts")
def get_posts():
    cursor.execute("""SELECT * FROM posts""")
    posts = cursor.fetchall()
    return {"data": posts}

# Create a brand new post
@app.post("/posts", status_code=status.HTTP_201_CREATED)
def create_posts(post: Post):
    cursor.execute("""INSERT INTO posts (title, content, published) VALUES (%s, %s, %s) RETURNING *""", (post.title, post.content, post.published))
    new_post = cursor.fetchone()
    conn.commit()   # changes made to the database must be committed deliberately
    return {"data": new_post}

# Get a single post based on the passed id
@app.get("/posts/{id}")
def get_post(id: int):
    cursor.execute("""SELECT * FROM posts WHERE id = %s""", (str(id),))
    post = cursor.fetchone()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    return {"data": post}

# Delete a post based on the passed id
@app.delete("/posts/{id}")
def delete_post(id:int):
    cursor.execute("""DELETE FROM posts WHERE id = %s RETURNING *""", (str(id),))
    deleted = cursor.fetchone()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()   # deletion changes the database so it needs to be committed
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Update a post based on id
@app.put("/posts/{id}")
def update_post(id: int, post: Post):
    cursor.execute("""UPDATE posts SET title = %s, content = %s, published = %s WHERE id = %s RETURNING *""", (post.title, post.content, post.published, str(id),))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")
    conn.commit()
    return {"data": updated}

# ----------------------- USERS LOGIC -----------------------
# Create a new user
@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: User):
    cursor.execute("""INSERT INTO users (email, password) VALUES (%s, %s) RETURNING *""", (user.email, user.password))
    new_user = cursor.fetchone()
    conn.commit()  
    return {"data": new_user}