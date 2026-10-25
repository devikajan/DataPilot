
import os

from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """
    Connect to PostgreSQL when DATABASE_URL is configured.
    Otherwise, connect to SQL Server.
    """

    database_url = os.getenv("DATABASE_URL")

    if database_url:
        import psycopg

        return psycopg.connect(
            database_url,
            connect_timeout=10,
        )

    import pyodbc

    server = os.getenv("DB_SERVER", "localhost")
    port = os.getenv("DB_PORT", "1433")
    database = os.getenv("DB_NAME", "DataPilot")
    username = os.getenv("DB_USERNAME", "sa")
    password = os.getenv("DB_PASSWORD")

    if not password:
        raise ValueError(
            "Database configuration missing: set DATABASE_URL "
            "for PostgreSQL or DB_PASSWORD for SQL Server."
        )

    connection_string = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={server},{port};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        "Encrypt=yes;"
        "TrustServerCertificate=yes;"
        "Connection Timeout=10;"
    )

    return pyodbc.connect(connection_string)
