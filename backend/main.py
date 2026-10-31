import sys
import os

# Ensure project root is always in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn

from backend.app.core.config import settings
from backend.app.core.database import Base, engine, get_db
from backend.app.websockets import manager
from backend.app.api.v1 import (
    auth,
    inventory,
    requests,
    shipments,
    ai,
    security
)

# Auto-create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent, Predictive & Cryptographically Verifiable Medical Logistics Platform"
)

# CORS Middleware allowing all origins ('*')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(requests.router, prefix=settings.API_V1_STR)
app.include_router(shipments.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)

# Real-time WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Multi-alias Health Check Endpoints (covers /health, /api/health, /api/v1/health)
@app.get("/health")
@app.get("/api/health")
@app.get(f"{settings.API_V1_STR}/health")
def health_endpoint(db: Session = Depends(get_db)):
    """Health check endpoint verifying server & active database connection."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "crypto_standard": "Ed25519 / SHA-256",
        "zone": "Bhagalpur, Bihar"
    }

@app.get("/")
def root_endpoint():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "health_check": "/health",
        "docs_url": "/docs",
        "crypto_standard": "Ed25519 / SHA-256",
        "zone": "Bhagalpur, Bihar"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
