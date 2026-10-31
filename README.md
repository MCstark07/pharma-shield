# PharmaShield: Intelligent, Predictive & Cryptographically Verifiable Medical Logistics

**Securathon 2026 (IIIT Bhagalpur) — Track 2: Cybersecurity (1.2x Multiplier)**

> A high-assurance medical logistics and cold-chain platform featuring **5-Factor AI Resource Matching**, **Days-of-Stock (DOS) Shortage Prediction**, and **Immutable Ed25519 & SHA-256 Hash-Chain Audit Logging**.

---

## 🌟 Key Architecture & Capabilities

1. **6 Medical Resource Categories with Hard Safety Constraints**:
   - **MEDICINES**: Expiry enforcement and instant batch recall quarantine.
   - **BLOOD_COMPONENTS**: Strict donor-recipient compatibility matrix (e.g. O- universal, O+ compatibility).
   - **MEDICAL_EQUIPMENT**: Calibration and periodic maintenance validity checks.
   - **VACCINES**: Continuous 2.0°C – 8.0°C cold-chain telemetry; excursions transition to `UNDER_REVIEW`.
   - **DIAGNOSTIC_SAMPLES**: Transit time vs. sample viability deadlines.
   - **EMERGENCY_SUPPLIES**: Tactical trauma kits and antivenom rapid allocation.

2. **5-Factor AI Matching Engine**:
   $$\text{Score} = 0.30 \cdot U + 0.25 \cdot A + 0.20 \cdot T + 0.15 \cdot S + 0.10 \cdot R$$
   - $U$: Urgency Match (Critical=100, Urgent=85, Standard=70, Low=50)
   - $A$: Availability ($\min(100, \frac{\text{avail}}{\text{req}} \times 100)$)
   - $T$: Transport Distance ($\max(0, 100 - \text{dist\_km} \times 2.0)$)
   - $S$: Safety Handling (100 if cold-chain equipped, 50 otherwise)
   - $R$: Facility Historical Reliability (85–98%)

3. **Days of Stock (DOS) Shortage Predictor**:
   $$\text{DOS} = \frac{\text{Current Inventory Units}}{\text{Average Daily Consumption Units}}$$
   Triggers `CRITICAL_SHORTAGE_PREDICTED` when $\text{DOS} \le \text{Lead Time (2 Days)}$.

4. **100% Cryptographic Tamper-Evidence (Zero Gas Fees / No Deployment Fragility)**:
   - SHA-256 Canonical JSON Chaining: $H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalPayload}_i)$
   - RFC 8032 Ed25519 Digital Signatures per hospital organization.
   - Concurrency row-level locking (`SELECT ... FOR UPDATE`) prevents race conditions during emergency allocations.

---

## 🚀 Quickstart Guide

### 1. Backend Setup & Seeding

```bash
# In project root
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r backend/requirements.txt

# Run initial database seeding (populates Bhagalpur medical facilities and inventory)
python backend/scripts/seed.py

# Start FastAPI backend
python -m uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔬 Running Simulators

### Cold-Chain IoT Sensor Simulator
Simulates real-time 2.0°C – 8.0°C sensor readings with GPS coordinates along the Bhagalpur transit route, and triggers a thermal excursion:

```bash
python simulators/iot_sensor.py
```

### Cybersecurity Tamper Demonstration
Demonstrates instantaneous cryptographic rejection of data tampering:

```bash
python simulators/attack_demo.py
```

---

## 🏛️ Bhagalpur Medical Grid Seed Centers

- **Jawaharlal Nehru Medical College & Hospital (JLNMCH)**: Lat 25.2445, Lng 87.0125 (Tertiary Care Hospital)
- **Sadar Hospital Bhagalpur**: Lat 25.2490, Lng 86.9840 (District Hospital)
- **Mayaganj Blood Bank & Central Depot**: Lat 25.2420, Lng 87.0150 (Central Blood Depot)
- **IIIT Bhagalpur Health Clinic**: Lat 25.2605, Lng 87.0425 (Remote Primary Health Center)

