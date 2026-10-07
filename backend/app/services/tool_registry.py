from app.services.dataset_query import query_dataset
from app.services.analytics_engine import generate_insights
from app.services.chart_tool import generate_chart_data


TOOLS = {
    "query_dataset": {
        "name": "Dataset Query Tool",
        "description": (
            "Performs deterministic calculations on dataset columns, "
            "including totals, averages, minimums, maximums, medians, "
            "row counts, and column counts."
        ),
        "function": query_dataset,
    },
    "generate_insights": {
        "name": "Analytics Insights Tool",
        "description": (
            "Performs comprehensive dataset analysis including summaries, "
            "KPIs, categorical analysis, time-series trends, outliers, "
            "correlations, key findings, and chart recommendations."
        ),
        "function": generate_insights,
    },
    "generate_chart": {
        "name": "Chart Tool",
        "description": (
            "Generates structured visualization data for line, bar, "
            "scatter, and histogram charts."
        ),
        "function": generate_chart_data,
    },
}


def get_tool(tool_name: str):
    """
    Retrieve a registered tool by name.
    """
    if tool_name not in TOOLS:
        raise ValueError(f"Unknown tool: {tool_name}")

    return TOOLS[tool_name]["function"]


def get_tool_descriptions():
    """
    Return tool descriptions for the AI Analyst.
    """
    return [
        {
            "name": key,
            "description": value["description"],
        }
        for key, value in TOOLS.items()
    ]