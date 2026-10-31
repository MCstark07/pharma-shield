import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.organization import Organization, Facility, User
from backend.app.models.inventory import InventoryItem
from backend.app.models.requests import MedicalRequest
from backend.app.models.shipments import Shipment, TelemetryRecord
from backend.app.models.ledger import AuditLedgerRecord
from backend.app.schemas.core import ResourceCategory, ShipmentStatus
from backend.app.services.crypto import generate_keypair, compute_hash, sign_event_hash, private_key_from_hex, GENESIS_HASH

def seed_database():
    print("=" * 65)
    print("Initializing Database Schema & Executing PharmaShield Seed Script")
    print("=" * 65)
    
    # Drop existing tables and recreate cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:

        print("[1/5] Seeding Organizations & Keypairs...")
        priv_jlnmch, pub_jlnmch = generate_keypair()
        priv_sadar, pub_sadar = generate_keypair()
        priv_mayaganj, pub_mayaganj = generate_keypair()
        priv_iiit, pub_iiit = generate_keypair()

        org_jlnmch = Organization(
            id="org_jlnmch",
            name="JLNMCH Hospital Authority",
            org_type="HOSPITAL_NETWORK",
            public_key_hex=pub_jlnmch
        )
        org_sadar = Organization(
            id="org_sadar",
            name="Sadar District Health Authority",
            org_type="HOSPITAL_NETWORK",
            public_key_hex=pub_sadar
        )
        org_mayaganj = Organization(
            id="org_mayaganj",
            name="Mayaganj Blood Depot & Research",
            org_type="BLOOD_COUNCIL",
            public_key_hex=pub_mayaganj
        )
        org_iiit = Organization(
            id="org_iiit",
            name="IIIT Bhagalpur Health Division",
            org_type="HEALTH_DEPT",
            public_key_hex=pub_iiit
        )
        db.add_all([org_jlnmch, org_sadar, org_mayaganj, org_iiit])
        db.flush()

        print("[2/5] Seeding 4 Bhagalpur Facilities (JLNMCH, Sadar, Mayaganj, IIIT)...")
        # 1. JLNMCH
        fac_jlnmch = Facility(
            id="fac_jlnmch",
            name="Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
            organization_id=org_jlnmch.id,
            type="HOSPITAL",
            lat=25.2445,
            lng=87.0125,
            contact="+91-641-2401078",
            is_verified=True,
            city="Bhagalpur",
            reliability_score=94.5
        )
        # 2. Sadar Hospital
        fac_sadar = Facility(
            id="fac_sadar",
            name="Sadar Hospital Bhagalpur",
            organization_id=org_sadar.id,
            type="HOSPITAL",
            lat=25.2490,
            lng=86.9840,
            contact="+91-641-2422222",
            is_verified=True,
            city="Bhagalpur",
            reliability_score=91.0
        )
        # 3. Mayaganj Blood Bank
        fac_mayaganj = Facility(
            id="fac_mayaganj",
            name="Mayaganj Blood Bank & Central Depot",
            organization_id=org_mayaganj.id,
            type="BLOOD_BANK",
            lat=25.2420,
            lng=87.0150,
            contact="+91-641-2400045",
            is_verified=True,
            city="Bhagalpur",
            reliability_score=98.0
        )
        # 4. IIIT Bhagalpur Health Center
        fac_iiit = Facility(
            id="fac_iiit",
            name="IIIT Bhagalpur Health Center",
            organization_id=org_iiit.id,
            type="HOSPITAL",
            lat=25.2605,
            lng=87.0425,
            contact="+91-641-2555555",
            is_verified=True,
            city="Bhagalpur",
            reliability_score=89.0
        )
        db.add_all([fac_jlnmch, fac_sadar, fac_mayaganj, fac_iiit])
        db.flush()

        print("[3/5] Seeding Users...")
        admin_user = User(
            id="usr_admin",
            email="admin@pharmashield.in",
            full_name="Bhagalpur Regional Crisis Commander",
            hashed_password=get_password_hash("admin123"),
            organization_id=org_jlnmch.id,
            facility_id=fac_jlnmch.id,
            role="ADMIN",
            is_active=True
        )
        dispatcher_user = User(
            id="usr_dispatcher",
            email="dispatcher@pharmashield.in",
            full_name="Central Logistics Dispatcher",
            hashed_password=get_password_hash("dispatch123"),
            organization_id=org_mayaganj.id,
            facility_id=fac_mayaganj.id,
            role="DISPATCHER",
            is_active=True
        )
        db.add_all([admin_user, dispatcher_user])
        db.flush()

        now = datetime.now(timezone.utc)
        exp_30d = now + timedelta(days=30)
        exp_90d = now + timedelta(days=90)
        exp_180d = now + timedelta(days=180)
        exp_365d = now + timedelta(days=365)

        print("[4/5] Seeding 15 Realistic Batches across 6 Categories...")
        # 15 distinct batches across the 6 categories with at least 1 low-stock scenario (O+ blood DOS < 2 days)
        batches = [
            # === CATEGORY 1: BLOOD_COMPONENTS (5 Batches) ===
            # Batch 1: CRITICAL LOW STOCK SCENARIO (4 units / 5 daily = 0.8 DOS < 2 days)
            InventoryItem(
                id="item_blood_jlnmch_opos",
                facility_id=fac_jlnmch.id,
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-JLNMCH-O1",
                units_available=4,  # CRITICAL SHORTAGE: DOS = 0.8 days
                daily_consumption=5.0,
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={"blood_group": "O+", "component": "RBC", "storage_temp_c": 4.0}
            ),
            # Batch 2: Surplus O+ RBC at Sadar Hospital
            InventoryItem(
                id="item_blood_sadar_opos",
                facility_id=fac_sadar.id,
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-SADAR-O2",
                units_available=28,
                daily_consumption=2.0,
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={"blood_group": "O+", "component": "RBC", "storage_temp_c": 4.0}
            ),
            # Batch 3: Central Depot O+ RBC at Mayaganj
            InventoryItem(
                id="item_blood_maya_opos",
                facility_id=fac_mayaganj.id,
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-MAYA-O3",
                units_available=50,
                daily_consumption=4.0,
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={"blood_group": "O+", "component": "RBC", "storage_temp_c": 4.0}
            ),
            # Batch 4: Central Depot A+ RBC at Mayaganj
            InventoryItem(
                id="item_blood_maya_apos",
                facility_id=fac_mayaganj.id,
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="A_POS_RBC",
                name="A+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-MAYA-A1",
                units_available=40,
                daily_consumption=3.0,
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={"blood_group": "A+", "component": "RBC", "storage_temp_c": 4.0}
            ),
            # Batch 5: Fresh Frozen Plasma (FFP) AB+
            InventoryItem(
                id="item_blood_maya_ab_plasma",
                facility_id=fac_mayaganj.id,
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="AB_POS_PLASMA",
                name="AB+ Fresh Frozen Plasma (FFP)",
                batch_number="BB-2026-MAYA-FFP9",
                units_available=15,
                daily_consumption=1.0,
                expiry_date=exp_90d,
                status="AVAILABLE",
                min_temp=-25.0,
                max_temp=-18.0,
                details={"blood_group": "AB+", "component": "Plasma", "storage_temp_c": -20.0}
            ),

            # === CATEGORY 2: VACCINES (3 Batches) ===
            # Batch 6: Covishield COVID-19 Vaccine (2.0 - 8.0°C)
            InventoryItem(
                id="item_vac_covishield",
                facility_id=fac_mayaganj.id,
                category=ResourceCategory.VACCINES.value,
                resource_code="COVISHIELD_VAX",
                name="Covishield COVID-19 Vaccine (ChAdOx1-S)",
                batch_number="COVI-AZ-2026-90",
                units_available=150,
                daily_consumption=12.0,
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={"batch_id": "COVI-AZ-2026-90", "min_temp_c": 2.0, "max_temp_c": 8.0, "storage_temp_c": 4.2}
            ),
            # Batch 7: Purified Chick Embryo Rabies Vaccine
            InventoryItem(
                id="item_vac_rabies",
                facility_id=fac_jlnmch.id,
                category=ResourceCategory.VACCINES.value,
                resource_code="RABIES_VACCINE",
                name="Purified Chick Embryo Rabies Vaccine",
                batch_number="VAC-RAB-2026-44",
                units_available=80,
                daily_consumption=6.0,
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={"batch_id": "VAC-RAB-2026-44", "min_temp_c": 2.0, "max_temp_c": 8.0, "storage_temp_c": 4.0}
            ),
            # Batch 8: Rotavirus Oral Live Vaccine
            InventoryItem(
                id="item_vac_rotavirus",
                facility_id=fac_sadar.id,
                category=ResourceCategory.VACCINES.value,
                resource_code="ROTAVIRUS_ORAL",
                name="Rotavirus Oral Vaccine (Live Attenuated)",
                batch_number="VAC-ROTA-2026-11",
                units_available=45,
                daily_consumption=4.0,
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={"batch_id": "VAC-ROTA-2026-11", "min_temp_c": 2.0, "max_temp_c": 8.0, "storage_temp_c": 4.5}
            ),

            # === CATEGORY 3: MEDICINES (3 Batches) ===
            # Batch 9: Remdesivir Lyophilized Powder 100mg
            InventoryItem(
                id="item_med_remdesivir",
                facility_id=fac_jlnmch.id,
                category=ResourceCategory.MEDICINES.value,
                resource_code="REMDESIVIR_100MG",
                name="Remdesivir Lyophilized Powder 100mg",
                batch_number="REMD-2026-081",
                units_available=30,
                daily_consumption=3.0,
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=15.0,
                max_temp=25.0,
                details={"batch_id": "REMD-2026-081", "recall_status": False, "storage_temp_c": 20.0}
            ),
            # Batch 10: Insulin Glargine 100 IU/ml
            InventoryItem(
                id="item_med_insulin",
                facility_id=fac_jlnmch.id,
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml Solostar",
                batch_number="INS-2026-GLAR-77",
                units_available=40,
                daily_consumption=4.0,
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={"batch_id": "INS-2026-GLAR-77", "recall_status": False, "storage_temp_c": 4.0}
            ),
            # Batch 11: Polyvalent Snake Antivenom Serum
            InventoryItem(
                id="item_med_antivenom",
                facility_id=fac_iiit.id,
                category=ResourceCategory.MEDICINES.value,
                resource_code="POLYVALENT_ANTIVENOM",
                name="Polyvalent Snake Antivenom Serum",
                batch_number="AV-2026-X99",
                units_available=8,
                daily_consumption=1.0,
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={"batch_id": "AV-2026-X99", "recall_status": False, "storage_temp_c": 5.0}
            ),

            # === CATEGORY 4: EMERGENCY_SUPPLIES (2 Batches) ===
            # Batch 12: Tactical ICU Trauma Resuscitation Kit
            InventoryItem(
                id="item_sup_trauma_iiit",
                facility_id=fac_iiit.id,
                category=ResourceCategory.EMERGENCY_SUPPLIES.value,
                resource_code="TRAUMA_KIT",
                name="Level-1 Tactical Emergency Trauma Kit",
                batch_number="ICU-TR-2026-X1",
                units_available=3,
                daily_consumption=1.5,  # DOS = 2.0 days (borderline)
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=10.0,
                max_temp=30.0,
                details={"item_type": "Trauma Kit", "critical_grade": True}
            ),
            # Batch 13: Emergency Airway Intubation Kit
            InventoryItem(
                id="item_sup_airway_sadar",
                facility_id=fac_sadar.id,
                category=ResourceCategory.EMERGENCY_SUPPLIES.value,
                resource_code="AIRWAY_INTUBATION_KIT",
                name="Rapid Sequence Emergency Intubation Kit",
                batch_number="AIR-2026-SAD-04",
                units_available=12,
                daily_consumption=1.0,
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=15.0,
                max_temp=25.0,
                details={"item_type": "Airway Kit", "critical_grade": True}
            ),

            # === CATEGORY 5: MEDICAL_EQUIPMENT (1 Batch) ===
            # Batch 14: Portable External Defibrillator
            InventoryItem(
                id="item_eq_defib_jlnmch",
                facility_id=fac_jlnmch.id,
                category=ResourceCategory.MEDICAL_EQUIPMENT.value,
                resource_code="DEFIB_AED_PORTABLE",
                name="Automated External Defibrillator (AED-Plus)",
                batch_number="AED-BHG-9902",
                units_available=5,
                daily_consumption=0.1,
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=0.0,
                max_temp=40.0,
                details={"serial_no": "AED-BHG-9902", "calibration_valid": True}
            ),

            # === CATEGORY 6: DIAGNOSTIC_SAMPLES (1 Batch) ===
            # Batch 15: CSF Pathology Biopsy Specimen
            InventoryItem(
                id="item_diag_csf_maya",
                facility_id=fac_mayaganj.id,
                category=ResourceCategory.DIAGNOSTIC_SAMPLES.value,
                resource_code="SAMPLE_CSF_PATH",
                name="Cerebrospinal Fluid Pathology Sample #B77",
                batch_number="CSF-2026-BHG-01",
                units_available=2,
                daily_consumption=0.5,
                expiry_date=now + timedelta(hours=8),
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={"sample_id": "CSF-2026-BHG-01", "specimen_type": "CSF Biopsy", "max_transit_hours": 3.0}
            )
        ]
        db.add_all(batches)
        db.flush()

        print("[5/5] Seeding Active Shipment, Route Telemetry & Cryptographic Hash Chain...")
        active_req = MedicalRequest(
            id="req_o_pos_critical",
            requesting_facility_id=fac_jlnmch.id,
            category=ResourceCategory.BLOOD_COMPONENTS.value,
            resource_code="O_POS_RBC",
            quantity=10,
            urgency="CRITICAL",
            required_by=now + timedelta(hours=2),
            clinical_note_redacted="Trauma resuscitation: massive blood loss protocol activated. Urgent compatible RBC units.",
            status="ALLOCATED"
        )
        db.add(active_req)
        db.flush()

        active_shipment = Shipment(
            id="ship_mayaganj_to_jlnmch",
            request_id=active_req.id,
            sender_id=fac_mayaganj.id,
            recipient_id=fac_jlnmch.id,
            driver_name="AMBULANCE_UNIT_BHG_04",
            status=ShipmentStatus.IN_TRANSIT.value,
            requires_cold_chain=True,
            min_temp=2.0,
            max_temp=8.0,
            current_temp=4.1,
            latest_lat=25.2432,
            latest_lng=87.0138,
            latest_telemetry_time=now
        )
        db.add(active_shipment)
        db.flush()

        telemetry_route = [
            (4.0, 25.2420, 87.0150, now - timedelta(minutes=15)),
            (4.2, 25.2425, 87.0145, now - timedelta(minutes=10)),
            (4.1, 25.2432, 87.0138, now - timedelta(minutes=5)),
        ]
        for temp_val, lat_val, lng_val, time_val in telemetry_route:
            db.add(TelemetryRecord(
                shipment_id=active_shipment.id,
                temperature_c=temp_val,
                latitude=lat_val,
                longitude=lng_val,
                timestamp_utc=time_val.isoformat(),
                is_excursion=False,
                battery_level=96.5
            ))

        # Genesis cryptographic record
        dispatch_payload = {
            "shipment_id": active_shipment.id,
            "origin_facility": fac_mayaganj.name,
            "destination_facility": fac_jlnmch.name,
            "driver_name": active_shipment.driver_name,
            "resource_code": active_req.resource_code,
            "allocated_quantity": active_req.quantity,
            "cold_chain_min_c": 2.0,
            "cold_chain_max_c": 8.0
        }
        dispatch_hash = compute_hash(GENESIS_HASH, dispatch_payload)
        priv_obj_mayaganj = private_key_from_hex(priv_mayaganj)
        sig_hex = sign_event_hash(priv_obj_mayaganj, dispatch_hash)

        ledger_rec = AuditLedgerRecord(
            shipment_id=active_shipment.id,
            event_type="DISPATCHED",
            actor_id=active_shipment.driver_name,
            organization_id=org_mayaganj.id,
            timestamp_utc=now.isoformat(),
            previous_hash=GENESIS_HASH,
            payload=dispatch_payload,
            event_hash=dispatch_hash,
            signature_hex=sig_hex,
            public_key_hex=pub_mayaganj,
            is_valid=True
        )
        db.add(ledger_rec)

        db.commit()
        print("\n[SUCCESS] Seeding Completed End-to-End!")
        print(f"  - Facilities: 4 Bhagalpur centers")
        print(f"  - Batches: 15 realistic batches across 6 categories")
        print(f"  - Low Stock Scenario: O+ RBC at JLNMCH (Units: 4, DOS: 0.8 days < 2 days)")
        print(f"  - Active In-Transit Shipment: {active_shipment.id}")
        print(f"  - Immutable Genesis Ledger: {dispatch_hash[:16]}...")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
