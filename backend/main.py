"""
PharmaShield — Central Backend Entrypoint (Port 8000)
Hosts REST API v1, WebSocket real-time bus (/ws/events and /ws), and cryptographic ledger.
"""

import sys
import os

# Ensure project root is always in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn

from backend.app.core.config import settings
from backend.app.core.database import Base, engine, get_db
from backend.app.core.docs_ui import get_custom_docs_html
from backend.app.api.routes import router as api_router
from backend.app.api.v1 import (
    auth,
    inventory,
    requests,
    shipments,
    ai,
    security
)
from backend.app.websockets import manager

# Initialize database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[DB INIT] SQLite auto-creation notice: {e}")

app = FastAPI(
    title="PharmaShield Central Real-Time Bus & Cryptographic Ledger",
    version=settings.VERSION,
    description="Central real-time logistics engine connecting Doctor, Pharma Ops, and Cyber Lab portals.",
    docs_url=None,  # Custom 3D Three.js & Matter.js docs mounted below
)

# CORS Middleware allowing all portal origins (5173, 5174, 5175, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount central tripartite unified routes & WebSocket bus
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router)  # Also mounts /ws/events directly at root

# Backwards compatibility with previous v1 modules
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(requests.router, prefix=settings.API_V1_STR)
app.include_router(shipments.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)

# Legacy /ws WebSocket Endpoint
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
        db_status = "CONNECTED"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "HEALTHY",
        "system": "PharmaShield Central Bus",
        "version": settings.VERSION,
        "database": db_status,
        "crypto_ledger": "ACTIVE",
        "websocket_bus": "/ws/events",
        "port": 8000,
        "zone": "Bhagalpur, Bihar"
    }

@app.get("/docs", response_class=HTMLResponse, include_in_schema=False)
def custom_docs():
    """Custom futuristic dark-mode API Docs featuring Three.js 3D Bio-Vial & Matter.js physics."""
    return get_custom_docs_html(
        title="PharmaShield Cyber-Logistics | 3D Interactive API Studio",
        openapi_url="/openapi.json"
    )

@app.get("/")
def root():
    return {
        "system": "PharmaShield Tripartite Central Engine",
        "status": "ONLINE",
        "version": settings.VERSION,
        "portals": {
            "portal_1_clinical": "http://localhost:5173",
            "portal_2_pharma_ops": "http://localhost:5174",
            "portal_3_cyber_lab": "http://localhost:5175",
        },
        "websocket_bus": "ws://localhost:8000/ws/events",
        "health_check": "/health",
        "docs_url": "/docs",
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
