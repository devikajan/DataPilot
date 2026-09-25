from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from app.services.dataset_profiler import profile_dataset
from app.services.analytics_engine import generate_insights
from app.services.dataset_storage import save_dataset, get_dataset_path, DATASET_DIR


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


@router.get("/")
async def list_datasets():

    datasets = []

    for file_path in DATASET_DIR.iterdir():

        if file_path.is_file():

            datasets.append({
                "filename": file_path.name,
                "file_type": file_path.suffix.lower(),
                "size_bytes": file_path.stat().st_size,
            })

    return {
        "datasets": datasets
    }

@router.get("/{filename}/data")
async def get_dataset_data(filename: str):
    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
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
                detail="Unsupported dataset format"
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}"
        )

    rows = df.where(pd.notnull(df), None).to_dict(
        orient="records"
    )

    return {
        "filename": filename,
        "row_count": len(rows),
        "data": rows,
    }

@router.get("/{filename}")
async def get_dataset(filename: str):

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
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
                detail="Unsupported dataset format"
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}"
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
async def upload_dataset(file: UploadFile = File(...)):

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided"
        )

    allowed_extensions = {".csv", ".xlsx", ".xls"}

    extension = "." + file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported"
        )

    try:
        contents = await file.read()

        file.file.seek(0)

        stored_path = save_dataset(
            file,
            file.filename
        )

        if extension == ".csv":
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}"
        )

    profile = profile_dataset(df)

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
async def analyze_dataset(filename: str):

    dataset_path = get_dataset_path(filename)

    if not dataset_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found"
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
                detail="Unsupported dataset format"
            )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read stored dataset: {exc}"
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
            detail=f"Could not analyze dataset: {exc}"
        )