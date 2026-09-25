import json

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_agent import ask_agent
from app.services.analytics_engine import generate_insights
from app.services.dataset_storage import get_dataset_path


router = APIRouter(prefix="/analyst", tags=["AI Analyst"])


class AnalystRequest(BaseModel):
    dataset: str
    question: str


@router.post("/ask")
def ask_analyst(request: AnalystRequest):
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

        analysis = generate_insights(df)

        dataset_context = json.dumps(
            analysis,
            default=str,
        )

        answer = ask_agent(
            request.question,
            dataset_context,
        )

        return {
            "question": request.question,
            "dataset": request.dataset,
            "answer": answer,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )