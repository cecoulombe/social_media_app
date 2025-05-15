import psycopg2;
from psycopg2.extras import RealDictCursor;
from fastapi import HTTPException, status


def get_db():
    try:
        conn = psycopg2.connect(host='localhost', 
                                database='fastapi', 
                                user='postgres', 
                                password='12345678') 
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("Database connection was successful")
        return conn, cursor
    except Exception as error:
        print("Connection to database failed")
        print("Error: ", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database connection failed")
        exit(0)