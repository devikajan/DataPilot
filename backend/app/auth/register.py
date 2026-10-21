
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from app.database import get_connection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=72,
    )


@router.post("/register")
def register_user(request: RegisterRequest):
    connection = get_connection()
    cursor = connection.cursor()

    is_postgres = connection.__class__.__module__.startswith("psycopg")
    placeholder = "%s" if is_postgres else "?"

    # PostgreSQL folds unquoted identifiers to lowercase.
    table_name = '"Users"' if is_postgres else "Users"

    try:
        cursor.execute(
            f"SELECT id FROM {table_name} WHERE email = {placeholder}",
            (request.email,),
        )

        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists.",
            )

        password_hash = pwd_context.hash(request.password)

        cursor.execute(
            f"""
            INSERT INTO {table_name} (name, email, password_hash)
            VALUES ({placeholder}, {placeholder}, {placeholder})
            """,
            (
                request.name,
                request.email,
                password_hash,
            ),
        )

        connection.commit()

        return {
            "message": "Account created successfully.",
            "name": request.name,
            "email": request.email,
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create the account. Please try again.",
        )

    finally:
        cursor.close()
        connection.close()
