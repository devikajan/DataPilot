
import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.database import get_connection

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="JWT_SECRET_KEY is not configured.",
        )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        user_id = int(user_id)

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )

    connection = get_connection()
    cursor = connection.cursor()

    is_postgres = connection.__class__.__module__.startswith("psycopg")
    placeholder = "%s" if is_postgres else "?"
    table_name = '"Users"' if is_postgres else "Users"

    try:
        cursor.execute(
            f"""
            SELECT id, name, email
            FROM {table_name}
            WHERE id = {placeholder}
            """,
            (user_id,),
        )

        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User no longer exists.",
            )

        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
        }

    finally:
        cursor.close()
        connection.close()
