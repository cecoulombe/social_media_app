# File: auth.py
# Path operations for authenticating user login attempts
# Author: Caitlin Coulombe
# Last Updated: 2025-06-04

from fastapi import Body, Depends, FastAPI, Response, status, HTTPException, APIRouter
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from app import schema as sch
from app import utils, oauth2
from app.database import get_db
import psycopg2

router = APIRouter(
    tags=['Authentication']
)

# login the user based on username and password attempt
@router.post("/")
def login(user_credentials: OAuth2PasswordRequestForm = Depends()):
    conn, cursor = get_db()

    cursor.execute("""SELECT * FROM users WHERE email = %s""", (user_credentials.username,))
    user = cursor.fetchone()

    if not user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    
    # need to verify that the attempted password is the same as the real password
    if not utils.verify(user_credentials.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Invalid Credentials")
    
    # create a token
    access_token = oauth2.create_access_token(data = {"user_id": user["id"]})

    cursor.close()
    conn.close()

    return {"token": sch.Token(access_token=access_token , token_type="bearer", id=user["id"])}


# add in refresh tokens so that people don't need to log in over and over again