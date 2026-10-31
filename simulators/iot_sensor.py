#!/usr/bin/env python3
"""
PharmaShield — IoT Cold-Chain Sensor Simulator
Simulates a certified GPS/thermal hardware tracker mounted inside an emergency
vaccine / blood transport container in Bhagalpur, Bihar.

Streams telemetry every 2 seconds to:
http://localhost:8000/api/v1/shipments/{id}/telemetry

Demonstrates:
1. Normal optimal operation (4.0°C – 5.5°C)
2. Temperature excursion violation (> 8.0°C, triggering UNDER_REVIEW)
3. Return to normal temperature (proving latching state remains locked)
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    requests = None  # Fallback gracefully if requests is not installed in the global interpreter


# Simulated Route Corridor: Mayaganj Blood Bank (25.2420, 87.0150) -> JLNMCH (25.2445, 87.0125)
TELEMETRY_PROFILE: List[Dict[str, Any]] = [
    {"temp": 4.2, "lat": 25.2420, "lon": 87.0150, "stage": "DISPATCH: Cold storage sealed at Mayaganj Depot"},
    {"temp": 4.5, "lat": 25.2424, "lon": 87.0145, "stage": "TRANSIT: En route through Barari Road corridor"},
    {"temp": 5.1, "lat": 25.2430, "lon": 87.0140, "stage": "TRANSIT: Traffic congestion near Mayaganj Chowk"},
    {"temp": 6.8, "lat": 25.2435, "lon": 87.0135, "stage": "WARNING: Container ambient sensor rising near limit"},
    {"temp": 9.4, "lat": 25.2438, "lon": 87.0132, "stage": "EXCURSION TRIGGER: 9.4°C exceeds 8.0°C limit! [UNDER_REVIEW]"},
    {"temp": 11.2, "lat": 25.2440, "lon": 87.0130, "stage": "EXCURSION CONTINUES: Peak temperature 11.2°C recorded"},
    {"temp": 7.4, "lat": 25.2442, "lon": 87.0128, "stage": "COOLING: Emergency ice-pack deployed; dropping to 7.4°C"},
    {"temp": 4.3, "lat": 25.2445, "lon": 87.0125, "stage": "ARRIVAL: JLNMCH Emergency Gate; state remains UNDER_REVIEW"},
]


def send_telemetry_reading(
    endpoint_url: str,
    shipment_id: str,
    sensor_id: str,
    temperature_celsius: float,
    latitude: float,
    longitude: float,
    battery_pct: int = 96,
    stage_note: str = "",
) -> Dict[str, Any]:
    """
    Constructs a calibrated IoT telemetry packet and transmits it via HTTP POST.
    If the backend server is unreachable, safely falls back to local simulation logging.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    is_excursion = (temperature_celsius < 2.0 or temperature_celsius > 8.0)

    payload = {
        "shipment_id": shipment_id,
        "sensor_id": sensor_id,
        "timestamp_utc": now_iso,
        "temperature_celsius": round(temperature_celsius, 2),
        "latitude": round(latitude, 6),
        "longitude": round(longitude, 6),
        "battery_percentage": battery_pct,
        "excursion_flag": is_excursion,
        "metadata": {
            "ambient_safe_min_celsius": 2.0,
            "ambient_safe_max_celsius": 8.0,
            "stage_annotation": stage_note,
        },
    }

    url = endpoint_url.format(id=shipment_id)
    headers = {"Content-Type": "application/json", "User-Agent": f"PharmaShield-IoT/{sensor_id}"}

    network_status = "LOCAL_SIMULATION"
    response_code = 0
    server_response = None

    if requests is not None:
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=2.5)
            response_code = resp.status_code
            network_status = "TRANSMITTED_ONLINE"
            try:
                server_response = resp.json()
            except Exception:
                server_response = resp.text[:100]
        except requests.exceptions.RequestException as exc:
            network_status = f"OFFLINE ({exc.__class__.__name__})"
    else:
        network_status = "OFFLINE (requests library not found)"

    return {
        "payload": payload,
        "url": url,
        "network_status": network_status,
        "response_code": response_code,
        "server_response": server_response,
    }


def run_sensor_loop(
    shipment_id: str = "SHP-JLNMCH-2026-001",
    base_url: str = "http://localhost:8000/api/v1/shipments",
    interval: float = 2.0,
    sensor_id: str = "IOT-COLDCHAIN-BHAGALPUR-99",
    max_cycles: int = 1,
) -> None:
    """
    Main loop streaming the simulated Bhagalpur medical transport profile.
    """
    endpoint = f"{base_url.rstrip('/')}/{{id}}/telemetry"
    print("=" * 75)
    print(f"PHARMASHIELD COLD-CHAIN IoT SENSOR [{sensor_id}]")
    print(f"Tracking Shipment: {shipment_id}")
    print(f"Telemetry Target:  {endpoint.format(id=shipment_id)}")
    print(f"Sampling Rate:     {interval}s intervals | Safe Zone: 2.0°C – 8.0°C")
    print("=" * 75)

    cycles_completed = 0
    while max_cycles == 0 or cycles_completed < max_cycles:
        for step_idx, step in enumerate(TELEMETRY_PROFILE, start=1):
            temp = step["temp"]
            lat = step["lat"]
            lon = step["lon"]
            stage = step["stage"]

            excursion_badge = "[!! EXCURSION !!]" if (temp < 2.0 or temp > 8.0) else "[SAFE 2-8 C]"

            result = send_telemetry_reading(
                endpoint_url=endpoint,
                shipment_id=shipment_id,
                sensor_id=sensor_id,
                temperature_celsius=temp,
                latitude=lat,
                longitude=lon,
                battery_pct=max(80, 98 - (step_idx * 2)),
                stage_note=stage,
            )

            status_str = (
                f"HTTP {result['response_code']}"
                if result['network_status'] == 'TRANSMITTED_ONLINE'
                else f"LOCAL ({result['network_status']})"
            )

            print(
                f"[{step_idx}/{len(TELEMETRY_PROFILE)}] {excursion_badge} Temp: {temp:4.1f}°C | "
                f"GPS: ({lat:.4f}, {lon:.4f}) | Net: {status_str}"
            )
            print(f"    Context: {stage}")

            if step_idx < len(TELEMETRY_PROFILE):
                time.sleep(interval)

        cycles_completed += 1

    print("\n[SUCCESS] SIMULATED TELEMETRY SEQUENCE FINISHED.")


def main() -> None:
    parser = argparse.ArgumentParser(description="PharmaShield IoT Cold-Chain Sensor Simulator")
    parser.add_argument("--shipment-id", default="SHP-JLNMCH-2026-001", help="Target Shipment ID")
    parser.add_argument("--url", default="http://localhost:8000/api/v1/shipments", help="Base API URL")
    parser.add_argument("--interval", type=float, default=2.0, help="Sampling interval in seconds")
    parser.add_argument("--sensor-id", default="IOT-COLDCHAIN-BHAGALPUR-99", help="Sensor Device Hardware ID")
    parser.add_argument("--cycles", type=int, default=1, help="Number of telemetry cycles (0 for continuous)")
    args = parser.parse_args()

    run_sensor_loop(
        shipment_id=args.shipment_id,
        base_url=args.url,
        interval=args.interval,
        sensor_id=args.sensor_id,
        max_cycles=args.cycles,
    )


if __name__ == "__main__":
    main()

