import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.chart_tool import generate_chart_data
from app.services.dataset_storage import get_dataset_path

router = APIRouter(prefix="/charts", tags=["Chart Tool"])


class ChartRequest(BaseModel):
    dataset: str
    chart_type: str
    x_column: str
    y_column: str = None


@router.post("/")
def create_chart(request: ChartRequest):
    try:
        dataset_path = get_dataset_path(request.dataset)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset not found"
            )

        if dataset_path.suffix.lower() == ".csv":
            df = pd.read_csv(dataset_path)

        elif dataset_path.suffix.lower() in [".xlsx", ".xls"]:
            df = pd.read_excel(dataset_path)

        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported dataset format"
            )

        result = generate_chart_data(
            df=df,
            chart_type=request.chart_type,
            x_column=request.x_column,
            y_column=request.y_column,
        )

        return {
            "dataset": request.dataset,
            "chart": result,
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )