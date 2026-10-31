import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_endpoints():
    print("Testing PharmaShield Endpoints...")

    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] GET / ->", res.json())

    # 2. Facilities
    res = client.get("/api/v1/inventory/facilities")
    assert res.status_code == 200, f"Facilities failed: {res.text}"
    facs = res.json()
    assert len(facs) >= 4, f"Expected at least 4 facilities, got {len(facs)}"
    print(f"[PASS] GET /api/v1/inventory/facilities -> {len(facs)} facilities found")

    # 3. Forecasts (DOS)
    res = client.get("/api/v1/ai/forecasts")
    assert res.status_code == 200, f"Forecasts failed: {res.text}"
    forecasts = res.json()
    assert len(forecasts) > 0, "No forecasts returned"
    critical_count = sum(1 for f in forecasts if f["alert_level"] == "CRITICAL")
    print(f"[PASS] GET /api/v1/ai/forecasts -> {len(forecasts)} forecasts ({critical_count} critical alerts)")

    # 4. Ledger & Tamper Simulation
    res = client.get("/api/v1/security/ledger")
    assert res.status_code == 200, f"Ledger failed: {res.text}"
    ledger = res.json()
    assert len(ledger) > 0, "Empty audit ledger"
    first_record = ledger[0]
    print(f"[PASS] GET /api/v1/security/ledger -> {len(ledger)} cryptographically chained records")

    # Tampering test
    res = client.post("/api/v1/security/simulate-tampering", json={
        "audit_record_id": first_record["id"],
        "field_to_modify": "allocated_quantity",
        "tampered_value": 9999
    })
    assert res.status_code == 200, f"Tamper test failed: {res.text}"
    tamper_res = res.json()
    assert tamper_res["tamper_detected"] is True, "Tampering was not detected!"
    assert tamper_res["signature_verified"] is False, "Signature should have failed!"
    print("[PASS] POST /api/v1/security/simulate-tampering -> Tamper instantly caught by Ed25519 signature rejection!")

    print("\nALL VERIFICATION SUITES PASSED END-TO-END!")

if __name__ == "__main__":
    test_endpoints()
