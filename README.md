# PharmaShield: Intelligent, Predictive & Cryptographically Verifiable Medical Logistics

> **Securathon 2026 (IIIT Bhagalpur) — Track 2: Cybersecurity (1.2x Multiplier)**  
> **Platform Mission:** "Every medical resource. Available when it matters."  
> **Core Architecture:** Tripartite Full-Stack Monolith (React 18 + Vite + Three.js + FastAPI + PostgreSQL 16 PostGIS / SQLite 3)

---

## ⚡ 1-Click Master Launch (All 4 Services)

To seed the database, start the central FastAPI backend and WebSocket bus, and launch all 3 portals in dedicated windows:

```powershell
# From project root:
.\run_all.ps1

# Or via Command Prompt:
run_all.bat
```

| Service | Address | Theme & 3D Experience | Key Capabilities |
|---|:---:|---|---|
| **Central Backend & API Studio** | [`http://localhost:8000/docs`](http://localhost:8000/docs) | **Flow Wave WebGL** (`r0.143.0` Simplex shaders, 3-stage `EffectComposer`, upright Matter.js badges) | 22+ REST endpoints, native WebSocket broadcaster (`/ws/events`), PostgreSQL 16 PostGIS / SQLite 3 engine. |
| **Portal 1: Clinical Hub** | [`http://localhost:5173`](http://localhost:5173) | **3D Morphos Biological Network** (180+ particles, neural vascular pulsing, heartbeat dynamics) | **Problem 1 (Blood Crisis):** JLNMCH O+ RBC allocation with 100% ABO matrix validation; **Problem 3 (Universal Finder):** Siliguri out-of-stock case study sourcing Kolkata. |
| **Portal 2: Logistics Operations** | [`http://localhost:5174`](http://localhost:5174) | **3D Freight Spline Convoy** (Convoy truck traversing spline between beacon hubs, cryo-box, particle vapor) | **Problem 2 (Cold-Chain):** 2.0°C–8.0°C excursion locks, clinical sign-off; **Problem 4 (Prices):** Inter-state price intelligence; **Problem 5 (GPS):** Live route tracking. |
| **Portal 3: Cyber Security Lab** | [`http://localhost:5175`](http://localhost:5175) | **3D Cyber Defense Grid** (Interactive neon grid, rotating icosahedron, sentinel shield rings) | **Security:** Interactive MITM packet tampering simulator demonstrating instant Ed25519 signature rejection and SHA-256 block chain inspection. |

---

## 🐳 Docker Production Deployment

PharmaShield includes a complete multi-container production configuration:

```bash
docker compose up --build -d
```

- **Unified Gateway (Nginx :80):** `http://localhost/` (Clinical Hub)
- **Logistics Operations:** `http://localhost/ops`
- **Cyber Security Lab:** `http://localhost/cyber`
- **FastAPI Core & 3D Swagger Studio:** `http://localhost/docs`
- **Database:** PostgreSQL 16 + PostGIS 3.4 (`5432`)

---

## 🏛️ Tripartite Platform Architecture

```
                               ┌───────────────────────────────────────────────────────────┐
                               │   FastAPI Central Core (Port 8000)                        │
                               │   - Ed25519 Digital Signatures (RFC 8032)                 │
                               │   - Canonical SHA-256 Hash Chain (RFC 8785)               │
                               │   - 5-Factor AI Resource Matching Engine                  │
                               │   - Predictive Days-of-Stock (DOS) Rebalancing            │
                               │   - Real-Time WebSocket Event Bus (/ws/events)            │
                               │   - Row-Level Locking (SELECT ... FOR UPDATE)             │
                               └─────────────────────────────┬─────────────────────────────┘
                                                             │ Real-Time Bidirectional Event Bus
                  ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                  ▼                                          ▼                                          ▼
   ┌───────────────────────────────┐          ┌───────────────────────────────┐          ┌───────────────────────────────┐
   │ Portal 1: Clinical (:5173)    │          │ Portal 2: Pharma Ops (:5174)  │          │ Portal 3: Cyber Lab (:5175)   │
   ├───────────────────────────────┤          ├───────────────────────────────┤          ├───────────────────────────────┤
   │ • Three.js Morphos 3D Network │          │ • Three.js 3D Freight Convoy  │          │ • Three.js Neon Cyber Grid    │
   │ • Three.js Bio-Vial Shaders   │          │ • Leaflet GPS Tracking Map    │          │ • Matter.js Packet Arena      │
   │ • Universal Medicine Finder   │          │ • Cold-Chain Excursion Lock   │          │ • MITM Exploit Console        │
   │ • Landed Cost Breakdown       │          │ • Clinical Disposition Modal  │          │ • SHA-256 Ledger Explorer     │
   │ • ABO Blood Rescue Workflow   │          │ • Inter-State Price Intel     │          │ • Cryptographic Attack Lab    │
   │ • Cross-Portal Navigation     │          │ • AI Predictive Rebalance     │          │ • Real-Time Tamper Deflection │
   └───────────────────────────────┘          └───────────────────────────────┘          └───────────────────────────────┘
```

---

## 🔬 Core Healthcare Differentiation Engines

### 1. Hospital Blood Stockout Rescue & Compatibility Filter (Problem 1)
- **Clinical Rule:** Excludes blood inventory if donor-recipient ABO/Rh compatibility is not 100% satisfied.
- **Crisis Scenario Seed:** JLNMCH Bhagalpur with critical O+ RBC inventory (4 units remaining, usage 5 units/day $\rightarrow DOS = 0.8\text{ days}$).
- **Safety Enforcement:** Blood units are strictly requisition-authorized and cannot be traded as open commercial commodities.

### 2. Vaccine Cold-Chain Integrity & Clinical Disposition (Problem 2)
- **Safe Zone:** Strict 2.0°C – 8.0°C thermal boundary.
- **Excursion Lockdown:** Any reading $< 2.0^\circ\text{C}$ or $> 8.0^\circ\text{C}$ automatically locks the shipment into **`UNDER_REVIEW`**.
- **Human-in-the-Loop Sign-Off:** Quarantined shipments can **never** be auto-cleared by software. A certified clinical toxicologist or medical officer must sign off with a verified license number (`CLEARED_WITH_OVERRIDE` vs `PERMANENTLY_REJECTED`), committing an Ed25519-signed record to the audit ledger.

### 3. Universal Medicine Availability Finder (Problem 3)
- **Multi-Ring Expansion:** Local (City / 25km) $\rightarrow$ District (100km) $\rightarrow$ Inter-State (>100km).
- **Landed Cost Formula:**
  $$\text{Landed Cost} = \text{Base Price} + \text{Inter-State Shipping} + \text{Cold-Chain Surcharge} + \text{GST (12\%)}$$
- **Siliguri Case Study:** Siliguri Care Pharmacy requests Remdesivir; detects local stockout ($0\text{ units}$), automatically sources from Kolkata Central MediHub with complete landed cost transparency.

### 4. Cross-State Medicine Price Intelligence (Problem 4)
- Aggregates wholesale pricing across Bihar, West Bengal, and Jharkhand.
- Automated anomaly detection flags predatory price spreads ($> 35\%$).

### 5. Medical Shipment Visibility & GPS Tracking (Problem 5)
- Animated GPS route interpolation with live coordinates, distance remaining, ETA, and real-time cold-chain status overlays (explicitly labeled as simulated for demonstration).

### 6. Predictive Stockout Prevention & Days of Stock (Problem 6)
- **Days of Stock:**
  $$DOS = \frac{\text{Current Inventory Units}}{\text{Daily Consumption Velocity}}$$
- **Automated Rebalancing:** Automatically pairs critical shortage centers ($DOS \le 2.5\text{d}$) with regional surplus centers ($DOS \ge 5.0\text{d}$), generating 1-click Ed25519 authorized transfer orders.

---

## 🔐 Cryptographic Specification & Zero-Gas Consensus

PharmaShield uses Python's native `cryptography` library for Ed25519 digital signatures and SHA-256 canonical hash chaining without blockchain gas fees, network latency, or external node dependencies:

- **Deterministic Serialization:** RFC 8785 strict canonical JSON (sorted keys, compact separators).
- **Cryptographic Chaining:** $H_i = \text{SHA-256}(H_{i-1} \parallel \text{CanonicalPayload}_i)$.
- **Digital Signatures:** RFC 8032 Ed25519 asymmetric signatures verified in $< 0.5\text{ ms}$.
- **Pessimistic Concurrency Locking:** `SELECT ... FOR UPDATE` row locks preventing stock race conditions during simultaneous hospital allocations.

---

## 🧪 Comprehensive Automated Test Suites

```bash
# 1. API Contracts and Requisitions
python backend/tests/test_api.py

# 2. End-to-End 5-Step Clinical and Security Lifecycle
python backend/tests/test_flow.py

# 3. Prompt 1 Multi-State Foundation & Healthcare Constraints (18 batches, 9 facilities)
python backend/tests/test_prompt1.py

# 4. Part 17 Final Definition of Success 15-Step Clinical Scenario
python backend/tests/test_scenario_part17.py
```

All 4 test suites pass with **100% verification**.

---

## 📚 Complete Project Documentation

- [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md): Comprehensive system audit and existing feature preservation catalog.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md): System topology, event bus, row-level locking, and 3D WebGL rendering pipeline.
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md): Complete Mermaid ER diagram, table constraints, PostGIS indexes, and concurrency locking.
- [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md): OpenAPI 3.0 catalog for all 22+ endpoints with request/response payloads.
- [`DEPLOYMENT.md`](./DEPLOYMENT.md): Production deployment guide for Docker Compose, systemd, SSL reverse proxy, and key rotation.
- [`TEST_REPORT.md`](./TEST_REPORT.md): Comprehensive test runs and security verification benchmarks.
- [`KNOWN_LIMITATIONS.md`](./KNOWN_LIMITATIONS.md): Transparent classification of production-ready features vs awaiting external hardware.
- [`HACKATHON_DEMO_GUIDE.md`](./HACKATHON_DEMO_GUIDE.md): 5-minute live judging script and step-by-step presentation walkthrough.
