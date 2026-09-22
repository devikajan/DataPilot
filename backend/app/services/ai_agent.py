from app.services.openai_client import client


def ask_agent(question: str) -> str:
    response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are DataPilot AI Analyst. "
            "You help users understand and analyze datasets. "
            "Give clear, concise, factual answers. "
            "Do not invent dataset values."
        ),
        input=question,
    )

    return response.output_text