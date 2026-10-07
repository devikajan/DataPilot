import json
from app.services.openai_client import client
from app.services.tool_registry import get_tool_descriptions, get_tool


def ask_agent(question: str, dataset_context: str, df) -> str:
    tools = get_tool_descriptions()

    tool_context = "\n".join(
        f"- {tool['name']}: {tool['description']}"
        for tool in tools
    )

    # Ask the LLM which analytical tool is appropriate.
    planning_response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are the planning component of DataPilot AI Analyst. "
            "Determine which analytical tool should be used to answer "
            "the user's question.\n\n"
            "Available tools:\n"
            f"{tool_context}\n\n"
            "Only select from these exact tool names:\n"
            "- query_dataset\n"
            "- generate_insights\n"
            "- generate_chart\n\n"

            "Return ONLY valid JSON.\n\n"

            "For query_dataset, use:\n"
            '{"tool": "query_dataset", "operation": "operation_name", '
            '"column": "column_name"}\n\n'

            "For generate_insights, use:\n"
            '{"tool": "generate_insights"}\n\n'

            "For generate_chart, use:\n"
            '{"tool": "generate_chart", "chart_type": "line", '
            '"x_column": "Date", "y_column": "Revenue"}\n\n'

            "For row_count or column_count, use null for column. "
            "For operations that do not require a column, use null. "
            "For charts, choose an appropriate chart_type from: "
            "line, bar, scatter, histogram. "
            "Use the exact column names provided in the dataset columns. "
            "Do not invent column names. "
            "If the question cannot be answered by a deterministic "
            "tool, select generate_insights."
        ),
        input=f"""
Dataset columns:
{list(df.columns)}

User question:
{question}
""",
    )

    try:
        plan = json.loads(planning_response.output_text)
    except json.JSONDecodeError:
        plan = {
            "tool": "generate_insights",
        }

    tool_name = plan.get("tool")

    # Execute Dataset Query Tool.
    if tool_name == "query_dataset":
        operation = plan.get("operation")
        column = plan.get("column")

        tool = get_tool("query_dataset")

        try:
            result = tool(
                df=df,
                operation=operation,
                column=column,
            )
        except Exception as error:
            result = {
                "error": str(error),
            }

    # Execute Analytics Insights Tool.
    elif tool_name == "generate_insights":
        tool = get_tool("generate_insights")

        try:
            result = tool(df)
        except Exception as error:
            result = {
                "error": str(error),
            }

    # Execute Chart Tool.
    elif tool_name == "generate_chart":
        chart_type = plan.get("chart_type")
        x_column = plan.get("x_column")
        y_column = plan.get("y_column")

        tool = get_tool("generate_chart")

        try:
            result = tool(
                df=df,
                chart_type=chart_type,
                x_column=x_column,
                y_column=y_column,
            )
        except Exception as error:
            result = {
                "error": str(error),
            }

    else:
        result = {
            "error": (
                "The AI selected an unsupported analytical tool."
            )
        }

    # Give the tool result to the LLM and generate the final answer.
    final_response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are DataPilot AI Analyst. "
            "Answer the user's question using the tool result provided. "
            "Be concise and factual. "
            "Do not invent values. "
            "If the tool result contains an error or insufficient "
            "information, explain that clearly."
        ),
        input=f"""
User question:
{question}

Tool selected:
{tool_name}

Tool result:
{json.dumps(result, default=str)}
""",
    )

    return {
    "answer": final_response.output_text,
    "tool": tool_name,
    "result": result,
}