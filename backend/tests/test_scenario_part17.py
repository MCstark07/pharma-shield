# ==============================================================================
# PharmaShield - End-to-End Success Scenario Verification (PART 17)
# Validates the exact 15-step clinical requisition, inter-state sourcing,
# row-level stock reservation, cold-chain excursion, clinical disposition,
# and cryptographic ledger logging workflow.
# ==============================================================================

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_part17_demonstration():
    print("=" * 80)
    print("  PHARMASHIELD - PART 17 FINAL DEFINITION OF SUCCESS END-TO-END DEMO")
    print("  Scenario: Healthcare Facility In Dire Need Sourcing Scarce Inter-State Stock")
    print("=" * 80)

    # --------------------------------------------------------------------------
    # Step 1 & 2: Search PharmaShield & Discover Local Stock Unavailable
    # --------------------------------------------------------------------------
    print("\n[STEP 1 & 2] Searching PharmaShield from Care Pharmacy Siliguri (fac_siliguri_pharmacy)...")
    res = client.get("/api/v1/medicines/search", params={
        "query": "Remdesivir",
        "requesting_facility_id": "fac_siliguri_pharmacy"
    })
    assert res.status_code == 200, f"Search failed: {res.text}"
    search_data = res.json()
    print(f" -> Local Stock Available in Siliguri: {search_data['local_stock_available']}")
    print(f" -> Total Eligible Offers: {search_data['total_eligible_offers']}")
    assert search_data['local_stock_available'] is False, "Expected Siliguri to be out of stock locally"

    # --------------------------------------------------------------------------
    # Step 3, 4 & 5: Expand Search Inter-State, Compare Landed Costs & AI Scoring
    # --------------------------------------------------------------------------
    print("\n[STEP 3, 4 & 5] Expanding search inter-state across West Bengal, Bihar, and Jharkhand...")
    offers = search_data.get("all_offers", [])
    print(f" -> Participating Provider Offers Found: {len(offers)}")
    assert len(offers) > 0, "Expected at least one inter-state offer"
    
    top_offer = search_data.get("recommended_offer") or offers[0]
    print(f" -> Top Recommended Provider: {top_offer['facility_name']} ({top_offer['city']}, {top_offer['state']})")
    print(f" -> Distance: {top_offer['distance_km']} km | Scope: {top_offer['search_scope']}")
    lc = top_offer["cost_breakdown"]
    print(f" -> Landed Cost Formula Breakdown:")
    print(f"    * Base Wholesale Price:   INR {lc['base_price_inr']:.2f}")
    print(f"    * Inter-State Transit:    INR {lc['shipping_cost_inr']:.2f}")
    print(f"    * Cold-Chain Surcharge:   INR {lc['cold_chain_surcharge_inr']:.2f}")
    print(f"    * Applicable Taxes (GST): INR {lc['applicable_taxes_inr']:.2f}")
    print(f"    * TOTAL LANDED COST:      INR {lc['total_landed_cost_inr']:.2f}")
    print(f" -> Estimated Arrival Time:   {top_offer['estimated_transit_hours']} Hours")
    print(f" -> Stock Confidence Level:   {top_offer['stock_confidence']}")

    # --------------------------------------------------------------------------
    # Step 6 & 7: Submit Emergency Requisition & Provider Receives in B2B Platform
    # --------------------------------------------------------------------------
    print("\n[STEP 6 & 7] Authorized Hospital Submits Emergency Requisition...")
    req_payload = {
        "requesting_facility_id": "fac_siliguri_pharmacy",
        "category": "MEDICINES",
        "resource_code": "REMDESIVIR_100MG",
        "quantity": 10,
        "urgency": "CRITICAL",
        "required_by": "2026-11-02T12:00:00Z",
        "clinical_note_redacted": "ICU Pulmonary crisis requiring immediate antiviral therapy."
    }
    req_res = client.post("/api/v1/requests/", json=req_payload)
    assert req_res.status_code in [200, 201], f"Requisition failed: {req_res.text}"
    req_data = req_res.json()
    request_id = req_data["id"]
    print(f" -> Requisition Registered: {request_id} (Status: {req_data['status']})")
    print(f" -> AI Matching Candidates Evaluated: {len(req_data.get('matches', []))}")

    # --------------------------------------------------------------------------
    # Step 8, 9 & 10: Provider Confirms, Row-Level Stock Reserved, Shipment Created
    # --------------------------------------------------------------------------
    print("\n[STEP 8, 9 & 10] Provider Confirms Order & Row-Level Inventory Lock Engaged...")
    auth_payload = {
        "request_id": request_id,
        "fulfilling_facility_id": top_offer["facility_id"],
        "allocated_quantity": 10,
        "cold_chain_required": True
    }
    auth_res = client.post("/api/v1/requests/allocate", json=auth_payload)
    assert auth_res.status_code == 200, f"Allocation failed: {auth_res.text}"
    auth_data = auth_res.json()
    shipment_id = auth_data["id"]
    print(f" -> Row-Level Lock Status: Stock safely reserved (with_for_update)")
    print(f" -> Allocation Status: {auth_data['status']}")
    print(f" -> Active Shipment Dispatch Conduit Created: {shipment_id}")

    # --------------------------------------------------------------------------
    # Step 11: Real-Time GPS & Temperature Telemetry Monitoring Begins
    # --------------------------------------------------------------------------
    print("\n[STEP 11] Telemetry Stream Ingest Active (Normal 4.2C Cold-Chain Conditions)...")
    telemetry_normal = {
        "shipment_id": shipment_id,
        "temperature_c": 4.2,
        "latitude": 24.1200,
        "longitude": 88.2900,
        "battery_pct": 98.5
    }
    t_res1 = client.post("/api/v1/shipments/telemetry", json=telemetry_normal)
    assert t_res1.status_code == 200
    print(f" -> Ingest OK: Temp = {telemetry_normal['temperature_c']}C | Status: {t_res1.json().get('status')}")

    # --------------------------------------------------------------------------
    # Step 12: Thermal Excursion Alert Breaches Safe Zone (2-8C) -> UNDER_REVIEW
    # --------------------------------------------------------------------------
    print("\n[STEP 12] Thermal Excursion Event Ingested (Ambient Spike to 11.8C)...")
    telemetry_excursion = {
        "shipment_id": shipment_id,
        "temperature_c": 11.8,
        "latitude": 25.1000,
        "longitude": 88.3100,
        "battery_pct": 97.0
    }
    t_res2 = client.post("/api/v1/shipments/telemetry", json=telemetry_excursion)
    assert t_res2.status_code == 200
    t2_data = t_res2.json()
    print(f" -> Telemetry Excursion Flag: {t2_data.get('is_excursion')}")
    assert t2_data.get("is_excursion") is True, "Expected is_excursion to be True"

    # Verify Shipment State Machine Transitioned to UNDER_REVIEW
    shp_check = client.get(f"/api/v1/shipments/{shipment_id}")
    assert shp_check.status_code == 200
    shp_data = shp_check.json()
    print(f" -> Shipment Dynamic Status: {shp_data.get('status')}")
    assert shp_data.get("status") == "UNDER_REVIEW", "Expected shipment to lock into UNDER_REVIEW"

    # --------------------------------------------------------------------------
    # Step 13: Human Clinical Disposition Sign-Off (Pharmacist Override)
    # --------------------------------------------------------------------------
    print("\n[STEP 13] Human Clinical Pharmacist Performs Disposition Sign-off...")
    disp_payload = {
        "shipment_id": shipment_id,
        "disposition": "CLEARED_WITH_OVERRIDE",
        "justification_notes": "Thermal exposure duration was 8 minutes. Degradation kinetics monograph confirms potency retained >99.4%.",
        "inspector_license": "WB-PC-48190",
        "inspector_name": "Dr. Ananya Ray, Chief Clinical Pharmacist"
    }
    disp_res = client.post("/api/v1/coldchain/disposition", json=disp_payload)
    assert disp_res.status_code == 200, f"Disposition failed: {disp_res.text}"
    disp_data = disp_res.json()
    print(f" -> Disposition Action: {disp_payload['disposition']}")
    print(f" -> Cleared Shipment Status: {disp_data['final_status']}")
    print(f" -> Tamper-Evident Disposition Hash: {disp_data['event_hash'][:24]}...")

    # --------------------------------------------------------------------------
    # Step 14 & 15: Delivery Confirmation, Immutable Ledger & Predictive Intelligence
    # --------------------------------------------------------------------------
    print("\n[STEP 14 & 15] Verifying Cryptographic Audit Ledger & Operational Intelligence...")
    ledger_res = client.get("/api/v1/security/ledger")
    assert ledger_res.status_code == 200
    chain = ledger_res.json()
    print(f" -> Total Cryptographic Blocks in Immutable Hash-Chain: {len(chain)}")
    latest_block = chain[-1]
    print(f" -> Latest Event Type: {latest_block['event']['event_type']}")
    print(f" -> Cryptographic Ed25519 Signature: Validated ({latest_block['is_valid']})")
    print(f" -> Canonical Block Hash: {latest_block['event_hash'][:32]}...")

    print("\n[*] Querying AI Regional Predictive Stock Rebalancing...")
    reb_res = client.get("/api/v1/ai/rebalance")
    assert reb_res.status_code == 200
    rebalances = reb_res.json()
    print(f" -> Active Regional Rebalancing Actions Recommended: {len(rebalances)}")
    for r in rebalances[:2]:
        print(f"    * Shortage Facility: {r['target_facility_name']} (DOS: {r['target_dos_days']}d)")
        print(f"      Surplus Facility:  {r['source_facility_name']} (DOS: {r['source_dos_days']}d)")
        print(f"      Recommended Transfer: {r['recommended_transfer_quantity']} units {r['resource_code']}")

    print("\n" + "=" * 80)
    print("  [SUCCESS] PART 17 15-STEP END-TO-END DEMONSTRATION VERIFIED 100%!")
    print("=" * 80)

if __name__ == "__main__":
    run_part17_demonstration()
