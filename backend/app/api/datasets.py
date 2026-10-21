from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pandas as pd

from app.auth.dependencies import get_current_user
from app.database import get_connection
from app.services.dataset_profiler import profile_dataset
from app.services.analytics_engine import generate_insights
from app.services.dataset_storage import save_dataset, get_dataset_path


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}
RESERVOIR_FILENAME = "reservoir summary.csv"


def read_dataset(source, filename: str) -> pd.DataFrame:
    """Read supported datasets and normalize reservoir CSV headers."""
    extension = Path(filename).suffix.lower()

    if extension == ".csv":
        if Path(filename).name.lower() == RESERVOIR_FILENAME:
            df = pd.read_csv(source, skiprows=3)

            df = df.rename(columns={
                "Unnamed: 0": "Reservoir",
                "Unnamed: 9": "Basin",
                "Unnamed: 10": "District",
                "Unnamed: 11": "Alert",
            })

            return df

        return pd.read_csv(source)

    if extension in {".xlsx", ".xls"}:
        return pd.read_excel(source)

    raise HTTPException(
        status_code=400,
        detail="Unsupported dataset format",
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

        return {"datasets": datasets}

    finally:
        cursor.close()
        connection.close()


@router.get("/{filename}/data")
async def get_dataset_data(
    filename: str,
    current_user: dict = Depends(get_current_user),
):
    verify_dataset_ownership(filename, current_user["id"])

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    try:
        df = read_dataset(dataset_path, filename)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    rows = df.astype(object).where(
        pd.notnull(df),
        None,
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
    verify_dataset_ownership(filename, current_user["id"])

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    try:
        df = read_dataset(dataset_path, filename)
        profile = profile_dataset(df)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    preview = df.head(10).fillna("").to_dict(orient="records")

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

    # Remove any client-supplied directory path.
    filename = Path(file.filename.replace("\\", "/")).name
    extension = Path(filename).suffix.lower()

    if not filename or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty",
        )

    # Parse and validate before saving metadata.
    try:
        df = read_dataset(BytesIO(contents), filename)
        profile = profile_dataset(df)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read uploaded dataset: {exc}",
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
            (filename, current_user["id"]),
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="A dataset with this filename already exists.",
            )

        stored_path = save_dataset(contents, filename)

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
                filename,
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
            status_code=500,
            detail=f"Could not save dataset metadata: {exc}",
        )

    finally:
        cursor.close()
        connection.close()

    preview = df.head(10).fillna("").to_dict(orient="records")

    return {
        "filename": filename,
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
    verify_dataset_ownership(filename, current_user["id"])

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset file not found",
        )

    try:
        df = read_dataset(dataset_path, filename)

    except HTTPException:
        raise

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
