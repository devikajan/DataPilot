import pandas as pd


def profile_dataset(df: pd.DataFrame) -> dict:
    column_details = []

    for column in df.columns:
        series = df[column]

        column_profile = {
            "name": column,
            "data_type": str(series.dtype),
            "missing_values": int(series.isna().sum()),
            "missing_percentage": round(
                float(series.isna().mean() * 100),
                2,
            ),
            "unique_values": int(series.nunique()),
        }

        if pd.api.types.is_numeric_dtype(series):
            column_profile["statistics"] = {
                "min": safe_value(series.min()),
                "max": safe_value(series.max()),
                "mean": safe_value(series.mean()),
                "median": safe_value(series.median()),
            }

        column_details.append(column_profile)

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "duplicate_rows": int(df.duplicated().sum()),
        "column_details": column_details,
        "quality": quality_checks(df),
    }


def quality_checks(df: pd.DataFrame) -> dict:
    warnings = []

    # Missing values
    missing_columns = [
        column
        for column in df.columns
        if df[column].isna().sum() > 0
    ]

    if missing_columns:
        warnings.append({
            "type": "missing_values",
            "columns": missing_columns,
            "message": "Some columns contain missing values.",
        })

    # Duplicate rows
    duplicate_count = int(df.duplicated().sum())

    if duplicate_count > 0:
        warnings.append({
            "type": "duplicate_rows",
            "count": duplicate_count,
            "message": "Dataset contains duplicate rows.",
        })

    # Constant columns
    constant_columns = [
        column
        for column in df.columns
        if df[column].nunique(dropna=False) <= 1
    ]

    if constant_columns:
        warnings.append({
            "type": "constant_columns",
            "columns": constant_columns,
            "message": "Some columns contain only one value.",
        })

    return {
        "status": "warning" if warnings else "good",
        "warnings": warnings,
    }


def safe_value(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value