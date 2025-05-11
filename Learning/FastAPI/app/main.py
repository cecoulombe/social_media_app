from fastapi import Body, FastAPI, Response, status, HTTPException
from pydantic import BaseModel
from typing import Optional
from random import randrange

# Create a FastAPI application
app = FastAPI()

# schema used to manage input data types
class Post(BaseModel):  #this will expand the basemodel from pydantic
    title: str
    content: str
    public: bool = True     # this gives a default value if the user doesn't enter a value (makes it optional)
    rating: Optional[int] = None    # this is a fully optional field without a default value

my_posts = [{"title": "title of post 1", "content": "content of post 1", "id": 1}, {"title": "fav foods", "content": "Pizza!", "id": 2}]

def find_post(id):
    for p in my_posts:
        if p["id"] == id:
            return p

def find_index_post(id):
    for i, p in enumerate(my_posts):
        if p['id'] == id:
            return i

# Define a route at the root web address ("/")
# below is a "path operation" according to the fastAPI documentation.
# below is a decorator (@) which basically connects the api to the function below. This turns the below into an actual path operator
@app.get("/")   # this specifies the html get method and the root path ("/") which is the path after the specific domain name of the api
def read_root():    # can have an async keyword ahead of it which is optional but omitted here. this function is arbitrarily called read_root() but that name doesn't really matter. Use descriptive names so its easy to understand whats going on
    return {"message": "Hello, FastAPI!"}

@app.get("/test")   # this function will be the one that runs is the user enters /test at the end of the domain name (it actually changed it!)
def read_root():   
    return {"message": "Hello, Test!"}

# in order for changes to actually show up in the broswer, run the server with the added parameter --reload (i..e uvicorn main:app --reload) but only do this in the development environment when the code is actually intended to change. Because the production environment should be static, don't include the --reload

@app.get("/posts")
def get_posts():
    return {"data": my_posts}

# create a path operation to create a post
@app.post("/posts", status_code=status.HTTP_201_CREATED)    # the status code will change to the correct status code whenever the create is done right
def create_post(post: Post):    # passing the class above will mean it so that the api automatically validates the input received based on the class described above
    post_dict = post.model_dump()
    post_dict['id'] = randrange(0, 10000000)
    my_posts.append(post_dict)
    return {"data:": post_dict}

@app.get("/posts/latest")   # this needs to go above the next route because the next one takes any variable and in this case, latest counts as any variable, so it would throw an error saying this is not a valid number
def get_latest_post():
    post = my_posts[len(my_posts)-1]
    return {"details": post}

@app.get("/posts/{id}")
def get_post(id: int):  #if not using HTTPexception, you need to add this: response: Response
    post = find_post(id)
    if not post:
        # response.status_code = status.HTTP_404_NOT_FOUND  #using the actual error code to tell the front end that the resource requested cannot be round (doesn't exist)
        # return {"message": f"post with id: {id} was not found"}
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found")  # this is the same way to do the commented out code but using a single line and using an exception
    return {"post_detail": post}

@app.delete("/posts/{id}", status_code=status.HTTP_204_NO_CONTENT)  # the status code for deleting something is 204
def delete_post(id: int):
    # implement the logic for deleting the post (this is just the example from the tutorial, there may be a better way to do it)
    # find the index in the array for the id
    index = find_index_post(id)
    if index == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found") 
    my_posts.pop(index)
    # return {"message": "post was successfully deleted"}   #fastAPI doesn't let you return any content with a 204 so this causes an error
    return Response(status_code=status.HTTP_204_NO_CONTENT) # this is how you need to do the delete return 

@app.put("/posts/{id}")
def update_post(id: int, post: Post):
    index = find_index_post(id)
    if index == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"post with id: {id} was not found") 
    post_dict = post.model_dump()
    post_dict["id"] = id
    my_posts[index] = post_dict
    return {"data": post_dict}


# always use the correct status code: 404 is a not found error, successfully created an entity is a 201
# you can use the automatic documentation be adding /docs# to the end of the url (i.e. localhost:800/docs#)
# to make a python package you need to make sure to include the file called "__init__py" (it can be empty) and you can just change the address to be app.main:app 