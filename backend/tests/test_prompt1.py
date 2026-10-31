import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_prompt1_deliverables():
    print("\n" + "=" * 65)
    print("VERIFYING PROMPT 1: BACKEND CORE, DATABASE & REST APIS")
    print("=" * 65)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"/health failed: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    print("[PASS] GET /health ->", health_data)

    # 2. Inventory API tests
    # a. List all inventory
    res = client.get("/api/v1/inventory")
    assert res.status_code == 200, f"GET /api/v1/inventory failed: {res.text}"
    all_items = res.json()
    assert len(all_items) == 15, f"Expected 15 batches, got {len(all_items)}"
    print(f"[PASS] GET /api/v1/inventory -> Found {len(all_items)} seeded batches")

    # b. Filter by category
    res = client.get("/api/v1/inventory?category=BLOOD_COMPONENTS")
    assert res.status_code == 200
    blood_items = res.json()
    assert len(blood_items) == 5, f"Expected 5 blood batches, got {len(blood_items)}"
    print(f"[PASS] GET /api/v1/inventory?category=BLOOD_COMPONENTS -> Found {len(blood_items)} batches")

    # c. Filter by facility
    res = client.get("/api/v1/inventory?facility_id=fac_jlnmch")
    assert res.status_code == 200
    jlnmch_items = res.json()
    assert len(jlnmch_items) > 0
    print(f"[PASS] GET /api/v1/inventory?facility_id=fac_jlnmch -> Found {len(jlnmch_items)} batches")

    # d. Stock alerts filter (DOS < 2.0 or units <= 5)
    res = client.get("/api/v1/inventory?stock_alert=true")
    assert res.status_code == 200
    alert_items = res.json()
    assert len(alert_items) >= 1
    # Verify the low-stock item (O+ blood at JLNMCH) is in the alerts
    low_stock_found = any(i["resource_code"] == "O_POS_RBC" and i["facility_id"] == "fac_jlnmch" for i in alert_items)
    assert low_stock_found, "O+ blood low stock scenario was not flagged in stock alerts"
    print(f"[PASS] GET /api/v1/inventory?stock_alert=true -> Found {len(alert_items)} low-stock items (O+ RBC at JLNMCH verified)")

    # 3. Medical Requests API tests
    # a. POST /api/v1/requests
    req_payload = {
        "requesting_facility_id": "fac_jlnmch",
        "category": "BLOOD_COMPONENTS",
        "resource_code": "O_POS_RBC",
        "quantity": 6,
        "urgency": "CRITICAL",
        "clinical_note_redacted": "Acute trauma resuscitation unit requisition"
    }
    res = client.post("/api/v1/requests", json=req_payload)
    assert res.status_code == 200, f"POST /api/v1/requests failed: {res.text}"
    created_req = res.json()
    assert created_req["status"] == "OPEN"
    req_id = created_req["id"]
    print(f"[PASS] POST /api/v1/requests -> Created request ID: {req_id}")

    # b. GET /api/v1/requests
    res = client.get("/api/v1/requests")
    assert res.status_code == 200
    requests_list = res.json()
    assert any(r["id"] == req_id for r in requests_list)
    print(f"[PASS] GET /api/v1/requests -> Listed {len(requests_list)} medical requests")

    # 4. Shipments API tests
    # a. POST /api/v1/shipments (create dispatch)
    shipment_payload = {
        "request_id": req_id,
        "sender_id": "fac_mayaganj",
        "recipient_id": "fac_jlnmch",
        "driver_name": "AMBULANCE_PILOT_BHG_09",
        "min_temp": 2.0,
        "max_temp": 8.0,
        "requires_cold_chain": True
    }
    res = client.post("/api/v1/shipments", json=shipment_payload)
    assert res.status_code == 200, f"POST /api/v1/shipments failed: {res.text}"
    new_shipment = res.json()
    assert new_shipment["status"] == "DISPATCHED"
    shipment_id = new_shipment["id"]
    print(f"[PASS] POST /api/v1/shipments -> Dispatched shipment ID: {shipment_id}")

    # b. POST /api/v1/shipments/{id}/telemetry (Normal reading: 4.2°C)
    normal_telemetry = {
        "shipment_id": shipment_id,
        "temperature_c": 4.2,
        "humidity_percent": 52.0,
        "latitude": 25.2425,
        "longitude": 87.0145
    }
    res = client.post(f"/api/v1/shipments/{shipment_id}/telemetry", json=normal_telemetry)
    assert res.status_code == 200, f"Normal telemetry failed: {res.text}"
    tele_res = res.json()
    assert tele_res["is_excursion"] is False
    # Check shipment status transitioned to IN_TRANSIT
    res = client.get(f"/api/v1/shipments/{shipment_id}")
    assert res.json()["status"] == "IN_TRANSIT"
    print(f"[PASS] POST /api/v1/shipments/{shipment_id}/telemetry (4.2°C) -> Status: IN_TRANSIT, Excursion: False")

    # c. POST /api/v1/shipments/{id}/telemetry (Excursion reading: 12.8°C > 8.0°C)
    excursion_telemetry = {
        "shipment_id": shipment_id,
        "temperature_c": 12.8,
        "humidity_percent": 54.0,
        "latitude": 25.2435,
        "longitude": 87.0135
    }
    res = client.post(f"/api/v1/shipments/{shipment_id}/telemetry", json=excursion_telemetry)
    assert res.status_code == 200, f"Excursion telemetry failed: {res.text}"
    excursion_res = res.json()
    assert excursion_res["is_excursion"] is True
    # Check shipment status transitioned to UNDER_REVIEW
    res = client.get(f"/api/v1/shipments/{shipment_id}")
    assert res.json()["status"] == "UNDER_REVIEW"
    print(f"[PASS] POST /api/v1/shipments/{shipment_id}/telemetry (12.8°C) -> EXCURSION FLAGGED, Status: UNDER_REVIEW")

    print("\n" + "=" * 65)
    print("ALL PROMPT 1 DELIVERABLES FULLY VERIFIED END-TO-END!")
    print("=" * 65)

if __name__ == "__main__":
    test_prompt1_deliverables()

