# PharmaShield — Comprehensive API Documentation & Contract Catalog

> **Version:** 2.1.0  
> **Base URL:** `http://localhost:8000`  
> **Interactive Documentation:** `http://localhost:8000/docs` (Flow Wave 3D WebGL Studio)  
> **WebSocket Stream:** `ws://localhost:8000/ws/events`  
> **Authentication:** Bearer JWT (HMAC-SHA256) + Ed25519 Organization Key Signatures

---

## 1. System & Authentication Endpoints

### 1.1 Health & Verification
- **Endpoint:** `GET /health`
- **Description:** Verifies service uptime, database connectivity, and active WebSocket peer counts.
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "version": "2.1.0",
  "database": "connected",
  "active_connections": 3
}
```

### 1.2 User Authentication & JWT Issuance
- **Endpoint:** `POST /api/v1/auth/token`
- **Content-Type:** `application/x-www-form-urlencoded`
- **Parameters:**
  - `username` (string): Clinical / Admin username (e.g. `dr_sharma`)
  - `password` (string): Password credentials
- **Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "bearer",
  "role": "DOCTOR",
  "organization_id": "org_jlnmch"
}
```

---

## 2. Facilities & Multi-State Logistics Topology

### 2.1 List Healthcare Facilities
- **Endpoint:** `GET /api/v1/facilities`
- **Query Parameters:**
  - `state` (optional, string): Filter by Indian State (e.g. `Bihar`, `West Bengal`, `Jharkhand`)
  - `city` (optional, string): Filter by city (e.g. `Bhagalpur`, `Siliguri`, `Kolkata`)
- **Response `200 OK`:**
```json
[
  {
    "id": "fac_jlnmch_main",
    "name": "Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
    "organization_id": "org_jlnmch",
    "facility_type": "HOSPITAL",
    "latitude": 25.2445,
    "longitude": 87.0125,
    "city": "Bhagalpur",
    "district": "Bhagalpur",
    "state": "Bihar",
    "is_active": true
  },
  {
    "id": "fac_siliguri_care",
    "name": "Care Pharmacy & Surgical Depot (Siliguri)",
    "organization_id": "org_care_siliguri",
    "facility_type": "PHARMACY",
    "latitude": 26.7271,
    "longitude": 88.3953,
    "city": "Siliguri",
    "district": "Darjeeling",
    "state": "West Bengal",
    "is_active": true
  }
]
```

---

## 3. Universal Medicine Availability Finder & Price Intelligence

### 3.1 Universal Medicine Availability Search
- **Endpoint:** `GET /api/v1/medicines/search`
- **Description:** Performs multi-ring inventory search (Local $\rightarrow$ District $\rightarrow$ Inter-State), computing transparent landed cost breakdowns (`Base + Shipping + Cold-chain + GST`) and estimated delivery hours.
- **Query Parameters:**
  - `query` (required, string): Medicine or resource name (e.g. `Remdesivir`, `Albumin`, `Insulin`)
  - `requesting_facility_id` (required, string): Requisitioning facility ID for distance calculation
  - `max_distance_km` (optional, float, default `500.0`): Maximum search radius
- **Sample Request:**
```http
GET /api/v1/medicines/search?query=Remdesivir&requesting_facility_id=fac_siliguri_care HTTP/1.1
Host: localhost:8000
```
- **Response `200 OK`:**
```json
{
  "search_query": "Remdesivir",
  "requesting_facility_id": "fac_siliguri_care",
  "total_found": 2,
  "local_available": false,
  "message": "Out of stock locally in Siliguri. Sourced via Inter-State corridor from Kolkata Central MediHub.",
  "offers": [
    {
      "facility_id": "fac_kolkata_central",
      "facility_name": "Central MediHub Kolkata",
      "city": "Kolkata",
      "state": "West Bengal",
      "distance_km": 490.2,
      "scope": "INTER_STATE",
      "available_units": 45,
      "landed_cost": {
        "base_price": 2800.0,
        "shipping_cost": 490.2,
        "cold_chain_surcharge": 150.0,
        "gst_amount": 344.02,
        "total_landed_cost": 3784.22
      },
      "estimated_delivery_hours": 12.0,
      "stock_confidence": 0.95
    }
  ]
}
```

### 3.2 Inter-State Medicine Price Intelligence Report
- **Endpoint:** `GET /api/v1/prices/intelligence`
- **Description:** Aggregates medicine pricing across Bihar, West Bengal, and Jharkhand, identifying price disparities and flagging predatory price gouging (>35% spread).
- **Response `200 OK`:**
```json
[
  {
    "resource_code": "REMDESIVIR_100MG",
    "resource_name": "Remdesivir 100mg Vial",
    "state_prices": {
      "Bihar": 2900.0,
      "West Bengal": 2800.0
    },
    "national_average": 2850.0,
    "min_price": 2800.0,
    "max_price": 2900.0,
    "price_spread_pct": 3.57,
    "anomaly_detected": false
  }
]
```

### 3.3 Full Inventory Catalog by Category
- **Endpoint:** `GET /api/v1/inventory/`
- **Query Parameters:**
  - `category` (optional, string): Filter by one of the 6 categories: `MEDICINES`, `BLOOD_COMPONENTS`, `MEDICAL_EQUIPMENT`, `VACCINES`, `DIAGNOSTIC_SAMPLES`, `EMERGENCY_SUPPLIES`
  - `facility_id` (optional, string): Filter by facility
- **Response `200 OK`:** Array of inventory objects with nested batch records.

---

## 4. Emergency Requisitions & AI Matching Engine

### 4.1 Create Life-Critical Emergency Requisition
- **Endpoint:** `POST /api/v1/requests/`
- **Request Body:**
```json
{
  "requesting_facility_id": "fac_jlnmch_main",
  "category": "BLOOD_COMPONENTS",
  "resource_code": "O_POS_RBC",
  "quantity": 5,
  "urgency": "CRITICAL",
  "required_by": "2026-11-01T12:00:00Z",
  "clinical_note_redacted": "Massive trauma casualty arriving in ER. Immediate transfusion required."
}
```
- **Response `201 Created`:**
```json
{
  "id": "REQ-2026-1101-01",
  "status": "PENDING",
  "requesting_facility_id": "fac_jlnmch_main",
  "resource_code": "O_POS_RBC",
  "quantity": 5,
  "urgency": "CRITICAL",
  "matches": [
    {
      "facility_id": "fac_sadar_bgp",
      "facility_name": "Sadar Hospital Bhagalpur",
      "distance_km": 3.85,
      "available_units": 28,
      "score": 94.2,
      "rank": 1,
      "score_breakdown": {
        "urgency": 30.0,
        "availability": 25.0,
        "transport": 18.5,
        "safety": 15.0,
        "reliability": 9.2
      },
      "is_eligible": true
    }
  ]
}
```

### 4.2 Doctor / Clinician Order Authorization (Row-Level Locking)
- **Endpoint:** `POST /api/v1/requests/{request_id}/authorize`
- **Description:** Clinician signs off on an allocation. Executes `SELECT ... FOR UPDATE` row-level lock on inventory to prevent concurrent stock depletion, creates shipment conduit, and records Ed25519 signed event.
- **Request Body:**
```json
{
  "source_facility_id": "fac_sadar_bgp",
  "authorizing_doctor": "Dr. S. K. Verma",
  "medical_council_reg": "MCI-48192-BH"
}
```
- **Response `200 OK`:**
```json
{
  "status": "AUTHORIZED",
  "shipment_id": "SHP-2026-8812",
  "allocated_units": 5,
  "source_facility": "Sadar Hospital Bhagalpur",
  "event_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "locked_row_confirmed": true
}
```

### 4.3 AI Predictive Stock Rebalancing
- **Endpoint:** `GET /api/v1/ai/rebalance`
- **Description:** Analyzes real-time consumption velocity and Days of Stock ($DOS$). Automatically pairs shortage facilities ($DOS \le 2.5d$) with nearest surplus facilities ($DOS \ge 5.0d$).
- **Response `200 OK`:**
```json
[
  {
    "shortage_facility_id": "fac_jlnmch_main",
    "shortage_facility_name": "Jawaharlal Nehru Medical College & Hospital (JLNMCH)",
    "surplus_facility_id": "fac_sadar_bgp",
    "surplus_facility_name": "Sadar Hospital Bhagalpur",
    "resource_code": "O_POS_RBC",
    "recommended_transfer_units": 10,
    "distance_km": 3.85,
    "estimated_transit_hours": 0.45,
    "current_dos_shortage": 0.8,
    "projected_dos_after": 2.8,
    "urgency": "CRITICAL"
  }
]
```

---

## 5. Cold-Chain Monitoring & Clinical Disposition

### 5.1 Ingest Sensor Telemetry
- **Endpoint:** `POST /api/v1/shipments/telemetry`
- **Description:** High-frequency IoT sensor ingest. If temperature violates 2.0°C–8.0°C range, status flips to `UNDER_REVIEW` and broadcasts immediate alert over WebSocket.
- **Request Body:**
```json
{
  "shipment_id": "SHP-2026-8812",
  "temperature_c": 11.4,
  "latitude": 25.2471,
  "longitude": 86.9952,
  "battery_pct": 94.0
}
```
- **Response `200 OK`:**
```json
{
  "status": "UNDER_REVIEW",
  "excursion_detected": true,
  "reading_c": 11.4,
  "action_required": "CLINICAL_DISPOSITION_MANDATORY"
}
```

### 5.2 Human-in-the-Loop Clinical Disposition Sign-Off
- **Endpoint:** `POST /api/v1/coldchain/disposition`
- **Description:** Clinical pharmacologist / medical officer disposition for quarantined shipments. Cannot be auto-cleared by software.
- **Request Body:**
```json
{
  "shipment_id": "SHP-2026-8812",
  "decision": "CLEARED_WITH_OVERRIDE",
  "clinical_rationale": "Thermal excursion lasted under 12 minutes. Mean kinetic temperature remains within stability monograph for insulin glargine.",
  "pharmacist_license": "PB-88219-IN",
  "actor_name": "Dr. Ananya Ray, Chief Clinical Pharmacist"
}
```
- **Response `200 OK`:**
```json
{
  "shipment_id": "SHP-2026-8812",
  "new_status": "IN_TRANSIT",
  "disposition_logged": true,
  "audit_event_id": "evt_disp_8812",
  "ledger_hash": "a4f89b213c4..."
}
```

---

## 6. Cryptographic Audit Ledger & Security Lab

### 6.1 Inspect Canonical Hash Chain
- **Endpoint:** `GET /api/v1/security/ledger`
- **Description:** Returns the chronologically linked Ed25519-signed events from genesis block to current.
- **Response `200 OK`:**
```json
[
  {
    "event": {
      "shipment_id": "SHP-GENESIS-000",
      "event_type": "GENESIS",
      "actor_id": "SYSTEM_GENESIS",
      "organization_id": "org_jlnmch",
      "timestamp_utc": "2026-11-01T00:00:00Z",
      "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
      "payload": { "network": "PharmaShield Securathon Ledger", "chain_id": "bihar_health_net_01" }
    },
    "event_hash": "01af89...",
    "signature_hex": "4a7b29...",
    "public_key_hex": "2d3e91...",
    "is_valid": true
  }
]
```

### 6.2 Verify Cryptographic Signature
- **Endpoint:** `POST /api/v1/security/verify`
- **Request Body:**
```json
{
  "public_key_hex": "2d3e91...",
  "event_hash": "01af89...",
  "signature_hex": "4a7b29..."
}
```
- **Response `200 OK`:**
```json
{
  "is_valid": true,
  "verified_at": "2026-11-01T06:51:00Z"
}
```

### 6.3 Security Lab: Live Tamper Demonstration
- **Endpoint:** `POST /api/v1/security/tamper-demo`
- **Description:** Simulates an adversarial MITM attack modifying an event payload (e.g. changing allocated units from 5 to 500) and proves cryptographic rejection via Ed25519 signature failure.
- **Response `200 OK`:**
```json
{
  "attack_vector": "MAN_IN_THE_MIDDLE_PAYLOAD_TAMPERING",
  "original_units": 5,
  "tampered_units": 500,
  "original_signature_valid": true,
  "tampered_signature_valid": false,
  "signature_status": "SIGNATURE_VERIFICATION_FAILED_REJECTED",
  "deflection_action": "Consignment locked. Cryptographic alarm dispatched to Security Center."
}
```

---

## 7. Real-Time WebSocket Event Bus (`/ws/events`)

The WebSocket bus broadcasts system-wide state changes across all connected portals:

| Event Type | Trigger | Sample Payload |
|---|---|---|
| `REQUISITION_CREATED` | New emergency requisition | `{"event": "REQUISITION_CREATED", "id": "REQ-01", "urgency": "CRITICAL"}` |
| `ORDER_AUTHORIZED` | Clinician sign-off & stock lock | `{"event": "ORDER_AUTHORIZED", "shipment_id": "SHP-01", "units": 5}` |
| `SENSOR_EXCURSION` | Temperature out of 2–8°C | `{"event": "SENSOR_EXCURSION", "shipment_id": "SHP-01", "temp": 11.4}` |
| `LEDGER_BLOCK_ADDED` | New Ed25519 signed block | `{"event": "LEDGER_BLOCK_ADDED", "event_hash": "a4f8..."}` |
| `ATTACK_DETECTED` | Tamper simulation triggered | `{"event": "ATTACK_DETECTED", "source_ip": "198.51.100.24"}` |

