import pandas as pd
from typing import Optional

def query_dataset(
    df: pd.DataFrame,
    operation: str,
    column: Optional[str] = None,
):
    """
    Perform deterministic analytical operations on a dataset.

    Supported operations:
    - row_count
    - column_count
    - total
    - average
    - minimum
    - maximum
    - median
    """

    if operation == "row_count":
        return {
            "operation": operation,
            "result": int(len(df)),
        }

    if operation == "column_count":
        return {
            "operation": operation,
            "result": int(len(df.columns)),
        }

    if column is None:
        raise ValueError(
            "A column is required for this operation."
        )

    if column not in df.columns:
        raise ValueError(
            f"Column '{column}' does not exist."
        )

    if not pd.api.types.is_numeric_dtype(df[column]):
        raise ValueError(
            f"Column '{column}' is not numeric."
        )

    series = df[column].dropna()

    if operation == "total":
        result = series.sum()

    elif operation == "average":
        result = series.mean()

    elif operation == "minimum":
        result = series.min()

    elif operation == "maximum":
        result = series.max()

    elif operation == "median":
        result = series.median()

    else:
        raise ValueError(
            f"Unsupported operation: {operation}"
        )

    return {
        "operation": operation,
        "column": column,
        "result": float(result),
    }