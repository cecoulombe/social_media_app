# Path operations converning users
from fastapi import Body, FastAPI, Response, status, HTTPException, APIRouter
from app import schema as sch
from app import utils
from app.database import get_db
import psycopg2

router = APIRouter(
    prefix="/users",
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
        cursor.execute("""INSERT INTO users (email, password) VALUES (%s, %s) RETURNING *""", (user.email, user.password))
        new_user = cursor.fetchone()
        conn.commit()  
        return {"data": sch.UserOut(**new_user)}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail = f"Unexpected error: {str(e)}")
    
# Retreive the information from a specific user based on id
@router.get("/{id}")
def get_user(id: int):
    conn, cursor = get_db()
    cursor.execute("""SELECT * FROM users WHERE id = %s""", (str(id),))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {id} does not exist")
    return {"data": sch.UserOut(**user)}
