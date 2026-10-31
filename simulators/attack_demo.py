#!/usr/bin/env python3
"""
PharmaShield — Cryptographic Attack Demonstration CLI
Designed for the Securathon 2026 Pitch (Track 2: Cybersecurity - 1.2x Multiplier).

Demonstrates mathematical non-repudiation and zero-trust tamper evidence:
1. Generates an authorized Ed25519 keypair for a Bhagalpur healthcare entity.
2. Canonicalizes and signs an authentic medical dispatch event.
3. Cryptographically verifies the authentic block (VERIFICATION: PASSED).
4. Simulates a malicious Man-In-The-Middle (MITM) database alteration:
   - Changes batch quantity (e.g., 20 -> 200 units to siphoned black market diversion)
5. Re-evaluates cryptographic hash and signature:
   - Mathematically proves verification failure (VERIFICATION: REJECTED).
6. Demonstrates downstream hash-chain breakage across the entire audit ledger.
"""

from __future__ import annotations

import argparse
import copy
import json
import sys
import os

# Ensure backend package imports resolve cleanly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.services.crypto import (
    GENESIS_HASH,
    AuditLedger,
    canonical_bytes,
    compute_event_hash,
    generate_keypair,
    private_key_from_hex,
    sign_hash,
    verify_signature,
)


# ANSI Color formatting (resilient with fallback)
class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


def print_banner() -> None:
    print(f"{Colors.CYAN}{Colors.BOLD}")
    print("=" * 76)
    print("  PHARMASHIELD :: CRYPTOGRAPHIC ATTACK & TAMPER RESISTANCE DEMO")
    print("  Securathon 2026 (IIIT Bhagalpur) | Track 2: Cybersecurity (1.2x Multiplier)")
    print("=" * 76)
    print(f"{Colors.RESET}")


def run_attack_demonstration(tamper_key: str = "quantity", tamper_val: int = 200) -> bool:
    print_banner()

    # Step 1: Identity & Keypair Initialization
    print(f"{Colors.BOLD}[STEP 1] Generating Organization Ed25519 Cryptographic Keys...{Colors.RESET}")
    priv_hex, pub_hex = generate_keypair()
    priv_key = private_key_from_hex(priv_hex)
    org_id = "ORG-MAYAGANJ-CENTRAL-DEPOT"
    actor_id = "DISPATCHER-OFFICER-07"

    print(f"  Organization: {Colors.CYAN}{org_id}{Colors.RESET}")
    print(f"  Public Key:   {Colors.YELLOW}{pub_hex[:24]}...{pub_hex[-16:]}{Colors.RESET} (32 bytes raw / 64 hex)")
    print(f"  Algorithm:    {Colors.BOLD}Ed25519 (RFC 8032 Asymmetric Edwards-curve){Colors.RESET}")

    # Step 2: Formulate Authentic Medical Dispatch Event
    print(f"\n{Colors.BOLD}[STEP 2] Creating Authentic Medical Dispatch Event (O+ RBC to JLNMCH)...{Colors.RESET}")
    authentic_payload = {
        "resource_code": "O_POS_RBC",
        "category": "BLOOD_COMPONENTS",
        "batch_id": "BATCH-2026-MAYAGANJ-8810",
        "quantity": 20,
        "source_facility_id": "FAC-MAYAGANJ-01",
        "destination_facility_id": "FAC-JLNMCH-01",
        "cold_chain_required": True,
        "authorized_by": "Dr. R. K. Sharma (Blood Bank Superintendent)",
    }

    prev_hash = GENESIS_HASH
    event_envelope = {
        "shipment_id": "SHP-EMERGENCY-2026-004",
        "event_type": "DISPATCHED",
        "actor_id": actor_id,
        "organization_id": org_id,
        "timestamp_utc": "2026-10-31T12:00:00+00:00",
        "previous_hash": prev_hash,
        "payload": authentic_payload,
    }

    print("  Canonical JSON Bytes Serialized (Strict deterministic ordering, zero whitespace separators):")
    c_bytes = canonical_bytes(event_envelope)
    print(f"  {Colors.DIM}{c_bytes.decode('utf-8')[:100]}...{Colors.RESET}")

    # Step 3: Compute SHA-256 Hash and Sign
    print(f"\n{Colors.BOLD}[STEP 3] Computing Canonical SHA-256 Hash & Ed25519 Digital Signature...{Colors.RESET}")
    authentic_hash = compute_event_hash(prev_hash, event_envelope)
    authentic_sig = sign_hash(priv_key, authentic_hash)

    print(f"  Event Hash (H_0): {Colors.CYAN}{authentic_hash}{Colors.RESET}")
    print(f"  Digital Signature:{Colors.CYAN}{authentic_sig[:32]}...{authentic_sig[-16:]}{Colors.RESET} (64 bytes raw)")

    # Step 4: Verify Authentic Event
    print(f"\n{Colors.BOLD}[STEP 4] Verifying Authentic Signature Against Registered Public Key...{Colors.RESET}")
    is_authentic_valid = verify_signature(pub_hex, authentic_hash, authentic_sig)

    if is_authentic_valid:
        print(f"  >>> {Colors.GREEN}{Colors.BOLD}[VERIFICATION: PASSED]{Colors.RESET} - Signature is 100% mathematically authentic!")
        print("      Originating organization cannot repudiate this medical dispatch.")
    else:
        print(f"  >>> {Colors.RED}[VERIFICATION: FAILED]{Colors.RESET}")
        return False

    # Step 5: Simulate Man-in-the-Middle (MITM) Tampering Attack
    print(f"\n{Colors.BOLD}{Colors.YELLOW}" + "-" * 76)
    print(f"  [ATTACK SIMULATION] Malicious actor intercepts database / transit payload!")
    print(f"  Tampering field '{tamper_key}': {authentic_payload.get(tamper_key)} -> {tamper_val}")
    print("-" * 76 + f"{Colors.RESET}")

    tampered_envelope = copy.deepcopy(event_envelope)
    tampered_envelope["payload"][tamper_key] = tamper_val

    # Re-calculate hash of the altered payload
    tampered_hash = compute_event_hash(prev_hash, tampered_envelope)
    print(f"  Original SHA-256 Hash: {Colors.CYAN}{authentic_hash}{Colors.RESET}")
    print(f"  Tampered SHA-256 Hash: {Colors.RED}{tampered_hash}{Colors.RESET}")
    print("  Notice: Avalanche effect! A single numeric change completely scrambles the hash.")

    # Step 6: Verify Tampered Payload with Original Signature
    print(f"\n{Colors.BOLD}[STEP 6] Evaluating Tampered Payload Against Authentic Signature...{Colors.RESET}")
    is_tampered_valid = verify_signature(pub_hex, tampered_hash, authentic_sig)

    if not is_tampered_valid:
        print(f"  >>> {Colors.RED}{Colors.BOLD}[VERIFICATION: REJECTED]{Colors.RESET} - Signature verification FAILED!")
        print(f"      {Colors.GREEN}Cryptographic Defense Successful:{Colors.RESET} System detected unauthorized modification.")
    else:
        print(f"  >>> {Colors.RED}[CRITICAL FLAW: Tampered signature accepted]{Colors.RESET}")
        return False

    # Step 7: Demonstrate Chain Breakage in Multi-Block Ledger
    print(f"\n{Colors.BOLD}[STEP 7] Demonstrating Downstream Hash-Chain Cascade Rejection...{Colors.RESET}")
    ledger = AuditLedger()

    # Block 0: Dispatch
    ledger.append_event(
        shipment_id="SHP-EMERGENCY-2026-004",
        event_type="DISPATCHED",
        actor_id=actor_id,
        organization_id=org_id,
        payload=authentic_payload,
        private_key=priv_key,
        public_key_hex=pub_hex,
    )

    # Block 1: Sensor Reading
    ledger.append_event(
        shipment_id="SHP-EMERGENCY-2026-004",
        event_type="TELEMETRY_LOGGED",
        actor_id="SENSOR-01",
        organization_id=org_id,
        payload={"temp_c": 4.5, "status": "OPTIMAL"},
        private_key=priv_key,
        public_key_hex=pub_hex,
    )

    # Block 2: Delivery
    ledger.append_event(
        shipment_id="SHP-EMERGENCY-2026-004",
        event_type="DELIVERED",
        actor_id="JLNMCH-RECEIVING-DOCK",
        organization_id="ORG-JLNMCH",
        payload={"received_units": 20},
        private_key=priv_key,
        public_key_hex=pub_hex,
    )

    clean_ok, _ = ledger.verify_chain()
    print(f"  Chain of 3 blocks before tampering: {Colors.GREEN}{'HEALTHY (VALID)' if clean_ok else 'UNHEALTHY'}{Colors.RESET}")

    # Inject tamper into Block 0
    print(f"  {Colors.YELLOW}Injecting unauthorized change into Block 0 payload in memory...{Colors.RESET}")
    ledger.simulate_tampering(record_index=0, payload_key="quantity", tampered_value=tamper_val)

    corrupted_ok, audit_log = ledger.verify_chain()
    print(f"  Chain audit post-tampering:         {Colors.RED}{'HEALTHY' if corrupted_ok else 'REJECTED (TAMPER DETECTED)'}{Colors.RESET}")

    for block in audit_log:
        status_color = Colors.GREEN if block["block_valid"] else Colors.RED
        print(f"    - Block #{block['sequence_index']} ({block['event_type']}): {status_color}{'VALID' if block['block_valid'] else 'INVALID: ' + str(block['discrepancy'])}{Colors.RESET}")

    print("\n" + "=" * 76)
    print(f"{Colors.GREEN}{Colors.BOLD}[PITCH CONCLUSION]{Colors.RESET}")
    print("PharmaShield delivers 100% mathematical non-repudiation and tamper evidence")
    print("without blockchain gas fees, consensus latency, or operational fragility.")
    print("=" * 76 + "\n")

    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="PharmaShield Cryptographic Attack Demo")
    parser.add_argument("--field", default="quantity", help="Payload attribute to tamper with")
    parser.add_argument("--tamper-value", default="200", help="Malicious replacement value")
    args = parser.parse_args()

    # Parse value as int if numeric, else string
    val: Any = args.tamper_value
    try:
        val = int(args.tamper_value)
    except ValueError:
        pass

    success = run_attack_demonstration(tamper_key=args.field, tamper_val=val)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

