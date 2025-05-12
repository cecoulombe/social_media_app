from fastapi import Body, FastAPI, Response, status, HTTPException
from pydantic import BaseModel
from typing import Optional
from random import randrange
import psycopg2;
from psycopg2.extras import RealDictCursor;

# Create a FastAPI application
app = FastAPI()

# schema used to manage input data types
class Post(BaseModel):  #this will expand the basemodel from pydantic
    title: str
    content: str
    published: bool = True     # this gives a default value if the user doesn't enter a value (makes it optional)

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