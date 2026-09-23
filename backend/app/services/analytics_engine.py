import pandas as pd


def generate_insights(df: pd.DataFrame) -> dict:
    insights = []

    # ---------------------------------------------------------
    # Basic dataset information
    # ---------------------------------------------------------

    insights.append({
        "type": "dataset_summary",
        "message": (
            f"The dataset contains {df.shape[0]} rows "
            f"and {df.shape[1]} columns."
        ),
    })

    # ---------------------------------------------------------
    # Detect column types
    # ---------------------------------------------------------

    numeric_columns = df.select_dtypes(
        include="number"
    ).columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    # ---------------------------------------------------------
    # Detect datetime columns
    # ---------------------------------------------------------

    datetime_columns = []

    for column in df.columns:

        # Already recognized as datetime
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            datetime_columns.append(column)
            continue

        # Try to detect dates stored as text
        if df[column].dtype == "object":

            converted = pd.to_datetime(
                df[column],
                errors="coerce"
            )

            valid_ratio = converted.notna().mean()

            # Consider it a date column if at least 80%
            # of the values can be interpreted as dates
            if valid_ratio >= 0.8:
                datetime_columns.append(column)

    insights.append({
        "type": "numeric_columns",
        "columns": numeric_columns,
    })

    insights.append({
        "type": "categorical_columns",
        "columns": categorical_columns,
    })

    insights.append({
        "type": "datetime_columns",
        "columns": datetime_columns,
    })

    # ---------------------------------------------------------
    # Missing values
    # ---------------------------------------------------------

    missing_values = {
        column: int(df[column].isna().sum())
        for column in df.columns
        if df[column].isna().sum() > 0
    }

    insights.append({
        "type": "missing_values",
        "columns": missing_values,
    })

    # ---------------------------------------------------------
    # Duplicate rows
    # ---------------------------------------------------------

    duplicate_rows = int(df.duplicated().sum())

    insights.append({
        "type": "duplicate_rows",
        "count": duplicate_rows,
    })

    # ---------------------------------------------------------
    # Numeric summaries
    # ---------------------------------------------------------

    numeric_summary = {}

    for column in numeric_columns:

        series = df[column]

        numeric_summary[column] = {
            "min": safe_value(series.min()),
            "max": safe_value(series.max()),
            "mean": safe_value(series.mean()),
            "median": safe_value(series.median()),
            "std": safe_value(series.std()),
        }

    insights.append({
        "type": "numeric_summary",
        "data": numeric_summary,
    })

    # ---------------------------------------------------------
    # Categorical summaries
    # ---------------------------------------------------------

    categorical_summary = {}

    for column in categorical_columns:

        series = df[column]

        value_counts = (
            series
            .value_counts(dropna=False)
            .head(10)
        )

        categorical_summary[column] = [
            {
                "value": safe_value(value),
                "count": int(count),
            }
            for value, count in value_counts.items()
        ]

    insights.append({
        "type": "categorical_summary",
        "data": categorical_summary,
    })

    # ---------------------------------------------------------
    # Time-series analysis
    # ---------------------------------------------------------

    time_series_data = {}

    for date_column in datetime_columns:

        dates = pd.to_datetime(
            df[date_column],
            errors="coerce"
        )

        valid_mask = dates.notna()

        if valid_mask.sum() == 0:
            continue

        date_df = df.loc[valid_mask].copy()

        date_df["_parsed_date"] = dates.loc[valid_mask]

        valid_dates = dates.loc[valid_mask]

        numeric_columns_for_trend = [
            column
            for column in numeric_columns
            if column != date_column
        ]

        trend_data = {}

        for numeric_column in numeric_columns_for_trend:

            grouped = (
                date_df
                .groupby("_parsed_date")[numeric_column]
                .mean()
                .sort_index()
            )

            trend_data[numeric_column] = [
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "value": safe_value(value),
                }
                for date, value in grouped.items()
            ]

        time_series_data[date_column] = {
            "min_date": valid_dates.min().strftime("%Y-%m-%d"),
            "max_date": valid_dates.max().strftime("%Y-%m-%d"),
            "unique_dates": int(valid_dates.nunique()),
            "trends": trend_data,
        }

    insights.append({
        "type": "time_series_summary",
        "data": time_series_data,
    })

    # ---------------------------------------------------------
    # Correlations
    # ---------------------------------------------------------

    correlation_data = {}

    if len(numeric_columns) >= 2:

        correlation_matrix = df[numeric_columns].corr()

        for column in numeric_columns:

            correlation_data[column] = {
                other_column: safe_value(
                    correlation_matrix.loc[column, other_column]
                )
                for other_column in numeric_columns
                if other_column != column
            }

    insights.append({
        "type": "correlations",
        "data": correlation_data,
    })

    # ---------------------------------------------------------
    # Dataset overview
    # ---------------------------------------------------------

    insights.append({
        "type": "dataset_overview",
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "numeric_column_count": len(numeric_columns),
        "categorical_column_count": len(categorical_columns),
        "datetime_column_count": len(datetime_columns),
        "duplicate_rows": duplicate_rows,
        "missing_value_count": int(df.isna().sum().sum()),
    })

    # ---------------------------------------------------------
    # Final response
    # ---------------------------------------------------------

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