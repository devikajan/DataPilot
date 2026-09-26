import pandas as pd
from typing import Optional

def generate_chart_data(
    df: pd.DataFrame,
    chart_type: str,
    x_column: str,
    y_column: Optional[str] = None,
):
    """
    Prepare dataset data for frontend visualization.

    Supported chart types:
    - line
    - bar
    - scatter
    - histogram
    """

    if x_column not in df.columns:
        raise ValueError(
            f"Column '{x_column}' does not exist."
        )

    if y_column is not None and y_column not in df.columns:
        raise ValueError(
            f"Column '{y_column}' does not exist."
        )

    if chart_type not in [
        "line",
        "bar",
        "scatter",
        "histogram",
    ]:
        raise ValueError(
            f"Unsupported chart type: {chart_type}"
        )

    if chart_type in ["line", "bar", "scatter"]:
        if y_column is None:
            raise ValueError(
                "A y column is required for this chart type."
            )

        result = df[[x_column, y_column]].dropna()

    else:
        result = df[[x_column]].dropna()

    return {
        "chart_type": chart_type,
        "x": x_column,
        "y": y_column,
        "data": result.to_dict(orient="records"),
    }