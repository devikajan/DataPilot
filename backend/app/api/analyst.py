
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.datasets import read_dataset
from app.services.ai_agent import ask_agent
from app.services.analytics_engine import generate_insights
from app.services.dataset_storage import get_dataset_path


router = APIRouter(
    prefix="/analyst",
    tags=["AI Analyst"],
)


class AnalystRequest(BaseModel):
    dataset: str
    question: str
    document_id: str | None = None


@router.post("/ask")
def ask_analyst(request: AnalystRequest):
    try:
        dataset_path = get_dataset_path(request.dataset)

        if not dataset_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Dataset file not found",
            )

        # Read the dataset using the shared reader.
        df = read_dataset(
            dataset_path,
            request.dataset,
        )

        analysis = generate_insights(df)

        dataset_context = json.dumps(
            analysis,
            default=str,
        )

        agent_result = ask_agent(
    request.question,
    dataset_context,
    df,
    document_id=request.document_id,
)

        return {
            "question": request.question,
            "dataset": request.dataset,
            "answer": agent_result["answer"],
            "tool": agent_result["tool"],
            "result": agent_result["result"],
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the dataset.",
        )
