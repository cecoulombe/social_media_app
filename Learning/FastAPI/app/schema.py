from pydantic import BaseModel, EmailStr

# ----------------------- SCHEMA -----------------------
# schema used to manage post data 
class Post(BaseModel):  #this will expand the basemodel from pydantic
    title: str
    content: str
    published: bool = True     # this gives a default value if the user doesn't enter a value (makes it optional)

# schema used to manage user data
class CreateUser(BaseModel):
    email: EmailStr
    password: str