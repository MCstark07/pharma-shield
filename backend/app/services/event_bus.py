"""
PharmaShield — Central Real-Time Event Bus
Provides WebSocket broadcasting across all tripartite portals (Doctor, Ops, Cyber Lab).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket subscribers across all frontends."""

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS BUS] Client connected. Total active portals: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS BUS] Client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]) -> None:
        """Broadcasts real-time JSON message to all connected portal clients."""
        payload = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": data,
        }
        raw_message = json.dumps(payload)
        dead_connections: List[WebSocket] = []

        for connection in list(self.active_connections):
            try:
                await connection.send_text(raw_message)
            except Exception as e:
                print(f"[WS BUS] Error sending to socket: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket) -> None:
        raw_message = json.dumps(message)
        await websocket.send_text(raw_message)


# Global singleton instance used throughout application
event_bus = ConnectionManager()

