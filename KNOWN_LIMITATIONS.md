# PharmaShield — Architectural Classification & Known Limitations

> **Disclosure Standard:** Securathon 2026 Transparent Engineering Protocol  
> **Document Purpose:** Clear, honest categorization of all capabilities within the PharmaShield medical logistics and cybersecurity platform.

---

## Category 1: Fully Implemented & Production-Ready Features

The following modules are completely implemented with zero mock bypasses or external hardware dependencies, fully tested, and ready for deployment:

1. **Cryptographic Tamper-Evidence Engine:**
   - Native Python `cryptography` implementation of Ed25519 asymmetric digital signatures (RFC 8032).
   - Canonical JSON serialization (RFC 8785 strict key sorting, compact non-whitespace separators).
   - SHA-256 block hash chaining ($H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalPayload}_i)$).
   - Real-time cryptographic rejection of Man-In-The-Middle (MITM) payload tampering.

2. **Life-Critical Healthcare Rules & Safety Constraints:**
   - 100% adherence to ABO and Rh blood group donor-recipient compatibility matrices.
   - Strict batch quarantine: exclusion of expired lots (`expiry <= now()`) and recalled batches (`recall_status == True`).
   - Medical equipment calibration validation and diagnostic sample transit viability bounds.
   - Universal inventory classification across all 6 categories: `MEDICINES`, `BLOOD_COMPONENTS`, `MEDICAL_EQUIPMENT`, `VACCINES`, `DIAGNOSTIC_SAMPLES`, `EMERGENCY_SUPPLIES`.

3. **Concurrency & Inventory Row-Level Locking:**
   - Database row-level locks via SQLAlchemy 2.0 `with_for_update()` during order authorization.
   - Elimination of allocation race conditions during concurrent emergency hospital requisitions.

4. **Universal Medicine Availability & Landed Cost Engine:**
   - Multi-tier search hierarchy: Local $\rightarrow$ District $\rightarrow$ Inter-State.
   - Landed cost formula: $\text{Total} = \text{Base Price} + \text{Shipping} + \text{Cold-Chain Surcharge} + \text{GST}$.
   - Inter-state price intelligence and predatory pricing anomaly detection (>35% spread) across Bihar, West Bengal, and Jharkhand.

5. **AI Predictive Shortage Rebalancing:**
   - Days of Stock formulation: $DOS = \frac{\text{Current Inventory Units}}{\text{Daily Consumption Velocity}}$.
   - Automated pairing of shortage facilities ($DOS \le 2.5d$) with surplus facilities ($DOS \ge 5.0d$).

6. **Interactive 3D WebGL Experiences:**
   - **`/docs` Swagger Studio:** Flow Wave WebGL canvas, Simplex noise shaders, 3-stage `EffectComposer` (Torus, UnrealBloom, Final blend), with upright interactive Matter.js badge physics.
   - **Portal 1 (Clinical Hub):** Three.js Morphos biological particle network (180+ particles, neural pulsing, heartbeat scale dynamics).
   - **Portal 2 (Logistics Operations):** Three.js 3D Freight Convoy (truck traversing a cubic Catmull-Rom spline route between beacon hubs with cold-chain cryo-box and particle trails).
   - **Portal 3 (Cyber Lab):** Three.js Cyber Defense Grid (interactive neon wireframe grid, rotating icosahedron core, shield rings, and attack shockwaves).

7. **FastAPI Modular Monolith & Real-Time Event Bus:**
   - Native FastAPI WebSocket broadcaster (`/ws/events`) interconnecting all three frontends.
   - Unified `TripartiteNav` with live server status, socket ping indicators, and 1-click cross-portal navigation.

---

## Category 2: Implemented & Working, Awaiting Physical External Hardware / Live Third-Party API Keys

These modules contain fully functional software logic, database schemas, and endpoints, but currently interface with deterministic software feeds in the absence of physical IoT hardware or paid commercial subscriptions:

1. **Cold-Chain Hardware IoT Loggers:**
   - *Current Implementation:* Telemetry ingest endpoint (`POST /api/v1/shipments/telemetry`) receives continuous temperature, GPS coordinates, and battery level. Breaching the 2.0°C–8.0°C threshold immediately sets shipment status to `UNDER_REVIEW`, locks custody, and triggers WebSocket alerts.
   - *Awaiting External Hardware:* Physical Bluetooth Low Energy (BLE) temperature data loggers (e.g., TempTale Ultra, Sensitech) and vehicle OBD-II cellular telematics units. When physical devices are present, they transmit directly to this endpoint with zero code changes.

2. **Live Cellular SMS / WhatsApp Hospital Alert Gateway:**
   - *Current Implementation:* Critical shortage and thermal excursion alerts broadcast via native WebSockets to connected dashboards and generate cryptographic audit entries.
   - *Awaiting External API Keys:* Commercial SMS gateway credentials (e.g., Twilio, Gupshup, CDAC SMS Gateway for Government of India).

3. **Live Turn-by-Turn GPS Road Routing:**
   - *Current Implementation:* Great-circle Haversine geographic routing and animated waypoint interpolation between medical centers across Bihar, West Bengal, and Jharkhand (clearly labeled with on-screen notice as simulated for demonstration).
   - *Awaiting External API Keys:* Live commercial OpenStreetMap / Mapbox Directions API token for real-time live traffic congestion rerouting.

---

## Category 3: Interactive Prototypes Using Labeled, Deterministic Realistic Sample Data

The following elements use realistic, deterministic synthetic datasets to demonstrate end-to-end functionality during evaluation:

1. **Hospital Consumption Velocity Seeds:**
   - Initial average daily consumption rates (e.g., JLNMCH O+ RBC consumption of 5 units/day with 4 units remaining $\rightarrow DOS = 0.8d$) are seeded deterministically to illustrate automated stockout prediction during the live demo. In a live hospital deployment, this feeds from the Hospital Information System (HIS / EHR via HL7/FHIR).

2. **Multistate Center Geographic Coordinates:**
   - The 9 facilities (JLNMCH Bhagalpur, Sadar Hospital, Mayaganj Blood Depot, IIIT Bhagalpur Clinic, AIIMS Patna, Care Pharmacy Siliguri, North Bengal Depot, Central MediHub Kolkata, RIMS Ranchi) use real, verified geographic coordinates and realistic clinical supply profiles.

3. **Emergency Clinical Notes:**
   - Requisition justifications (e.g., "Massive trauma casualty arriving in ER. Immediate transfusion required") are pre-populated with synthetic clinical notes with full PII redaction to simulate HIPAA/DISHA compliance.

