from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional

# ----------------------- SCHEMA -----------------------
# schema used to manage post data 
class Post(BaseModel):  #this will expand the basemodel from pydantic
    title: str
    content: str
    published: bool = True     # this gives a default value if the user doesn't enter a value (makes it optional)

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

# schema used to verify token format
class Token(BaseModel):
    access_token: str
    token_type: str

# schema used to format the incoming token's data
class TokenData(BaseModel):
    id: Optional[int] = None