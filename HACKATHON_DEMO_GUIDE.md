# PharmaShield — Hackathon Live Demonstration & Presentation Script

> **Event:** Securathon 2026 (IIIT Bhagalpur) — Track 2: Cybersecurity (1.2x Multiplier)  
> **Duration:** 5 Minutes Live Demonstration  
> **Objective:** Demonstrate end-to-end medical logistics integrity, AI predictive intelligence, 3D WebGL immersion, and cryptographic tamper deflection.

---

## ⏱️ Live Presentation Timeline

```
[0:00 - 0:45] Intro & Problem Statement (The 6 Healthcare Failures)
[0:45 - 1:45] Act 1: Clinical Hub (:5173) & Universal Medicine Finder (Siliguri -> Kolkata)
[1:45 - 2:45] Act 2: Pharma Ops (:5174) & Cold-Chain Excursion Lock with Human Sign-off
[2:45 - 3:45] Act 3: Cyber Lab (:5175) & Live MITM Attack Deflection (Ed25519)
[3:45 - 4:30] Act 4: 3D Swagger Studio (:8000/docs) & Immutable Ledger Chain
[4:30 - 5:00] Q&A & Architecture Wrap-up
```

---

## Act 1: The Clinical Hub & Universal Medicine Finder (Port 5173)

### URL: `http://localhost:5173`

1. **Highlight the Visual Experience:**
   - Point out the **3D Morphos Biological Network**: 180+ particles, neural vascular pulsing lines, and heartbeat dynamics.
   - Toggle to the **3D Bio-Vial** to show real-time state glow (Cyan for pending, Emerald for authorized, Neon Red for alerts).

2. **Trigger Universal Medicine Finder (Problem 3):**
   - Click the **"Universal Medicine Finder"** button on the navbar.
   - Click the quick case study: **"Siliguri Out-of-Stock Demo"**.
   - **Show the Judges:**
     - The system immediately flags: `Local Stock in Siliguri: UNAVAILABLE (0 units)`.
     - Automatically expands across state lines to **Kolkata Central MediHub**.
     - Displays the **Landed Cost Breakdown**:
       $$\text{Base Price (₹2,800)} + \text{Inter-State Shipping (₹490.20)} + \text{Cold-Chain (₹150)} + \text{GST (₹344.02)} = \text{₹3,784.22}$$
     - Highlights estimated transit time (`12.0 Hours`) and IoT stock confidence (`95%`).

3. **Demonstrate ABO Blood Safety (Problem 1):**
   - Open the **Blood Requisition** form for JLNMCH Hospital.
   - Show how the algorithm filters compatibility (O- universal donor, AB+ universal recipient) and refuses to allocate incompatible units.

---

## Act 2: Pharma Logistics Operations Hub (Port 5174)

### URL: `http://localhost:5174`

1. **Highlight the 3D Logistics Spline:**
   - Show the **Three.js 3D Freight Convoy**: An animated refrigerated transport traversing a 3D spline between regional hubs with dynamic particle vapor and cold-chain cryo-box.

2. **Demonstrate Predictive Stock Rebalancing (Problem 6):**
   - Click **"AI Stock Rebalance"** on the navbar.
   - Point out **JLNMCH Hospital**: Days of Stock $DOS = 0.8\text{ days}$ ($< 2.0\text{d}$ critical threshold).
   - Show the AI recommendation: Transfers 15 units of O+ RBC from surplus depot **Mayaganj** ($DOS = 12.5\text{d}$).
   - Click **"Approve & Sign Transfer"** to trigger row-level locking (`with_for_update()`) and Ed25519 cryptographic signing.

3. **Demonstrate Cold-Chain Excursion & Clinical Sign-off (Problem 2):**
   - Click **"Cold-Chain Disposition"** on the navbar.
   - View the active consignment where temperature breached 8.0°C (spiked to `11.8°C`).
   - Note that status is locked to **`UNDER_REVIEW`** — software cannot auto-clear it.
   - Select **"CLEARED WITH OVERRIDE"**, input pharmacist license `WB-PC-48190`, and click **"Commit Clinical Sign-off"**.
   - Show the instant Ed25519 signature generated and committed to the audit ledger.

---

## Act 3: Cybersecurity Attack & Defense Lab (Port 5175)

### URL: `http://localhost:5175`

1. **Highlight the 3D Cyber Defense Grid:**
   - Show the interactive **Three.js Cyber Defense Grid**: Undulating neon wireframe, rotating icosahedron core, and sentinel shield rings.

2. **Demonstrate Live MITM Payload Tampering Deflection:**
   - In the **Exploit Console**, select attack vector: **"MITM Payload Quantity Tampering"**.
   - Click **"Execute Attack"**.
   - **Show the Judges:**
     - The adversary attempts to change requisition units from `5` to `500`.
     - The verification engine recalculates canonical hash $H_i = \text{SHA-256}(H_{i-1} \parallel \text{Payload})$.
     - The Ed25519 digital signature fails: **`SIGNATURE_VERIFICATION_FAILED_REJECTED`**.
     - In the **Matter.js Physics Arena**, the rogue red packet is violently deflected by the sensor into the isolated **Quarantine Chamber**.
     - The 3D Cyber Grid flashes neon red, and a security alert is dispatched over the WebSocket bus.

3. **Inspect the Immutable SHA-256 Hash Chain:**
   - Scroll to the **Ledger Explorer**.
   - Show that each block cryptographically locks the previous block's hash.
   - Click **"Simulate Block Mutation"** on any past block: every downstream block instantly flags red (`HASH_MISMATCH_CHAIN_BROKEN`), proving 100% tamper evidence without blockchain gas fees.

---

## Act 4: Central API & 3D Swagger Studio (Port 8000)

### URL: `http://localhost:8000/docs`

1. **Highlight the Creative WebGL Documentation Experience:**
   - Demonstrate the **Flow Wave WebGL** canvas with Simplex noise shaders and 3-stage `EffectComposer` postprocessing.
   - Show the interactive **Matter.js floating badges** responding to mouse interaction with physics-based repulsion while remaining upright.
2. **Review the Test Coverage:**
   - Mention the 4 automated test suites:
     - `test_api.py` (Contracts)
     - `test_flow.py` (5-step end-to-end lifecycle)
     - `test_prompt1.py` (18 batches, 9 facilities, healthcare rules)
     - `test_scenario_part17.py` (15-step Part 17 success scenario)

---

## 🏆 Key Talking Points for Judges

1. **Zero-Gas Tamper Evidence:** Why use slow, expensive blockchains with gas fees when Ed25519 digital signatures (RFC 8032) and canonical SHA-256 hash chains give 100% cryptographic tamper evidence with sub-millisecond verification?
2. **Clinical Safety over Commercial Convenience:** Blood is never traded as an open e-commerce commodity; life-saving allocations use row-level locking (`SELECT ... FOR UPDATE`) to prevent double-spending; thermal excursions can never be auto-cleared without verified clinician sign-off.
3. **Tripartite Architecture:** Three specialized, dedicated user interfaces (Clinical, Logistics, Cyber) tied together by a unified real-time FastAPI WebSocket event bus.

