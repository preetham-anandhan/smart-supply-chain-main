"""
Smart Supply Chain AI Engine — Main Entry Point
FastAPI application with route optimization, ETA prediction, and parcel clustering.
"""

import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.ai_server import router as ai_router

app = FastAPI(
    title="Smart Supply Chain AI Engine",
    description="AI-powered route optimization, ETA prediction, and parcel aggregation for Bangalore logistics",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(ai_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "service": "Smart Supply Chain AI Engine",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            "/api/v1/optimize-route",
            "/api/v1/predict-eta",
            "/api/v1/aggregate-parcels",
            "/api/v1/detect-disruption",
            "/api/v1/transport-mode",
            "/api/v1/health",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-engine"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
