import pandas as pd


def recommend_charts(df: pd.DataFrame) -> list[dict]:
    recommendations = []

    numeric_columns = df.select_dtypes(
        include="number"
    ).columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    datetime_columns = []

    for column in df.columns:

        if pd.api.types.is_datetime64_any_dtype(df[column]):
            datetime_columns.append(column)
            continue

        if df[column].dtype == "object":

            converted = pd.to_datetime(
                df[column],
                errors="coerce"
            )

            if converted.notna().mean() >= 0.8:
                datetime_columns.append(column)

    # ---------------------------------------------------------
    # Date + Numeric → Line Chart
    # ---------------------------------------------------------

    for date_column in datetime_columns:

        for numeric_column in numeric_columns:

            recommendations.append({
                "chart_type": "line",
                "x": date_column,
                "y": numeric_column,
                "reason": (
                    f"{date_column} is a date column and "
                    f"{numeric_column} is numeric."
                ),
            })

    # ---------------------------------------------------------
    # Categorical + Numeric → Bar Chart
    # ---------------------------------------------------------

    for categorical_column in categorical_columns:

        if df[categorical_column].nunique() <= 20:

            for numeric_column in numeric_columns:

                recommendations.append({
                    "chart_type": "bar",
                    "x": categorical_column,
                    "y": numeric_column,
                    "reason": (
                        f"{categorical_column} contains a manageable "
                        f"number of categories."
                    ),
                })

    # ---------------------------------------------------------
    # Numeric + Numeric → Scatter Plot
    # ---------------------------------------------------------

    if len(numeric_columns) >= 2:

        for index, x_column in enumerate(numeric_columns):

            for y_column in numeric_columns[index + 1:]:

                recommendations.append({
                    "chart_type": "scatter",
                    "x": x_column,
                    "y": y_column,
                    "reason": (
                        "Both columns are numeric and can be "
                        "compared using a scatter plot."
                    ),
                })

    # ---------------------------------------------------------
    # Numeric → Histogram
    # ---------------------------------------------------------

    for numeric_column in numeric_columns:

        recommendations.append({
            "chart_type": "histogram",
            "x": numeric_column,
            "reason": (
                f"{numeric_column} is numeric and its "
                "distribution can be visualized."
            ),
        })

    return recommendations