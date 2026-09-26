import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.dataset_query import query_dataset
from app.services.dataset_storage import get_dataset_path


router = APIRouter(prefix="/query", tags=["Dataset Query"])


class QueryRequest(BaseModel):
    dataset: str
    operation: str
    column: str = None


@router.post("/")
def run_query(request: QueryRequest):
    try:
        dataset_path = get_dataset_path(request.dataset)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset not found",
            )

        if dataset_path.suffix.lower() == ".csv":
            df = pd.read_csv(dataset_path)

        elif dataset_path.suffix.lower() in [".xlsx", ".xls"]:
            df = pd.read_excel(dataset_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported dataset format",
            )

        result = query_dataset(
            df,
            request.operation,
            request.column,
        )

        return {
            "dataset": request.dataset,
            "result": result,
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )