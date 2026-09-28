from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.datasets import router as datasets_router
from app.api.analyst import router as analyst_router
from app.api.query import router as query_router
from app.api.charts import router as charts_router
from app.database import get_connection
from app.auth.register import router as auth_router
from app.auth.login import router as login_router
from app.auth.session import router as session_router


app = FastAPI(
    title="DataPilot API",
    description="Autonomous AI-powered business intelligence platform",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataPilot API",
        "version": "0.1.0",
    }

@app.get("/db/health")
def database_health_check():
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT DB_NAME()")
        database_name = cursor.fetchone()[0]

        cursor.close()
        connection.close()

        return {
            "status": "healthy",
            "database": database_name,
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "error": str(error),
        }


app.include_router(datasets_router)
app.include_router(analyst_router)
app.include_router(query_router)
app.include_router(charts_router)
app.include_router(auth_router)
app.include_router(login_router)
app.include_router(session_router)