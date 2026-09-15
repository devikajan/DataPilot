import pandas as pd


def profile_dataset(df: pd.DataFrame) -> dict:
    column_info = []

    for column in df.columns:
        column_info.append(
            {
                "name": column,
                "data_type": str(df[column].dtype),
                "missing_values": int(df[column].isna().sum()),
                "unique_values": int(df[column].nunique()),
            }
        )

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_details": column_info,
        "duplicate_rows": int(df.duplicated().sum()),
    }