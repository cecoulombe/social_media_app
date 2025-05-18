from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, conint
from typing import Optional

#  TODO after completing the tutorial, drop the title field and add an optional mixed media field

# ----------------------- USER SCHEMA -----------------------
# schema used to create user data
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# schema used to return user data (don't ever want to send back the password)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

# schema used to format the required information for a login attempt
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ----------------------- POST SCHEMA -----------------------
# schema for generic posts
class PostBase(BaseModel):
    title: str
    content: str
    published: bool = True

# schema for creating a post
class PostCreate(PostBase):
    pass

# schema used to manage post data 
class Post(PostBase): 
    id: int
    created_at: datetime
    user_id: int
    author: UserOut

# ----------------------- TOKEN SCHEMA -----------------------
# schema used to verify token format
class Token(BaseModel):
    access_token: str
    token_type: str

# schema used to format the incoming token's data
class TokenData(BaseModel):
    id: Optional[int] = None

# ----------------------- LIKE SCHEMA -----------------------
class VoteDirection(int, Enum):
    down = 0
    up = 1

class Like(BaseModel):
    post_id: int
    dir: VoteDirection