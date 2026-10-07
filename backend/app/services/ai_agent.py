import json

from app.services.openai_client import client
from app.services.tool_registry import get_tool_descriptions, get_tool


def ask_agent(question: str, dataset_context: str, df):
    tools = get_tool_descriptions()

    tool_context = "\n".join(
        f"- {tool['name']}: {tool['description']}"
        for tool in tools
    )

    # =========================================================
    # STEP 1: PLAN
    # =========================================================

    planning_response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are the planning component of DataPilot AI Analyst.\n\n"

            "Your job is to determine which analytical tool should "
            "be used to answer the user's question.\n\n"

            "Available tools:\n"
            f"{tool_context}\n\n"

            "You MUST select exactly one of these tools:\n"
            "- query_dataset\n"
            "- generate_insights\n"
            "- generate_chart\n\n"

            "IMPORTANT TOOL SELECTION RULES:\n\n"

            "1. Use query_dataset when the user asks for a specific "
            "numeric calculation or dataset operation such as:\n"
            "- average\n"
            "- mean\n"
            "- minimum\n"
            "- maximum\n"
            "- median\n"
            "- total\n"
            "- row count\n"
            "- column count\n\n"

            "2. Use generate_insights when the user asks for:\n"
            "- key insights\n"
            "- important patterns\n"
            "- unusual patterns\n"
            "- dataset summary\n"
            "- overall analysis\n"
            "- trends that require broader analysis\n\n"

            "3. ALWAYS use generate_chart when the user asks to:\n"
            "- create a chart\n"
            "- show a chart\n"
            "- plot data\n"
            "- visualize data\n"
            "- graph data\n"
            "- show a graph\n"
            "- compare values visually\n"
            "- show values over time visually\n"
            "- create a visualization\n"
            "- display rainfall/revenue/sales/etc. graphically\n\n"

            "If the user explicitly asks for a chart or visualization, "
            "DO NOT select generate_insights.\n\n"

            "For generate_chart, choose exactly one chart type from:\n"
            "- line\n"
            "- bar\n"
            "- scatter\n"
            "- histogram\n\n"

            "Chart selection rules:\n"
            "- Use line for ordered time-series data or trends over time.\n"
            "- Use bar for categorical comparisons.\n"
            "- Use scatter for relationships between two numeric variables.\n"
            "- Use histogram for the distribution of one numeric variable.\n\n"

            "Use the exact column names provided in the dataset.\n"
            "Never invent or rename dataset columns.\n\n"

            "Return ONLY valid JSON.\n"
            "Do not return Markdown.\n"
            "Do not return Mermaid.\n"
            "Do not return explanations.\n\n"

            "For query_dataset return:\n"
            '{"tool":"query_dataset","operation":"operation_name",'
            '"column":"column_name"}\n\n'

            "For generate_insights return:\n"
            '{"tool":"generate_insights"}\n\n'

            "For generate_chart return:\n"
            '{"tool":"generate_chart","chart_type":"line",'
            '"x_column":"Date","y_column":"Revenue"}\n\n'

            "For row_count and column_count, use null for column.\n"
            "For operations that do not require a column, use null."
        ),
        input=f"""
Dataset columns:
{list(df.columns)}

User question:
{question}
""",
    )

    # =========================================================
    # STEP 2: PARSE PLAN
    # =========================================================

    try:
        plan = json.loads(planning_response.output_text)

    except json.JSONDecodeError:
        plan = {
            "tool": "generate_insights"
        }

    tool_name = plan.get("tool")

    # =========================================================
    # STEP 3: EXECUTE SELECTED TOOL
    # =========================================================

    result = None

    # ---------------------------------------------------------
    # Dataset Query Tool
    # ---------------------------------------------------------

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
                "error": str(error)
            }

    # ---------------------------------------------------------
    # Analytics Insights Tool
    # ---------------------------------------------------------

    elif tool_name == "generate_insights":

        tool = get_tool("generate_insights")

        try:
            result = tool(df)

        except Exception as error:
            result = {
                "error": str(error)
            }

    # ---------------------------------------------------------
    # Chart Tool
    # ---------------------------------------------------------

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
                "error": str(error)
            }

    # ---------------------------------------------------------
    # Unsupported Tool
    # ---------------------------------------------------------

    else:

        result = {
            "error": "The AI selected an unsupported analytical tool."
        }

    # =========================================================
    # STEP 4: FINAL ANSWER
    # =========================================================

    final_response = client.responses.create(
        model="gpt-5.6-luna",
        instructions=(
            "You are DataPilot AI Analyst.\n\n"

            "Answer the user's question using the analytical tool "
            "result provided below.\n\n"

            "GENERAL RULES:\n"
            "- Be concise, factual, and clear.\n"
            "- Use only values supported by the tool result.\n"
            "- Never invent values.\n"
            "- Do not fabricate calculations.\n"
            "- If the tool result contains an error, explain the error.\n\n"

            "IMPORTANT CHART RULE:\n"
            "If the selected tool is generate_chart, the chart has "
            "already been generated by DataPilot's Chart Tool.\n\n"

            "DO NOT generate:\n"
            "- Mermaid diagrams\n"
            "- Mermaid xychart-beta syntax\n"
            "- ASCII charts\n"
            "- Markdown chart syntax\n"
            "- chart code\n"
            "- JavaScript chart code\n"
            "- Python plotting code\n"
            "- SVG chart code\n\n"

            "Instead, provide a short natural-language explanation "
            "of what the generated chart shows.\n\n"

            "For example, if the chart shows rainfall by month, "
            "say something like:\n"
            "\"The chart compares normal and actual rainfall across "
            "the selected periods. Actual rainfall was lower than "
            "normal during June and July, while the values were "
            "very close during early August.\"\n\n"

            "Do not reproduce the chart data unless it is necessary "
            "to answer the user's question.\n"
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

    # =========================================================
    # STEP 5: RETURN STRUCTURED RESPONSE
    # =========================================================

    return {
        "answer": final_response.output_text,
        "tool": tool_name,
        "result": result,
    }