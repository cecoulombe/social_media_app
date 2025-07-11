# Includes utility functions such as hashing
from passlib.context import CryptContext

# defining the setting for hashing passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# hash the incoming password
def hash(password: str):
    return pwd_context.hash(password)

# verify that the attempted password is the same as the real password
def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# S3 HELPER
import boto3
import os

s3_client = boto3.client("s3", region_name=os.getenv("AWS_REGION"))
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# helper function to delete a file from s3 by its key
def delete_s3_object(filename: str):
    # print(f"[DEBUG] Calling delete_s3_object with BUCKET_NAME={repr(BUCKET_NAME)}, filename={repr(filename)}")

    if not isinstance(filename, str) or not filename.strip():
        raise ValueError(f"delete_s3_object expected a non-empty string, got: {repr(filename)}")

    if not isinstance(BUCKET_NAME, str) or not BUCKET_NAME.strip():
        raise ValueError(f"BUCKET_NAME is invalid or missing: {repr(BUCKET_NAME)}")

    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=filename)
        print(f"Deleted S3 object: {filename}")
    except Exception as e:
        print(f"utils: Failed to delete S3 object: {e}")
