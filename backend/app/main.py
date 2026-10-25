
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.datasets import router as datasets_router
from app.api.analyst import router as analyst_router
from app.api.query import router as query_router
from app.api.charts import router as charts_router
from app.database import get_connection


app = FastAPI(
    title="DataPilot API",
    description="Autonomous AI-powered business intelligence platform",
    version="0.1.0",
)

# Configure frontend URLs through FRONTEND_URL.
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_urls = os.getenv("FRONTEND_URL", "")

for url in frontend_urls.split(","):
    url = url.strip().rstrip("/")
    if url and url not in allowed_origins:
        allowed_origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


@app.get("/")
def root():
    return {
        "service": "DataPilot API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataPilot API",
        "version": "0.1.0",
    }


@app.get("/db/health")
def database_health_check():
    connection = None
    cursor = None

    try:
        connection = get_connection()
        cursor = connection.cursor()

        is_postgres = connection.__class__.__module__.startswith("psycopg")

        if is_postgres:
            cursor.execute("SELECT current_database()")
        else:
            cursor.execute("SELECT DB_NAME()")

        row = cursor.fetchone()

        return {
            "status": "healthy",
            "database": row[0] if row else "unknown",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "error": "Database connection or health check failed.",
        }

    finally:
        if cursor is not None:
            cursor.close()

        if connection is not None:
            connection.close()


# Public API routes: no user login required.
app.include_router(datasets_router)
app.include_router(analyst_router)
app.include_router(query_router)
app.include_router(charts_router)
