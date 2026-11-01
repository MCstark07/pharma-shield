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
    print("=" * 70)
    print("Initializing Database Schema & Executing PharmaShield Multi-State Seed")
    print("=" * 70)
    
    # Drop existing tables and recreate cleanly
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("[1/5] Seeding Organizations & Keypairs across Bihar, Bengal & Jharkhand...")
        priv_jlnmch, pub_jlnmch = generate_keypair()
        priv_sadar, pub_sadar = generate_keypair()
        priv_mayaganj, pub_mayaganj = generate_keypair()
        priv_iiit, pub_iiit = generate_keypair()
        priv_bengal, pub_bengal = generate_keypair()
        priv_jharkhand, pub_jharkhand = generate_keypair()

        orgs = [
            Organization(
                id="org_jlnmch",
                name="JLNMCH Hospital Authority",
                org_type="HOSPITAL_NETWORK",
                public_key_hex=pub_jlnmch
            ),
            Organization(
                id="org_sadar",
                name="Sadar District Health Authority",
                org_type="HOSPITAL_NETWORK",
                public_key_hex=pub_sadar
            ),
            Organization(
                id="org_mayaganj",
                name="Mayaganj Blood Depot & Research Council",
                org_type="BLOOD_COUNCIL",
                public_key_hex=pub_mayaganj
            ),
            Organization(
                id="org_iiit",
                name="IIIT Bhagalpur Health Division",
                org_type="HEALTH_DEPT",
                public_key_hex=pub_iiit
            ),
            Organization(
                id="org_bengal_health",
                name="West Bengal State Medical Supply Corporation",
                org_type="LOGISTICS",
                public_key_hex=pub_bengal
            ),
            Organization(
                id="org_jharkhand_health",
                name="Jharkhand State Medical Services Corporation",
                org_type="LOGISTICS",
                public_key_hex=pub_jharkhand
            ),
        ]
        db.add_all(orgs)
        db.flush()

        print("[2/5] Seeding Regional & Inter-State Healthcare Facilities...")
        facilities = [
            # Bhagalpur, Bihar
            Facility(
                id="fac_jlnmch",
                name="Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
                organization_id="org_jlnmch",
                type="HOSPITAL",
                lat=25.2445,
                lng=87.0125,
                contact="+91-641-2401078",
                is_verified=True,
                city="Bhagalpur",
                district="Bhagalpur",
                state="Bihar",
                reliability_score=94.5
            ),
            Facility(
                id="fac_sadar",
                name="Sadar Hospital Bhagalpur",
                organization_id="org_sadar",
                type="HOSPITAL",
                lat=25.2490,
                lng=86.9840,
                contact="+91-641-2422222",
                is_verified=True,
                city="Bhagalpur",
                district="Bhagalpur",
                state="Bihar",
                reliability_score=91.0
            ),
            Facility(
                id="fac_mayaganj",
                name="Mayaganj Blood Bank & Central Depot",
                organization_id="org_mayaganj",
                type="BLOOD_BANK",
                lat=25.2420,
                lng=87.0150,
                contact="+91-641-2400045",
                is_verified=True,
                city="Bhagalpur",
                district="Bhagalpur",
                state="Bihar",
                reliability_score=98.0
            ),
            Facility(
                id="fac_iiit",
                name="IIIT Bhagalpur Health Clinic",
                organization_id="org_iiit",
                type="CLINIC",
                lat=25.2605,
                lng=87.0425,
                contact="+91-641-2555555",
                is_verified=True,
                city="Bhagalpur",
                district="Bhagalpur",
                state="Bihar",
                reliability_score=89.0
            ),
            # Siliguri, West Bengal (Problem 3: Universal Medicine Availability Scenario)
            Facility(
                id="fac_siliguri_pharmacy",
                name="Siliguri Care Pharmacy (Local)",
                organization_id="org_bengal_health",
                type="PHARMACY",
                lat=26.7271,
                lng=88.3953,
                contact="+91-353-2520111",
                is_verified=True,
                city="Siliguri",
                district="Darjeeling",
                state="West Bengal",
                reliability_score=88.0
            ),
            Facility(
                id="fac_siliguri_depot",
                name="North Bengal Medical Depot (District)",
                organization_id="org_bengal_health",
                type="WAREHOUSE",
                lat=26.7100,
                lng=88.4200,
                contact="+91-353-2580444",
                is_verified=True,
                city="Siliguri",
                district="Darjeeling",
                state="West Bengal",
                reliability_score=93.0
            ),
            # Kolkata, West Bengal
            Facility(
                id="fac_kolkata_hub",
                name="Kolkata Central MediHub (Inter-State)",
                organization_id="org_bengal_health",
                type="WAREHOUSE",
                lat=22.5726,
                lng=88.3639,
                contact="+91-33-22879000",
                is_verified=True,
                city="Kolkata",
                district="Kolkata",
                state="West Bengal",
                reliability_score=97.5
            ),
            # Patna, Bihar
            Facility(
                id="fac_patna_aiims",
                name="AIIMS Patna Regional Medical Store",
                organization_id="org_jlnmch",
                type="HOSPITAL",
                lat=25.5600,
                lng=85.0450,
                contact="+91-612-2451000",
                is_verified=True,
                city="Patna",
                district="Patna",
                state="Bihar",
                reliability_score=96.0
            ),
            # Ranchi, Jharkhand
            Facility(
                id="fac_ranchi_rims",
                name="RIMS Ranchi Medico Logistics Hub",
                organization_id="org_jharkhand_health",
                type="WAREHOUSE",
                lat=23.3441,
                lng=85.3096,
                contact="+91-651-2490000",
                is_verified=True,
                city="Ranchi",
                district="Ranchi",
                state="Jharkhand",
                reliability_score=92.5
            ),
        ]
        db.add_all(facilities)
        db.flush()

        print("[3/5] Seeding Users with Role-Based Access...")
        users = [
            User(
                id="usr_admin",
                email="admin@pharmashield.in",
                full_name="Bhagalpur Regional Crisis Commander",
                hashed_password=get_password_hash("admin123"),
                organization_id="org_jlnmch",
                facility_id="fac_jlnmch",
                role="ADMIN",
                is_active=True
            ),
            User(
                id="usr_doctor",
                email="doctor@pharmashield.in",
                full_name="Dr. Ananya Sharma",
                hashed_password=get_password_hash("doctor123"),
                organization_id="org_jlnmch",
                facility_id="fac_jlnmch",
                role="CLINICIAN",
                is_active=True
            ),
            User(
                id="usr_dispatcher",
                email="dispatcher@pharmashield.in",
                full_name="Central Logistics Dispatcher",
                hashed_password=get_password_hash("dispatch123"),
                organization_id="org_mayaganj",
                facility_id="fac_mayaganj",
                role="DISPATCHER",
                is_active=True
            ),
            User(
                id="usr_patient",
                email="patient@pharmashield.in",
                full_name="Rohit Kumar",
                hashed_password=get_password_hash("patient123"),
                organization_id="org_jlnmch",
                facility_id="fac_jlnmch",
                role="PATIENT",
                is_active=True
            ),
        ]
        db.add_all(users)
        db.flush()

        now = datetime.now(timezone.utc)
        exp_30d = now + timedelta(days=30)
        exp_90d = now + timedelta(days=90)
        exp_180d = now + timedelta(days=180)
        exp_365d = now + timedelta(days=365)

        print("[4/5] Seeding Multi-State Batches across 6 Categories with Landed Costs...")
        batches = [
            # === CATEGORY 1: BLOOD_COMPONENTS ===
            # Critical low-stock scenario at JLNMCH: 4 units / 5 daily = 0.8 DOS (< 2 days threshold)
            InventoryItem(
                id="item_blood_jlnmch_opos",
                facility_id="fac_jlnmch",
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-JLNMCH-O1",
                units_available=4,  # CRITICAL SHORTAGE: DOS = 0.8 days
                daily_consumption=5.0,
                price_inr=1450.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "blood_group": "O+",
                    "component": "RBC",
                    "storage_temp_c": 4.0,
                    "pack_size": "1 Unit (450ml)",
                    "shipping_rate_per_km": 2.5,
                    "cold_chain_surcharge": 200.0,
                    "clinical_notes": "Statutory non-profit processing charge"
                }
            ),
            # Surplus O+ at Sadar Hospital
            InventoryItem(
                id="item_blood_sadar_opos",
                facility_id="fac_sadar",
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-SADAR-O2",
                units_available=28,
                daily_consumption=2.0,
                price_inr=1450.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "blood_group": "O+",
                    "component": "RBC",
                    "storage_temp_c": 4.0,
                    "pack_size": "1 Unit (450ml)",
                    "shipping_rate_per_km": 2.5,
                    "cold_chain_surcharge": 200.0
                }
            ),
            # Central Depot at Mayaganj
            InventoryItem(
                id="item_blood_maya_opos",
                facility_id="fac_mayaganj",
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_POS_RBC",
                name="O+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-MAYA-O3",
                units_available=50,
                daily_consumption=4.0,
                price_inr=1450.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "blood_group": "O+",
                    "component": "RBC",
                    "storage_temp_c": 4.0,
                    "pack_size": "1 Unit (450ml)",
                    "shipping_rate_per_km": 2.5,
                    "cold_chain_surcharge": 200.0
                }
            ),
            InventoryItem(
                id="item_blood_maya_apos",
                facility_id="fac_mayaganj",
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="A_POS_RBC",
                name="A+ Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-MAYA-A1",
                units_available=40,
                daily_consumption=3.0,
                price_inr=1450.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "blood_group": "A+",
                    "component": "RBC",
                    "storage_temp_c": 4.0,
                    "pack_size": "1 Unit (450ml)",
                    "shipping_rate_per_km": 2.5,
                    "cold_chain_surcharge": 200.0
                }
            ),
            InventoryItem(
                id="item_blood_maya_oneg",
                facility_id="fac_mayaganj",
                category=ResourceCategory.BLOOD_COMPONENTS.value,
                resource_code="O_NEG_RBC",
                name="O- Universal Packed Red Blood Cells (RBC)",
                batch_number="BB-2026-MAYA-ONEG",
                units_available=12,
                daily_consumption=1.5,
                price_inr=1600.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_30d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "blood_group": "O-",
                    "component": "RBC",
                    "storage_temp_c": 4.0,
                    "pack_size": "1 Unit (450ml)",
                    "shipping_rate_per_km": 2.5,
                    "cold_chain_surcharge": 200.0
                }
            ),

            # === CATEGORY 2: MEDICINES — PROBLEM 3 & 4 DEMONSTRATION ===
            # Case study: User searches INSULIN_GLARGINE from Siliguri
            # 1. Siliguri Care Pharmacy (Local A): OUT OF STOCK (0 units)
            InventoryItem(
                id="item_med_siliguri_insulin",
                facility_id="fac_siliguri_pharmacy",
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml (Lantus)",
                batch_number="MED-2026-SIL-01",
                units_available=0,  # OUT OF STOCK LOCALLY
                daily_consumption=4.0,
                price_inr=650.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_180d,
                status="DEPLETED",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Lantus",
                    "generic": "Insulin Glargine",
                    "strength": "100 IU/ml",
                    "pack_size": "1 Cartridge (3ml)",
                    "shipping_rate_per_km": 1.5,
                    "cold_chain_surcharge": 120.0,
                    "manufacturer": "Sanofi India"
                }
            ),
            # 2. North Bengal Medical Depot (District C): Available nearby
            InventoryItem(
                id="item_med_siliguri_depot_insulin",
                facility_id="fac_siliguri_depot",
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml (Lantus)",
                batch_number="MED-2026-SIL-DEPOT",
                units_available=14,
                daily_consumption=2.0,
                price_inr=620.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Lantus",
                    "generic": "Insulin Glargine",
                    "strength": "100 IU/ml",
                    "pack_size": "1 Cartridge (3ml)",
                    "shipping_rate_per_km": 1.2,
                    "cold_chain_surcharge": 100.0,
                    "manufacturer": "Sanofi India"
                }
            ),
            # 3. Mayaganj Depot (Bhagalpur, Bihar): Available
            InventoryItem(
                id="item_med_maya_insulin",
                facility_id="fac_mayaganj",
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml (Lantus)",
                batch_number="MED-2026-MAYA-INS",
                units_available=45,
                daily_consumption=3.0,
                price_inr=480.0,  # Lower price in Bihar depot
                stock_confidence="CONFIRMED",
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Lantus",
                    "generic": "Insulin Glargine",
                    "strength": "100 IU/ml",
                    "pack_size": "1 Cartridge (3ml)",
                    "shipping_rate_per_km": 1.0,
                    "cold_chain_surcharge": 120.0,
                    "manufacturer": "Sanofi India"
                }
            ),
            # 4. Kolkata Central MediHub (West Bengal Inter-State): High stock, wholesale price
            InventoryItem(
                id="item_med_kolkata_insulin",
                facility_id="fac_kolkata_hub",
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml (Lantus)",
                batch_number="MED-2026-KOL-INS",
                units_available=150,
                daily_consumption=10.0,
                price_inr=440.0,  # Wholesale state rate
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Lantus",
                    "generic": "Insulin Glargine",
                    "strength": "100 IU/ml",
                    "pack_size": "1 Cartridge (3ml)",
                    "shipping_rate_per_km": 1.1,
                    "cold_chain_surcharge": 120.0,
                    "manufacturer": "Sanofi India"
                }
            ),
            # 5. Patna AIIMS (Bihar Regional): High stock
            InventoryItem(
                id="item_med_patna_insulin",
                facility_id="fac_patna_aiims",
                category=ResourceCategory.MEDICINES.value,
                resource_code="INSULIN_GLARGINE",
                name="Insulin Glargine 100 IU/ml (Lantus)",
                batch_number="MED-2026-PAT-INS",
                units_available=60,
                daily_consumption=5.0,
                price_inr=420.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Lantus",
                    "generic": "Insulin Glargine",
                    "strength": "100 IU/ml",
                    "pack_size": "1 Cartridge (3ml)",
                    "shipping_rate_per_km": 1.0,
                    "cold_chain_surcharge": 110.0,
                    "manufacturer": "Sanofi India"
                }
            ),
            # Additional Essential Medicine: Remdesivir 100mg
            InventoryItem(
                id="item_med_maya_remdesivir",
                facility_id="fac_mayaganj",
                category=ResourceCategory.MEDICINES.value,
                resource_code="REMDESIVIR_100MG",
                name="Remdesivir Lyophilized Powder 100mg",
                batch_number="MED-2026-REM-01",
                units_available=25,
                daily_consumption=2.0,
                price_inr=2400.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=15.0,
                max_temp=25.0,
                details={
                    "brand": "Covifor",
                    "generic": "Remdesivir",
                    "strength": "100mg/vial",
                    "pack_size": "1 Vial",
                    "shipping_rate_per_km": 0.8,
                    "cold_chain_surcharge": 0.0,
                    "manufacturer": "Hetero Healthcare"
                }
            ),
            # Additional Critical Medicine: Human Albumin 20%
            InventoryItem(
                id="item_med_jlnmch_albumin",
                facility_id="fac_jlnmch",
                category=ResourceCategory.MEDICINES.value,
                resource_code="ALBUMIN_20_PERCENT",
                name="Human Albumin Infusion 20% (100ml)",
                batch_number="MED-2026-ALB-01",
                units_available=8,
                daily_consumption=3.0,
                price_inr=3950.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=25.0,
                details={
                    "brand": "Alburel",
                    "generic": "Human Albumin",
                    "strength": "20%",
                    "pack_size": "100ml Glass Bottle",
                    "shipping_rate_per_km": 1.2,
                    "cold_chain_surcharge": 80.0,
                    "manufacturer": "Reliance Life Sciences"
                }
            ),

            # === CATEGORY 3: VACCINES (Strict 2-8°C Cold Chain) ===
            InventoryItem(
                id="item_vac_maya_covaxin",
                facility_id="fac_mayaganj",
                category=ResourceCategory.VACCINES.value,
                resource_code="COVAXIN_VACCINE",
                name="Covaxin Whole Virion Inactivated Vaccine",
                batch_number="VAC-2026-COV-01",
                units_available=80,
                daily_consumption=5.0,
                price_inr=380.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_180d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Covaxin",
                    "storage_temp_c": 4.0,
                    "pack_size": "10 Doses/Vial",
                    "shipping_rate_per_km": 2.0,
                    "cold_chain_surcharge": 150.0,
                    "manufacturer": "Bharat Biotech"
                }
            ),
            InventoryItem(
                id="item_vac_sadar_rabies",
                facility_id="fac_sadar",
                category=ResourceCategory.VACCINES.value,
                resource_code="RABIES_VACCINE",
                name="Purified Chick Embryo Rabies Vaccine (Rabipur)",
                batch_number="VAC-2026-RAB-02",
                units_available=35,
                daily_consumption=2.0,
                price_inr=390.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=8.0,
                details={
                    "brand": "Rabipur",
                    "storage_temp_c": 4.5,
                    "pack_size": "1 Dose + Diluent",
                    "shipping_rate_per_km": 1.8,
                    "cold_chain_surcharge": 150.0,
                    "manufacturer": "Chiron Behring"
                }
            ),

            # === CATEGORY 4: EMERGENCY_SUPPLIES ===
            InventoryItem(
                id="item_emg_iiit_antivenom",
                facility_id="fac_iiit",
                category=ResourceCategory.EMERGENCY_SUPPLIES.value,
                resource_code="ANTI_VENOM_POLYVALENT",
                name="Snake Venom Antiserum (Polyvalent Lyophilized)",
                batch_number="EMG-2026-AVP-01",
                units_available=2,  # Low stock
                daily_consumption=1.0,
                price_inr=750.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=25.0,
                details={
                    "urgency": "CRITICAL",
                    "pack_size": "1 Vial (10ml)",
                    "shipping_rate_per_km": 1.0,
                    "cold_chain_surcharge": 50.0,
                    "manufacturer": "Serum Institute of India"
                }
            ),
            InventoryItem(
                id="item_emg_maya_trauma_kit",
                facility_id="fac_mayaganj",
                category=ResourceCategory.EMERGENCY_SUPPLIES.value,
                resource_code="TRAUMA_KIT_LEVEL1",
                name="Comprehensive Tactical Medical Trauma Kit",
                batch_number="EMG-2026-TRM-03",
                units_available=15,
                daily_consumption=1.0,
                price_inr=4200.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=10.0,
                max_temp=35.0,
                details={
                    "pack_size": "Complete Field Bag",
                    "shipping_rate_per_km": 1.5,
                    "cold_chain_surcharge": 0.0
                }
            ),

            # === CATEGORY 5: MEDICAL_EQUIPMENT ===
            InventoryItem(
                id="item_eq_jlnmch_ventilator",
                facility_id="fac_jlnmch",
                category=ResourceCategory.MEDICAL_EQUIPMENT.value,
                resource_code="PORTABLE_VENTILATOR_ICU",
                name="ResMed Stellar 150 Portable Transport Ventilator",
                batch_number="EQ-2026-VENT-01",
                units_available=3,
                daily_consumption=0.2,
                price_inr=85000.0,
                stock_confidence="CONFIRMED",
                expiry_date=exp_365d,
                status="AVAILABLE",
                min_temp=15.0,
                max_temp=30.0,
                details={
                    "calibration_valid": True,
                    "calibration_date": "2026-01-15",
                    "serial_number": "SN-VENT-9942",
                    "shipping_rate_per_km": 5.0,
                    "cold_chain_surcharge": 0.0
                }
            ),

            # === CATEGORY 6: DIAGNOSTIC_SAMPLES ===
            InventoryItem(
                id="item_diag_jlnmch_sample",
                facility_id="fac_jlnmch",
                category=ResourceCategory.DIAGNOSTIC_SAMPLES.value,
                resource_code="CSF_BIOPSY_SPECIMEN",
                name="Cerebrospinal Fluid (CSF) Urgent Biopsy Specimen",
                batch_number="DIAG-2026-CSF-01",
                units_available=1,
                daily_consumption=1.0,
                price_inr=0.0,
                stock_confidence="CONFIRMED",
                expiry_date=now + timedelta(hours=6),  # Urgent transit viability
                status="AVAILABLE",
                min_temp=2.0,
                max_temp=6.0,
                details={
                    "sample_id": "CSF-2026-BHG-01",
                    "specimen_type": "CSF Biopsy",
                    "max_transit_hours": 3.0,
                    "shipping_rate_per_km": 4.0,
                    "cold_chain_surcharge": 150.0
                }
            )
        ]
        db.add_all(batches)
        db.flush()

        print("[5/5] Seeding Active Shipment, Route Telemetry & Cryptographic Hash Chain...")
        active_req = MedicalRequest(
            id="req_o_pos_critical",
            requesting_facility_id="fac_jlnmch",
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
            sender_id="fac_mayaganj",
            recipient_id="fac_jlnmch",
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
            "origin_facility": "Mayaganj Blood Bank & Central Depot",
            "destination_facility": "Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
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
            organization_id="org_mayaganj",
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
        print("\n" + "=" * 70)
        print("[SUCCESS] PharmaShield Multi-State Database Seeding Complete!")
        print(f"  - Organizations: {len(orgs)} across Bihar, Bengal & Jharkhand")
        print(f"  - Facilities: {len(facilities)} regional & inter-state nodes")
        print(f"  - Inventory Batches: {len(batches)} covering 6 categories with Landed Cost models")
        print(f"  - Problem 1 Scenario: O+ RBC Critical Shortage at JLNMCH (Units: 4, DOS: 0.8d)")
        print(f"  - Problem 3 Scenario: Insulin Glargine Siliguri -> District -> State Landed Comparison")
        print(f"  - Active In-Transit Shipment: {active_shipment.id}")
        print(f"  - Ed25519 Genesis Hash: {dispatch_hash[:20]}...")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
