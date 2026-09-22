from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

from app.services.dataset_profiler import profile_dataset
from app.services.analytics_engine import generate_insights

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    allowed_extensions = {".csv", ".xlsx", ".xls"}

    extension = "." + file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported",
        )

    try:
        contents = await file.read()

        if extension == ".csv":
            from io import BytesIO

            df = pd.read_csv(BytesIO(contents))

        else:
            from io import BytesIO

            df = pd.read_excel(BytesIO(contents))

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    profile = profile_dataset(df)

    preview = df.head(10).fillna("").to_dict(orient="records")

    return {
        "filename": file.filename,
        "message": "Dataset uploaded successfully",
        "profile": profile,
        "preview": preview,
    }
@router.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided",
        )

    allowed_extensions = {".csv", ".xlsx", ".xls"}

    extension = "." + file.filename.split(".")[-1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported",
        )

    try:
        contents = await file.read()

        from io import BytesIO

        if extension == ".csv":
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read dataset: {exc}",
        )

    try:
        analysis = generate_insights(df)

        return {
            "filename": file.filename,
            "analysis": analysis,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not analyze dataset: {exc}",
        )