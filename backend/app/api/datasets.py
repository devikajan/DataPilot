
from pathlib import Path
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException

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


def _validate_filename(filename: str) -> str:
    """Reject unsafe filenames and unsupported file extensions."""
    filename = filename.replace("\\", "/")

    if (
        not filename
        or Path(filename).name != filename
        or filename in {".", ".."}
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid dataset filename",
        )

    if Path(filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported",
        )

    return filename


def read_dataset(source, filename: str) -> pd.DataFrame:
    """Read supported datasets and normalize reservoir CSV headers."""
    extension = Path(filename).suffix.lower()

    if extension == ".csv":
        if Path(filename).name.lower() == RESERVOIR_FILENAME:
            df = pd.read_csv(source, skiprows=3)

            return df.rename(columns={
                "Unnamed: 0": "Reservoir",
                "Unnamed: 9": "Basin",
                "Unnamed: 10": "District",
                "Unnamed: 11": "Alert",
            })

        return pd.read_csv(source)

    if extension in {".xlsx", ".xls"}:
        return pd.read_excel(source)

    raise HTTPException(
        status_code=400,
        detail="Unsupported dataset format",
    )


def _database_settings(connection):
    """Return SQL syntax settings for the active database driver."""
    is_postgres = connection.__class__.__module__.startswith("psycopg")

    return (
        "%s" if is_postgres else "?",
        '"datasets"' if is_postgres else "Datasets",
    )


def _get_dataset_metadata(filename: str):
    """Retrieve dataset metadata without user authentication."""
    connection = get_connection()
    cursor = connection.cursor()
    placeholder, table_name = _database_settings(connection)

    try:
        cursor.execute(
            f"""
            SELECT id
            FROM {table_name}
            WHERE filename = {placeholder}
            """,
            (filename,),
        )

        row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found",
            )

        return row[0]

    finally:
        cursor.close()
        connection.close()


@router.get("/")
async def list_datasets():
    """List all uploaded datasets."""
    connection = get_connection()
    cursor = connection.cursor()
    _, table_name = _database_settings(connection)

    try:
        cursor.execute(
            f"""
            SELECT
                id,
                filename,
                file_type,
                row_count,
                column_count,
                uploaded_at
            FROM {table_name}
            ORDER BY uploaded_at DESC
            """
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
                "uploaded_at": (
                    row[5].isoformat() if row[5] else None
                ),
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
async def get_dataset_data(filename: str):
    """Return dataset rows without authentication."""
    filename = _validate_filename(filename)
    _get_dataset_metadata(filename)

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
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read dataset",
        )

    rows = (
        df.astype(object)
        .where(pd.notnull(df), None)
        .to_dict(orient="records")
    )

    return {
        "filename": filename,
        "row_count": len(rows),
        "data": rows,
    }


@router.get("/{filename}")
async def get_dataset(filename: str):
    """Return dataset profiling and preview."""
    filename = _validate_filename(filename)
    _get_dataset_metadata(filename)

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
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read dataset",
        )

    preview = df.head(10).fillna("").to_dict(orient="records")

    return {
        "filename": filename,
        "profile": profile,
        "preview": preview,
    }


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload, profile, and register a dataset without authentication."""
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    filename = Path(
        file.filename.replace("\\", "/")
    ).name

    filename = _validate_filename(filename)
    extension = Path(filename).suffix.lower()

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty",
        )

    try:
        df = read_dataset(BytesIO(contents), filename)
        profile = profile_dataset(df)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read uploaded dataset",
        )
    finally:
        await file.close()

    connection = get_connection()
    cursor = connection.cursor()
    placeholder, table_name = _database_settings(connection)
    stored_path = None

    try:
        cursor.execute(
            f"""
            SELECT id
            FROM {table_name}
            WHERE filename = {placeholder}
            """,
            (filename,),
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="A dataset with this filename already exists.",
            )

        stored_path = save_dataset(contents, filename)

        # Authentication is disabled: no user_id is inserted.
        cursor.execute(
            f"""
            INSERT INTO {table_name} (
                filename,
                file_type,
                row_count,
                column_count
            )
            VALUES (
                {placeholder},
                {placeholder},
                {placeholder},
                {placeholder}
            )
            """,
            (
                filename,
                extension.lstrip(".").upper(),
                len(df),
                len(df.columns),
            ),
        )

        connection.commit()

    except HTTPException:
        connection.rollback()

        if stored_path:
            try:
                Path(stored_path).unlink(missing_ok=True)
            except OSError:
                pass

        raise

    except Exception:
        connection.rollback()

        if stored_path:
            try:
                Path(stored_path).unlink(missing_ok=True)
            except OSError:
                pass

        raise HTTPException(
            status_code=500,
            detail="Could not save dataset metadata. Check your database schema.",
        )

    finally:
        cursor.close()
        connection.close()

    preview = df.head(10).fillna("").to_dict(orient="records")

    return {
        "filename": filename,
        "message": "Dataset uploaded successfully",
        "stored_path": str(stored_path) if stored_path else None,
        "profile": profile,
        "preview": preview,
    }


@router.post("/analyze/{filename}")
async def analyze_dataset(filename: str):
    """Generate insights for a stored dataset without authentication."""
    filename = _validate_filename(filename)
    _get_dataset_metadata(filename)

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
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read stored dataset",
        )

    try:
        analysis = generate_insights(df)

        return {
            "filename": filename,
            "analysis": analysis,
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not analyze dataset",
        )
