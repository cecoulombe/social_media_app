from jose import JWTError, jwt
from datetime import datetime, timedelta
from app import schema as sch
from fastapi import Depends, status, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.database import get_db
from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Secret key created by running "openssl rand -hex 32" in the terminal
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

# Create and return a new access token
def create_access_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

# decode and verify the passed token
def verify_access_token(token: str, credential_exception):
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        id: str = payload.get("user_id")
        if id is None:
            raise credential_exception
        token_data = sch.TokenData(id=id)
    except JWTError:
        raise credential_exception
    return token_data

# this ensures that any time an endpoint is protected (they need to be logged in), this ensures they have a valid token
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    conn, cursor = get_db()

    token = verify_access_token(token, credentials_exception)
    cursor.execute("""SELECT * FROM users WHERE id = %s""", (str(token.id),))
    user = cursor.fetchone()

    return sch.UserOut(**user)

    # return verify_access_token(token, credentials_exception)