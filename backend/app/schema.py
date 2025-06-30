# File: schema.py
# Contains schema used for ensuring database is formatted as intended
# Author: Caitlin Coulombe
# Last Updated: 2025-06-20

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, conint
from typing import List, Optional

# ----------------------- MEDIA SCHEMA -----------------------
class MediaOut(BaseModel):
    filename: Optional[str] = None
    url: Optional[str] = None

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
    profile_pic: Optional[MediaOut] = None

# schema used to format the required information for a login attempt
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# schema used to update the user's display name
class UserUpdate(BaseModel):
    display_name: str

# schema used to get a password attempt
class PasswordAttempt(BaseModel):
    password: str

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
    like_count: Optional[int] = 0
    comment_count: Optional[int] = 0
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

# ----------------------- COMMENTS SCHEMA -----------------------
class Comment(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CreateComment(Comment):
    pass

class CreateCommentOut(Comment):
    id: int
    content: str
    post_id: int
    user_id: int
    parent_id: Optional[int] = None
    created_at: datetime

class CommentOut(CreateCommentOut):
    author: UserOut