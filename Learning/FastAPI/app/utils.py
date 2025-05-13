# Includes utility functions such as hashing

from passlib.context import CryptContext;

# defining the setting for hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# hash the incoming password
def hash(password: str):
    return pwd_context.hash(password)

# verify that the attempted password is the same as the real password
def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)