# File: user.py
# Path operations concerning users
# Author: Caitlin Coulombe
# Last Updated: 2025-06-04

from fastapi import Body, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import utils
from app.database import get_db
import psycopg2

router = APIRouter(
    tags=['Users']
)

# Create a new user
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: sch.UserCreate):
    conn, cursor = get_db()
    try:
        # Hash the password - user.password
        hashed_password = utils.hash(user.password)
        user.password = hashed_password

        # Adding the pydantic model of the user to the table
        cursor.execute("""INSERT INTO users (email, password, display_name) VALUES (%s, %s, %s) RETURNING *""", (user.email, user.password, user.display_name))
        new_user = cursor.fetchone()
        conn.commit()  

        cursor.close()
        conn.close()
        
        return {"data": sch.UserOut(**new_user)}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = f"Unexpected error: {str(e)}")
    

# Find out if there is a user with that email
@router.get("/get-user/{email}")
def get_user(email: str):
    conn, cursor = get_db()
    cursor.execute("""SELECT 1 FROM users WHERE email = %s""", (email,))
    user = cursor.fetchone()
    if not user:
        return 0

    cursor.close()
    conn.close()
    
    return 1

# Retreive the information from a specific user based on email
@router.get("/{id}")
def get_user(id: int):
    conn, cursor = get_db()
    cursor.execute("""SELECT users.*, 
                   profile_pictures.filename AS filename,
                   profile_pictures.filepath AS url
                   FROM users 
                   LEFT JOIN profile_pictures ON profile_pictures.user_id = users.id
                   WHERE users.id = %s""", (str(id),))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {id} does not exist")
    
    user_dict = dict(user)

    profile_pic = {
        "filename": user_dict["filename"],
        "url": user_dict["url"]
    }

    user_dict["profile_pic"] = profile_pic

    del user_dict["filename"]
    del user_dict["url"]
    
    cursor.close()
    conn.close()
    
    return {"data": sch.UserOut(**user_dict)}