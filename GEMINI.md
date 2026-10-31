==============================================================================

PHARMASHIELD — ANTIGRAVITY AGENT DIRECTIVE \& EXECUTION BLUEPRINT (GEMINI.MD)

==============================================================================

HACKATHON: Securathon 2026 (IIIT Bhagalpur) | Track 2: Cybersecurity (1.2x Multiplier)

MISSION: Intelligent, Predictive \& Cryptographically Verifiable Medical Logistics

TEAM PROTOCOL: 4 Engineers | Monorepo | Strict Separation of Concerns

==============================================================================

1\. AGENT OPERATING DIRECTIVES (STRICT GUARDRAILS)

When generating, modifying, or refactoring code, Antigravity MUST obey these rules:



NO PLACEHOLDERS / NO "TODOs":

Write fully functional implementations end-to-end. Never write # TODO: Add logic here, // implement later, or pass dummy pass-throughs unless explicitly directed for mock test suites.

MODULAR MONOLITH ONLY:

Absolutely NO microservice networking, gRPC bridges, Apache Kafka, RabbitMQ, Celery workers, or Kubernetes manifests. Real-time events use FastAPI native WebSockets.

NO DIVERGENT SCHEMAS (SINGLE SOURCE OF TRUTH):

Backend Pydantic v2 schemas (backend/app/schemas/) are the sole contract.

Frontend TypeScript types (frontend/src/types/index.ts) MUST match Pydantic schemas 1:1.

NO ARBITRARY LIBRARIES:

Backend: FastAPI, uvicorn, SQLAlchemy>=2.0, psycopg2-binary, pydantic>=2.0, cryptography>=42.0.0, scikit-learn, python-jose\[cryptography], passlib\[argon2].

Frontend: React 18, TypeScript, Vite, TailwindCSS, lucide-react, leaflet, react-leaflet, recharts, axios.

CONCURRENCY \& SAFETY LOCKS:

Any inventory deduction MUST use database row-level locking (SELECT ... FOR UPDATE) to prevent race conditions during concurrent emergency allocations.

NO FAKE BLOCKCHAIN / NO GAS FEES:

Use Python's native cryptography library for Ed25519 digital signatures and SHA-256 canonical hash chaining. This gives 100% cryptographic tamper-evidence without deployment fragility.

2\. PROJECT REPOSITORY LAYOUT

Antigravity must place all created files into this exact directory structure:



pharmashield/

├── backend/

│   ├── app/

│   │   ├── api/

│   │   │   └── v1/

│   │   │       ├── auth.py             # User \& Organization onboarding, JWT auth

│   │   │       ├── inventory.py        # 6-category inventory, batch quarantine, stock query

│   │   │       ├── requests.py         # Emergency requests, matching triggers, approval

│   │   │       ├── shipments.py        # Dispatch, custody transfer, sensor ingestion

│   │   │       ├── ai.py               # Matching scores, shortage prediction (DOS)

│   │   │       └── security.py         # Signature verification, public keys, audit ledger

│   │   ├── core/

│   │   │   ├── config.py               # Pydantic BaseSettings (DB URL, secret keys)

│   │   │   ├── database.py             # SQLAlchemy Async/Sync Engine \& SessionLocal

│   │   │   └── security.py             # Password hashing (Argon2id), JWT encode/decode

│   │   ├── models/                     # SQLAlchemy 2.0 ORM Declarative Models

│   │   │   ├── organization.py         # Organizations, Facilities, Users

│   │   │   ├── inventory.py            # ResourceTypes, Inventory, Batches, Details

│   │   │   ├── logistics.py            # Requests, Allocations, Shipments, Telemetry

│   │   │   └── ledger.py               # CanonicalEvents, AuditLedgerRecords

│   │   ├── schemas/                    # Pydantic v2 Request/Response Models

│   │   │   ├── core.py                 # Enums, Facility, Base Resource models

│   │   │   ├── inventory.py            # Category payloads, batch quarantine schemas

│   │   │   ├── requests.py             # Emergency request \& allocation schemas

│   │   │   ├── logistics.py            # Shipments, telemetry, custody events

│   │   │   ├── ai.py                   # Matching candidates, forecast responses

│   │   │   └── security.py             # Cryptographic verify request/response

│   │   ├── services/                   # Pure Domain Logic (Business Rules)

│   │   │   ├── crypto.py               # Ed25519 signing, verification, SHA-256 chain

│   │   │   ├── matching.py             # 5-factor scoring engine + Hard safety filters

│   │   │   ├── forecasting.py          # Days of Stock (DOS) \& shortage risk estimator

│   │   │   └── coldchain.py            # Telemetry parser \& excursion state manager

│   │   └── websockets.py               # WebSocket broadcaster for Command Center

│   ├── scripts/

│   │   ├── seed.py                     # Realistic Bhagalpur medical facilities seed

│   │   └── generate\_keys.py            # Ed25519 keypair generator for demo orgs

│   ├── requirements.txt

│   └── main.py                         # FastAPI application entrypoint with CORS

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── Navbar.tsx              # System status, role switcher, emergency banner

│   │   │   ├── CommandMap.tsx          # Leaflet map: facilities, active shipments, routes

│   │   │   ├── MetricCards.tsx         # Active facilities, available stock, alerts

│   │   │   ├── EmergencyModal.tsx      # Multi-step medical requisition form

│   │   │   ├── MatchingView.tsx        # Ranked candidate suppliers with score breakdown

│   │   │   ├── ColdChainChart.tsx      # Recharts live temperature graph (2-8°C safe zone)

│   │   │   └── SecurityLab.tsx         # Interactive tampering demonstration widget

│   │   ├── pages/

│   │   │   ├── CommandCenter.tsx       # Primary operational overview (map + live telemetry)

│   │   │   ├── ResourceExchange.tsx    # Inventory lookup across 6 categories

│   │   │   └── AuditLedger.tsx         # Cryptographic chain inspector \& verification tool

│   │   ├── services/

│   │   │   ├── api.ts                  # Axios client with interceptors

│   │   │   └── ws.ts                   # WebSocket client for real-time alerts

│   │   ├── types/

│   │   │   └── index.ts                # TypeScript interface mirror of Pydantic models

│   │   ├── App.tsx                     # React Router routes

│   │   ├── main.tsx

│   │   └── index.css                   # Tailwind imports

│   ├── package.json

│   ├── tailwind.config.js

│   └── vite.config.ts

├── simulators/

│   ├── iot\_sensor.py                   # Sends 2-8°C telemetry + triggers excursion

│   └── attack\_demo.py                  # CLI demonstration of signature tampering rejection

└── docker-compose.yml                  # PostgreSQL 16 + PostGIS container

3\. CORE DOMAIN \& DATA CONTRACTS

3.1 The 6 Resource Categories \& Safety Rules

Category	Unique Identifier \& Details	Hard Safety Constraint

MEDICINES	Batch ID, Expiry Date, Recall Status, Storage	Exclude if expiry <= now or recall\_status == True.

BLOOD\_COMPONENTS	Blood Group (A/B/AB/O, +/-), Component (RBC/Platelet/Plasma)	Donor-recipient compatibility matrix must match 100%.

MEDICAL\_EQUIPMENT	Serial No, Calibration Status, Maintenance Due	Exclude if calibration\_valid == False.

VACCINES	Strict 2.0°C – 8.0°C range, Continuous Telemetry	Excursion triggers UNDER\_REVIEW; never auto-cleared.

DIAGNOSTIC\_SAMPLES	Sample ID, Specimen Type, Processing Deadline	Exclude if estimated\_transit\_time >= processing\_deadline.

EMERGENCY\_SUPPLIES	Trauma Kits, PPE, Urgency Level (CRITICAL)	Dispatched immediately using highest transport priority.

3.2 Canonical Pydantic v2 Schemas (backend/app/schemas/)

A. Core Enums \& Base Schemas (backend/app/schemas/core.py)

from pydantic import BaseModel, Field, ConfigDict

from enum import Enum

from typing import Optional, Dict, Any, List

from datetime import datetime



class ResourceCategory(str, Enum):

&#x20;   MEDICINES = "MEDICINES"

&#x20;   BLOOD\_COMPONENTS = "BLOOD\_COMPONENTS"

&#x20;   MEDICAL\_EQUIPMENT = "MEDICAL\_EQUIPMENT"

&#x20;   VACCINES = "VACCINES"

&#x20;   DIAGNOSTIC\_SAMPLES = "DIAGNOSTIC\_SAMPLES"

&#x20;   EMERGENCY\_SUPPLIES = "EMERGENCY\_SUPPLIES"



class UrgencyLevel(str, Enum):

&#x20;   LOW = "LOW"

&#x20;   STANDARD = "STANDARD"

&#x20;   URGENT = "URGENT"

&#x20;   CRITICAL = "CRITICAL"



class ShipmentStatus(str, Enum):

&#x20;   PENDING = "PENDING"

&#x20;   ALLOCATED = "ALLOCATED"

&#x20;   DISPATCHED = "DISPATCHED"

&#x20;   IN\_TRANSIT = "IN\_TRANSIT"

&#x20;   UNDER\_REVIEW = "UNDER\_REVIEW"

&#x20;   DELIVERED = "DELIVERED"

&#x20;   REJECTED = "REJECTED"



class FacilityBase(BaseModel):

&#x20;   model\_config = ConfigDict(from\_attributes=True)

&#x20;   id: str

&#x20;   name: str

&#x20;   organization\_id: str

&#x20;   facility\_type: str  # HOSPITAL, BLOOD\_BANK, WAREHOUSE, LAB

&#x20;   latitude: float

&#x20;   longitude: float

&#x20;   city: str = "Bhagalpur"

&#x20;   is\_active: bool = True

B. AI Matching \& Emergency Request Schemas (backend/app/schemas/requests.py \& ai.py)

class EmergencyRequestCreate(BaseModel):

&#x20;   requesting\_facility\_id: str

&#x20;   category: ResourceCategory

&#x20;   resource\_code: str                  # e.g., "O\_POS\_RBC", "INSULIN\_GLARGINE", "TRAUMA\_KIT"

&#x20;   quantity: int = Field(gt=0)

&#x20;   urgency: UrgencyLevel

&#x20;   required\_by: datetime

&#x20;   clinical\_note\_redacted: Optional\[str] = None  # No raw patient PII allowed



class CandidateMatch(BaseModel):

&#x20;   facility\_id: str

&#x20;   facility\_name: str

&#x20;   latitude: float

&#x20;   longitude: float

&#x20;   distance\_km: float

&#x20;   available\_units: int

&#x20;   score: float                        # 0.0 to 100.0

&#x20;   rank: int

&#x20;   score\_breakdown: Dict\[str, float]   # {"urgency": 30, "availability": 25, "transport": 20, "safety": 15, "reliability": 10}

&#x20;   is\_eligible: bool

&#x20;   disqualification\_reason: Optional\[str] = None

C. Cryptographic Audit Schemas (backend/app/schemas/security.py)

class CanonicalEventPayload(BaseModel):

&#x20;   shipment\_id: str

&#x20;   event\_type: str                     # DISPATCHED, CUSTODY\_TRANSFERRED, SENSOR\_EXCURSION, DELIVERED

&#x20;   actor\_id: str

&#x20;   organization\_id: str

&#x20;   timestamp\_utc: str                  # Strict ISO-8601

&#x20;   previous\_hash: str                  # 64-character SHA-256 hex string

&#x20;   payload: Dict\[str, Any]             # Deterministic JSON payload



class AuditRecordResponse(BaseModel):

&#x20;   event: CanonicalEventPayload

&#x20;   event\_hash: str

&#x20;   signature\_hex: str

&#x20;   public\_key\_hex: str

&#x20;   is\_valid: bool

4\. MATHEMATICAL \& ALGORITHMIC SPECIFICATIONS

Antigravity must implement these exact formulas in backend/app/services/:



4.1 Resource Matching Engine (backend/app/services/matching.py)

Safety Filter (Hard Ineligibility):

If batch.expiry <= now() -> DISQUALIFIED: Expired Batch.

If category == BLOOD\_COMPONENTS and not compatible -> DISQUALIFIED: Blood Incompatibility.

If available\_units < requested\_units -> DISQUALIFIED: Insufficient Units.

If category == DIAGNOSTIC\_SAMPLES and travel\_hours > max\_hours -> DISQUALIFIED: Transit exceeds sample viability.

Scoring Function (For Eligible Candidates): $$\\text{Score} = 0.30 \\cdot U + 0.25 \\cdot A + 0.20 \\cdot T + 0.15 \\cdot S + 0.10 \\cdot R$$

$U$ (Urgency Match): CRITICAL = 100.0, URGENT = 85.0, STANDARD = 70.0, LOW = 50.0.

$A$ (Availability): $\\min(100.0, (\\text{available} / \\text{requested}) \\times 100.0)$.

$T$ (Transport): $\\max(0.0, 100.0 - (\\text{distance\_km} \\times 2.0))$.

$S$ (Safety / Handling): 100.0 if vehicle has required cold chain/equipment; 50.0 otherwise.

$R$ (Reliability): Facility historical fulfillment rating (seeded between 85.0 and 98.0).

4.2 Shortage Prediction / Days of Stock (backend/app/services/forecasting.py)

$$\\text{DOS} = \\frac{\\text{Current Inventory Units}}{\\text{Average Daily Consumption Units}}$$



If $\\text{DOS} \\le \\text{Estimated Supplier Lead Time (Days)}$, trigger:

status = "CRITICAL\_SHORTAGE\_PREDICTED"

Raise real-time WebSocket alert to Command Center.

4.3 Cryptographic Audit Hash-Chain \& Signatures (backend/app/services/crypto.py)

import json

import hashlib

from cryptography.hazmat.primitives.asymmetric import ed25519



def canonical\_json\_bytes(data: dict) -> bytes:

&#x20;   """Deterministic UTF-8 bytes: sorted keys, no whitespace separators."""

&#x20;   return json.dumps(data, sort\_keys=True, separators=(',', ':')).encode('utf-8')



def compute\_hash(previous\_hash: str, canonical\_payload: dict) -> str:

&#x20;   """H\_i = SHA-256(H\_{i-1} || CanonicalPayload\_i)"""

&#x20;   hasher = hashlib.sha256()

&#x20;   hasher.update(previous\_hash.encode('utf-8'))

&#x20;   hasher.update(canonical\_json\_bytes(canonical\_payload))

&#x20;   return hasher.hexdigest()



def sign\_event\_hash(private\_key: ed25519.Ed25519PrivateKey, event\_hash: str) -> str:

&#x20;   """Sign the SHA-256 hex digest using Ed25519."""

&#x20;   signature = private\_key.sign(event\_hash.encode('utf-8'))

&#x20;   return signature.hex()



def verify\_event\_signature(public\_key\_hex: str, event\_hash: str, signature\_hex: str) -> bool:

&#x20;   """Verify digital signature against the registered public key."""

&#x20;   try:

&#x20;       pub\_key = ed25519.Ed25519PublicKey.from\_public\_bytes(bytes.fromhex(public\_key\_hex))

&#x20;       pub\_key.verify(bytes.fromhex(signature\_hex), event\_hash.encode('utf-8'))

&#x20;       return True

&#x20;   except Exception:

&#x20;       return False

5\. DATABASE DDL \& SEED DATA SPECIFICATION

Antigravity must use PostgreSQL 16 with PostGIS. Seed data MUST include these realistic Bhagalpur, Bihar medical centers:



Jawaharlal Nehru Medical College \& Hospital (JLNMCH)

Role: Tertiary Care Hospital | Lat: 25.2445, Lng: 87.0125

Initial State: O+ RBC stock critical (4 units remaining, usage 5/day -> DOS = 0.8 days).

Sadar Hospital Bhagalpur

Role: District Hospital | Lat: 25.2490, Lng: 86.9840

Initial State: O+ RBC stock surplus (28 units available).

Mayaganj Blood Bank \& Central Depot

Role: Central Blood Depot | Lat: 25.2420, Lng: 87.0150

Stock: 50 units O+, 40 units A+, Cold-chain certified.

IIIT Bhagalpur Health Clinic

Role: Remote Primary Health Center | Lat: 25.2605, Lng: 87.0425

Needs: Trauma Kits, Anti-venom emergency replenishment.

6\. FRONTEND DESIGN SYSTEM \& KEY SCREENS

Theme: Clean Operational Command Center (Slate-900 background, Cyan-500 accents, Emerald-500 safe status, Rose-500 excursion/tamper warnings).

Screens:

/: Command Center — Split view with interactive Leaflet map (hospital markers with pulse alerts for shortages) and live incident feed.

/exchange: Medical Resource Exchange — Category filter tabs (6 categories), search bar, and "Request Allocation" wizard.

/security: Security Lab \& Trust Ledger — Visual hash-chain block explorer with a one-click "Simulate Tampering" toggle that flips an event parameter and demonstrates instant signature failure.

7\. ANTIGRAVITY TASK INVOCATION TEMPLATE

When prompting Antigravity for any single task, paste this prefix:



"You are building PharmaShield according to the directives in GEMINI.MD. Target File: <exact path> Task: <specific task> Adhere strictly to the Pydantic schemas, modular architecture, and Ed25519 cryptographic contracts. No placeholders. Write complete, production-ready code."

