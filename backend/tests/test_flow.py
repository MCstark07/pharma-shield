import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import asyncio
from backend.app.api.routes import (
    get_requisitions,
    create_requisition,
    authorize_requisition,
    simulate_attack,
    get_audit_ledger,
)
from backend.app.schemas.contracts import (
    MedicalRequisitionCreate,
    AuthorizeRequest,
    AttackPayload,
    AttackType,
    ResourceCategory,
    UrgencyLevel,
)

async def main():
    print("1. Testing get_requisitions...")
    reqs = get_requisitions()
    print("   Total requisitions:", len(reqs))

    print("2. Testing create_requisition...")
    dto = MedicalRequisitionCreate(
        requesting_facility_id="FAC-JLNMCH-01",
        category=ResourceCategory.BLOOD_COMPONENTS,
        resource_code="O_POS_RBC",
        quantity=5,
        urgency=UrgencyLevel.CRITICAL,
        clinical_note="ICU Emergency Transfusion Protocol",
    )
    req = await create_requisition(dto)
    print("   Created:", req.id, "Status:", req.status)

    print("3. Testing authorize_requisition...")
    auth_dto = AuthorizeRequest(
        supplying_facility_id="FAC-MAYAGANJ-01",
        authorized_by="Dr. R. K. Sinha (Chief Medical Officer)",
        batch_id="BATCH-TEST-001",
    )
    auth = await authorize_requisition(req.id, auth_dto)
    print("   Authorized:", auth.id, "Status:", auth.status)
    print("   Event Hash:", auth.event_hash)
    print("   Signature (first 24 chars):", auth.signature_hex[:24] if auth.signature_hex else "None")

    print("4. Testing simulate_attack (Quantity Tamper)...")
    atk_dto = AttackPayload(
        attack_type=AttackType.QUANTITY_TAMPER,
        requisition_id=req.id,
        tampered_quantity=999,
    )
    res = await simulate_attack(atk_dto)
    print("   Attack Result:", res.status)
    print("   Alert Title:", res.alert_title)

    print("5. Testing get_audit_ledger...")
    ledger = get_audit_ledger()
    print("   Total Blocks:", ledger["total_blocks"], "Chain Healthy:", ledger["is_chain_healthy"])

if __name__ == "__main__":
    asyncio.run(main())
