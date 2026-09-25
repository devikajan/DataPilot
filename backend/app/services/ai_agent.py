from app.services.openai_client import client


def ask_agent(question: str, dataset_context: str) -> str:
    response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are DataPilot AI Analyst. "
            "You help users understand and analyze datasets. "
            "Give clear, concise, factual answers. "
            "Use only the dataset context provided to answer questions "
            "about the dataset. "
            "Do not invent dataset values. "
            "If the provided context is not sufficient to answer the "
            "question, clearly say that there is not enough information."
        ),
        input=f"""
Dataset context:
{dataset_context}

User question:
{question}
""",
    )

    return response.output_text