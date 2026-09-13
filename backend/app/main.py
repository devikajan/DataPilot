from fastapi import FastAPI

app = FastAPI(
    title="DataPilot API",
    description="Autonomous AI-powered business intelligence platform",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DataPilot API",
        "version": "0.1.0",
    }