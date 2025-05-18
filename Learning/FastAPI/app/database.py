import psycopg2;
from psycopg2.extras import RealDictCursor;
from fastapi import HTTPException, status
from app.config import settings

def get_db():
    try:
        conn = psycopg2.connect(host=settings.database_hostname, 
                                port=settings.database_port,
                                database=settings.database_name, 
                                user=settings.database_username, 
                                password=settings.database_password) 
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("Database connection was successful")
        return conn, cursor
    except Exception as error:
        print("Connection to database failed")
        print("Error: ", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")
        exit(0)