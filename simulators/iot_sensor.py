import time
import requests
import random
from datetime import datetime, timezone

API_BASE = "http://127.0.0.1:8000/api/v1"

def run_simulation(shipment_id: str = "ship_mayaganj_to_jlnmch", trigger_excursion_after_steps: int = 4):
    print("=" * 65)
    print("  PHARMASHIELD COLD-CHAIN IoT SENSOR SIMULATOR (2.0°C - 8.0°C)  ")
    print("=" * 65)
    print(f"Tracking Shipment: {shipment_id}")
    print(f"Will trigger thermal excursion on Step {trigger_excursion_after_steps}\n")

    # Bhagalpur transit route coordinates from Mayaganj to JLNMCH
    route = [
        (25.2420, 87.0150),
        (25.2423, 87.0147),
        (25.2428, 87.0142),
        (25.2435, 87.0135),
        (25.2440, 87.0130),
        (25.2445, 87.0125),
    ]

    for step, (lat, lng) in enumerate(route, 1):
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Trigger excursion if step reached
        if step == trigger_excursion_after_steps:
            temperature = 12.4  # Thermal excursion above 8.0°C!
            print(f"[!] STEP {step}: TRIGGERING THERMAL EXCURSION: {temperature}°C")
        else:
            temperature = round(random.uniform(3.8, 5.2), 2)
            print(f"[*] STEP {step}: Safe zone temperature: {temperature}°C")

        payload = {
            "shipment_id": shipment_id,
            "temperature_c": temperature,
            "humidity_percent": round(random.uniform(45.0, 55.0), 1),
            "latitude": lat,
            "longitude": lng,
            "timestamp_utc": now_iso,
            "battery_level": round(99.0 - (step * 0.5), 1)
        }

        try:
            res = requests.post(f"{API_BASE}/shipments/telemetry", json=payload, timeout=5)
            if res.status_code == 200:
                data = res.json()
                if data.get("is_excursion"):
                    print(f"    --> ALERT: Backend flagged EXCURSION! Status transitioned to UNDER_REVIEW.")
                else:
                    print(f"    --> Telemetry ingested successfully. Position: ({lat}, {lng})")
            else:
                print(f"    --> Error {res.status_code}: {res.text}")
        except Exception as e:
            print(f"    --> Failed to connect to backend: {e}")

        time.sleep(2)

    print("\n[+] Simulation run completed.")

if __name__ == "__main__":
    run_simulation()

