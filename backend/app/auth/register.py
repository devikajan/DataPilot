from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

from app.database import get_connection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


from pydantic import BaseModel, EmailStr, Field


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

    try:
        cursor.execute(
            "SELECT id FROM Users WHERE email = ?",
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
            """
            INSERT INTO Users (name, email, password_hash)
            VALUES (?, ?, ?)
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

    except Exception as error:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    finally:
        cursor.close()
        connection.close()