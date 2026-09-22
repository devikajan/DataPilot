import pandas as pd


def generate_insights(df: pd.DataFrame) -> dict:
    insights = []

    # Basic dataset information
    insights.append({
        "type": "dataset_summary",
        "message": (
            f"The dataset contains {df.shape[0]} rows "
            f"and {df.shape[1]} columns."
        ),
    })

    # Numeric columns
    numeric_columns = df.select_dtypes(
        include="number"
    ).columns.tolist()

    insights.append({
        "type": "numeric_columns",
        "columns": numeric_columns,
    })

    # Categorical columns
    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    insights.append({
        "type": "categorical_columns",
        "columns": categorical_columns,
    })

    # Missing values
    missing_values = {
        column: int(df[column].isna().sum())
        for column in df.columns
        if df[column].isna().sum() > 0
    }

    insights.append({
        "type": "missing_values",
        "columns": missing_values,
    })

    # Numeric summaries
    numeric_summary = {}

    for column in numeric_columns:
        series = df[column]

        numeric_summary[column] = {
            "min": safe_value(series.min()),
            "max": safe_value(series.max()),
            "mean": safe_value(series.mean()),
            "median": safe_value(series.median()),
        }

    insights.append({
        "type": "numeric_summary",
        "data": numeric_summary,
    })

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "insights": insights,
    }


def safe_value(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value