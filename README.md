# PharmaShield: Intelligent, Predictive & Cryptographically Verifiable Medical Logistics

**Securathon 2026 (IIIT Bhagalpur) — Track 2: Cybersecurity (1.2x Multiplier)**

> An autonomous, high-assurance medical logistics and cold-chain platform featuring **Three-Portal Architecture (Tripartite)**, **Three.js WebGL Interactive Visualizers**, **Matter.js 2D Hardware-Accelerated Physics**, **5-Factor AI Matching**, **Days-of-Stock (DOS) Shortage Prediction**, and **Immutable Ed25519 & SHA-256 Hash-Chain Audit Logging**.

---

## ⚡ 1-Click Master Launch (All Portals)

To start the central backend, all three specialized frontends, and automatically open all browser tabs in Windows:

```cmd
run_all.bat
```

This single script boots:
- **Central FastAPI Backend & WebSocket Bus:** `http://localhost:8000` (Swagger: `/docs`)
- **Portal 1: Clinical (Doctor & Patient):** `http://localhost:5173`
- **Portal 2: Pharma Operations Hub:** `http://localhost:5174`
- **Portal 3: Cybersecurity Attack & Defense Lab:** `http://localhost:5175`

---

## 🏛️ Tripartite Platform Architecture

```
                               ┌───────────────────────────────────────────────────────────┐
                               │   FastAPI Central Core (Port 8000)                        │
                               │   - Ed25519 Ledger & SHA-256 Hash Chain                   │
                               │   - 5-Factor Resource Matching & DOS Forecasting Engine   │
                               │   - Real-Time WebSocket Broadcast Bus (/ws/events)        │
                               └─────────────────────────────┬─────────────────────────────┘
                                                             │ Real-Time Bidirectional Event Bus
                  ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                  ▼                                          ▼                                          ▼
   ┌───────────────────────────────┐          ┌───────────────────────────────┐          ┌───────────────────────────────┐
   │ Portal 1: Clinical (:5173)    │          │ Portal 2: Pharma Ops (:5174)  │          │ Portal 3: Cyber Lab (:5175)   │
   ├───────────────────────────────┤          ├───────────────────────────────┤          ├───────────────────────────────┤
   │ • Three.js 3D Bio-Vial        │          │ • Three.js 3D Supply Flow     │          │ • Three.js 3D Neon Cyber Grid │
   │ • Matter.js Dispenser Drop    │          │ • Live Requisition Queue      │          │ • Matter.js Packet Arena      │
   │ • Emergency Requisition Form  │          │ • Ed25519 Authorize & Sign    │          │ • Adversarial Exploit Console │
   │ • Cross-Portal Alerts         │          │ • Depot Stock & DOS Meter     │          │ • SHA-256 Ledger Explorer     │
   └───────────────────────────────┘          └───────────────────────────────┘          └───────────────────────────────┘
```

---

## 🌐 Portal Breakdown

### Portal 1: Clinical (Doctor & Patient) — Port 5173
- **Three.js 3D Bio-Vial:** Rotating 3D liquid vial whose luminescent glow shifts in real time:
  - `Cyan`: Pending requisition submitted
  - `Emerald`: Cryptographically authorized and signed with Ed25519
  - `Neon Red`: Tamper detected or cold-chain excursion
- **Matter.js 2D Dispenser Drop:** Physical containment chamber where medicine/blood capsules drop into slots upon order creation and authorization.
- **Emergency Requisition Form:** Doctor ordering portal for all 6 medical categories (Medicines, Blood, Vaccines, Equipment, Diagnostic Samples, Emergency Supplies) with urgency levels (Critical, Urgent, Standard, Low).

### Portal 2: Pharma Operations Hub — Port 5174
- **Three.js 3D Bhagalpur Geo-Conduit Mesh:** 3D animated supply conduits connecting **Mayaganj Central Depot**, **JLNMCH Hospital**, **Sadar Hospital**, and **IIIT Bhagalpur Health Clinic** with moving glowing supply packets.
- **Live Requisition Queue:** Real-time incoming clinical orders updating via WebSocket with one-click **"Authorize & Sign"** applying Ed25519 digital signatures and SHA-256 hash chaining.
- **Stock Allocation & DOS Monitor:** Real-time inventory tracking with Days of Stock ($DOS = \text{Current} / \text{Consumption}$) and warning alerts for items with $\le 2.0$ days buffer.

### Portal 3: Cybersecurity Attack & Defense Lab — Port 5175
- **Three.js 3D Neon Cyber Grid:** Real-time terrain wireframe that undulates with electrical pulses and dynamically shifts from emerald to flashing neon red upon cyberattack.
- **Matter.js Packet Collision Arena:** Real-time 2D physics arena where legitimate packets pass through the Ed25519 verification gate, while malicious/tampered packets collide with the defense sensor and are deflected into the isolated Quarantine Chamber.
- **Adversarial Exploit Console:** Interactive triggers for MITM Quantity Tampering, Forged Ed25519 Signatures, and Cold-Chain Thermal Excursions. Displays detailed cryptographic proofs showing hash divergence (avalanche effect).
- **Immutable SHA-256 Hash Chain Explorer:** Block-by-block ledger verification tool with client-side mutation simulator to demonstrate instant chain invalidation.

---

## 🔬 Mathematical & Cryptographic Specifications

### 1. 5-Factor AI Matching Engine
$$\text{Score} = 0.30 \cdot U + 0.25 \cdot A + 0.20 \cdot T + 0.15 \cdot S + 0.10 \cdot R$$
- $U$ (Urgency Match): Critical=100.0, Urgent=85.0, Standard=70.0, Low=50.0
- $A$ (Availability): $\min(100.0, (\text{available} / \text{requested}) \times 100.0)$
- $T$ (Transport Feasibility): $\max(0.0, 100.0 - (\text{distance\_km} \times 2.0))$ via Haversine distance
- $S$ (Handling & Safety): 100.0 if vehicle has cold-chain/required equipment; 50.0 otherwise
- $R$ (Reliability): Facility historical fulfillment rating (seeded 85.0–98.0)

### 2. Shortage Forecasting & Days of Stock (DOS)
$$\text{DOS} = \frac{\text{Current Inventory Units}}{\text{Average Daily Consumption Units}}$$
- If $\text{DOS} \le \text{Lead Time (2 Days)}$: Triggers `CRITICAL_SHORTAGE_PREDICTED` and broadcasts real-time WebSocket alert.

### 3. Cryptographic Hash-Chain & Signatures
- Canonical UTF-8 deterministic JSON (`sort_keys=True, separators=(',', ':')`)
- $H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalPayload}_i)$
- RFC 8032 Ed25519 Digital Signatures using Python `cryptography` library.

---

## 🧪 Verification & Standalone Simulators

```bash
# Run IoT cold-chain sensor stream (2.0°C - 8.0°C + excursion)
python simulators/iot_sensor.py

# Run standalone CLI attack demonstration
python simulators/attack_demo.py
```
