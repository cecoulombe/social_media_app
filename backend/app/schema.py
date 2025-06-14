# File: schema.py
# Contains schema used for ensuring database is formatted as intended
# Author: Caitlin Coulombe
# Last Updated: 2025-06-06

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, conint
from typing import List, Optional

# ----------------------- USER SCHEMA -----------------------
# schema used to create user data
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str

# schema used to return user data (don't ever want to send back the password)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    display_name: str

# schema used to format the required information for a login attempt
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ----------------------- MEDIA SCHEMA -----------------------
class MediaOut(BaseModel):
    filename: str
    url: str

# ----------------------- POST SCHEMA -----------------------
# schema for generic posts
class PostBase(BaseModel):
    content: str
    published: bool = True

# schema for creating a post
class PostCreate(PostBase):
    pass

# schema for returning the created post
class PostCreateOut(PostCreate):
    id: int

# schema used to manage post data 
class Post(PostBase): 
    id: int
    created_at: datetime
    user_id: int
    author: UserOut

# schema used to manage post data 
class PostOut(Post): 
    like_count: int
    media: List[MediaOut]

# ----------------------- TOKEN SCHEMA -----------------------
# schema used to verify token format
class Token(BaseModel):
    access_token: str
    token_type: str
    id: int

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