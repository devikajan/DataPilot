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
                float(series.isna().mean() * 100), 2
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
    }


def safe_value(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value