
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.auth.dependencies import get_current_user
from app.api.datasets import verify_dataset_ownership, read_dataset
from app.services.chart_tool import generate_chart_data
from app.services.dataset_storage import get_dataset_path


router = APIRouter(
    prefix="/charts",
    tags=["Chart Tool"],
)


class ChartRequest(BaseModel):
    dataset: str
    chart_type: str
    x_column: str
    y_column: Optional[str] = None


@router.post("/")
def create_chart(
    request: ChartRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        # Verify that this dataset belongs to the logged-in user.
        verify_dataset_ownership(
            request.dataset,
            current_user["id"],
        )

        dataset_path = get_dataset_path(request.dataset)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset file not found",
            )

        # Use the shared reader so special CSV headers are handled.
        df = read_dataset(
            dataset_path,
            request.dataset,
        )

        # Validate requested columns before generating the chart.
        if request.x_column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Column '{request.x_column}' not found. "
                    f"Available columns: {df.columns.tolist()}"
                ),
            )

        if (
            request.y_column
            and request.y_column not in df.columns
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Column '{request.y_column}' not found. "
                    f"Available columns: {df.columns.tolist()}"
                ),
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
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
