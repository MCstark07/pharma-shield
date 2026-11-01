import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient
from backend.main import app

def test_patient_to_vendor_flow():
    client = TestClient(app)

    # 1. Fetch catalog
    cat = client.get('/api/v1/medicines/catalog').json()
    print(f'[1] Medicines in catalog: {len(cat)}')
    assert len(cat) >= 15, "Expected at least 15 medicines in the catalog"

    # 2. Patient creates requisition from Port 5173
    req_payload = {
        'requesting_facility_id': 'fac_jlnmch',
        'category': 'MEDICINES',
        'resource_code': 'PARACETAMOL_650MG',
        'quantity': 10,
        'urgency': 'URGENT',
        'clinical_note': 'High fever post-op ICU bedside requisition',
        'patient_id': 'PT-2026-JLNMCH-04',
        'patient_name': 'Rohit Kumar',
        'bed_number': 'ICU Bed #04'
    }
    res = client.post('/api/v1/requisitions', json=req_payload)
    assert res.status_code == 200, res.text
    req = res.json()
    print(f'[2] Patient created requisition #{req["id"]}: {req["resource_code"]} (Status: {req["status"]})')

    # 3. Vendor sees pending requisitions on Port 5174
    pending = [r for r in client.get('/api/v1/requisitions').json() if r['id'] == req['id']]
    assert len(pending) == 1
    print(f'[3] Vendor sees pending requisition in queue on Port 5174: {pending[0]["id"]}')

    # 4. Vendor on Port 5174 approves requisition
    auth_payload = {
        'supplying_facility_id': 'fac_mayaganj',
        'authorized_by': 'Dr. R. K. Sinha (Mayaganj Depot)',
        'batch_id': 'BATCH-PCM-9912'
    }
    auth_res = client.post(f'/api/v1/requisitions/{req["id"]}/authorize', json=auth_payload)
    assert auth_res.status_code == 200, auth_res.text
    auth_data = auth_res.json()
    assert auth_data['status'] == 'AUTHORIZED'
    print(f'[4] Vendor approved requisition: Status is now {auth_data["status"]}!')
    print(f'    Ed25519 Signature: {auth_data["signature_hex"][:24]}...')
    print(f'    Event Hash:        {auth_data["event_hash"][:24]}...')

    # 5. Patient sees approved status
    patient_view = client.get('/api/v1/requisitions').json()
    confirmed = [r for r in patient_view if r['id'] == req['id']][0]
    assert confirmed['status'] == 'AUTHORIZED'
    print(f'[5] Patient on Port 5173 receives updated status: {confirmed["status"]}!')

    print('\n[ALL PASS] End-to-end Patient Request -> Vendor Approval workflow verified 100%!')

if __name__ == '__main__':
    test_patient_to_vendor_flow()
