from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd

from app.auth.dependencies import get_current_user
from app.database import get_connection
from app.services.dataset_profiler import profile_dataset
from app.services.analytics_engine import generate_insights
from app.services.dataset_storage import (
    save_dataset,
    get_dataset_path,
    DATASET_DIR,
)


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


def verify_dataset_ownership(filename: str, user_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM Datasets
            WHERE filename = ?
              AND user_id = ?
            """,
            (filename, user_id),
        )

        dataset = cursor.fetchone()

        if not dataset:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found",
            )

        return dataset[0]

    finally:
        cursor.close()
        connection.close()


@router.get("/")
async def list_datasets(
    current_user: dict = Depends(get_current_user),
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT
                id,
                filename,
                file_type,
                row_count,
                column_count,
                uploaded_at
            FROM Datasets
            WHERE user_id = ?
            ORDER BY uploaded_at DESC
            """,
            (current_user["id"],),
        )

        rows = cursor.fetchall()

        datasets = []

        for row in rows:
            dataset_path = get_dataset_path(row[1])

            datasets.append({
                "id": row[0],
                "filename": row[1],
                "file_type": row[2],
                "row_count": row[3],
                "column_count": row[4],
                "uploaded_at": row[5],
                "size_bytes": (
                    dataset_path.stat().st_size
                    if dataset_path.exists()
                    else 0
                ),
            })

        return {
            "datasets": datasets
        }

    finally:
        cursor.close()
        connection.close()


@router.get("/{filename}/data")
async def get_dataset_data(
    filename: str,
    current_user: dict = Depends(get_current_user),
):
    verify_dataset_ownership(
        filename,
        current_user["id"],
    )

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    extension = Path(filename).suffix.lower()

    try:
        if extension == ".csv":
            df = pd.read_csv(dataset_path)

        elif extension in {".xlsx", ".xls"}:
            df = pd.read_excel(dataset_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported dataset format",
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    rows = df.where(
        pd.notnull(df),
        None
    ).to_dict(orient="records")

    return {
        "filename": filename,
        "row_count": len(rows),
        "data": rows,
    }


@router.get("/{filename}")
async def get_dataset(
    filename: str,
    current_user: dict = Depends(get_current_user),
):
    verify_dataset_ownership(
        filename,
        current_user["id"],
    )

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    extension = Path(filename).suffix.lower()

    try:
        if extension == ".csv":
            df = pd.read_csv(dataset_path)

        elif extension in {".xlsx", ".xls"}:
            df = pd.read_excel(dataset_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported dataset format",
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    profile = profile_dataset(df)

    preview = (
        df.head(10)
        .fillna("")
        .to_dict(orient="records")
    )

    return {
        "filename": filename,
        "profile": profile,
        "preview": preview,
    }


@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    allowed_extensions = {
        ".csv",
        ".xlsx",
        ".xls",
    }

    extension = "." + file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported",
        )

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM Datasets
            WHERE filename = ?
              AND user_id = ?
            """,
            (
                file.filename,
                current_user["id"],
            ),
        )

        existing_dataset = cursor.fetchone()

        if existing_dataset:
            raise HTTPException(
                status_code=409,
                detail="A dataset with this filename already exists.",
            )

        contents = await file.read()

        if extension == ".csv":
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

        stored_path = save_dataset(
    contents,
    file.filename,
)

        profile = profile_dataset(df)

        cursor.execute(
            """
            INSERT INTO Datasets (
                user_id,
                filename,
                file_type,
                row_count,
                column_count
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_user["id"],
                file.filename,
                extension.lstrip(".").upper(),
                len(df),
                len(df.columns),
            ),
        )

        connection.commit()

    except HTTPException:
        connection.rollback()
        raise

    except Exception as exc:
        connection.rollback()

        raise HTTPException(
            status_code=400,
            detail=f"Could not upload dataset: {exc}",
        )

    finally:
        cursor.close()
        connection.close()

    preview = (
        df.head(10)
        .fillna("")
        .to_dict(orient="records")
    )

    return {
        "filename": file.filename,
        "message": "Dataset uploaded successfully",
        "stored_path": stored_path,
        "profile": profile,
        "preview": preview,
    }


@router.post("/analyze/{filename}")
async def analyze_dataset(
    filename: str,
    current_user: dict = Depends(get_current_user),
):
    verify_dataset_ownership(
        filename,
        current_user["id"],
    )

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    extension = Path(filename).suffix.lower()

    try:
        if extension == ".csv":
            df = pd.read_csv(dataset_path)

        elif extension in {".xlsx", ".xls"}:
            df = pd.read_excel(dataset_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported dataset format",
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read stored dataset: {exc}",
        )

    try:
        analysis = generate_insights(df)

        return {
            "filename": filename,
            "analysis": analysis,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not analyze dataset: {exc}",
        )