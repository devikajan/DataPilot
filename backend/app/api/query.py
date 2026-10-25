
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.datasets import read_dataset
from app.services.dataset_query import query_dataset
from app.services.dataset_storage import get_dataset_path


router = APIRouter(
    prefix="/query",
    tags=["Dataset Query"],
)


class QueryRequest(BaseModel):
    dataset: str
    operation: str
    column: Optional[str] = None


@router.post("/")
def run_query(request: QueryRequest):
    try:
        dataset_path = get_dataset_path(request.dataset)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset file not found",
            )

        df = read_dataset(
            dataset_path,
            request.dataset,
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

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to query the dataset.",
        )
