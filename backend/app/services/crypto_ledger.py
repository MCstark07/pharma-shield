"""
PharmaShield — Central Cryptographic Ledger Service
Binds Ed25519 digital signing, SHA-256 hash chaining, and tamper resistance
to the central real-time tripartite architecture.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple
from cryptography.hazmat.primitives.asymmetric import ed25519

from backend.app.services.crypto import (
    GENESIS_HASH,
    AuditLedger,
    canonical_bytes,
    compute_event_hash,
    generate_keypair,
    load_private_key,
    load_public_key,
    sign_hash,
    verify_signature,
)


class SystemAuthorityKeys:
    """Stores in-memory Ed25519 keypairs for Bhagalpur medical facilities."""

    def __init__(self) -> None:
        # Pre-seed persistent keypairs
        self._priv_keys: Dict[str, ed25519.Ed25519PrivateKey] = {}
        self._pub_hexes: Dict[str, str] = {}

        facilities = [
            "FAC-MAYAGANJ-01",
            "FAC-JLNMCH-01",
            "FAC-SADAR-01",
            "FAC-CLINIC-01",
        ]
        for fac_id in facilities:
            priv_hex, pub_hex = generate_keypair()
            self._priv_keys[fac_id] = load_private_key(priv_hex)
            self._pub_hexes[fac_id] = pub_hex

    def get_public_key(self, facility_id: str) -> str:
        if facility_id not in self._pub_hexes:
            priv_hex, pub_hex = generate_keypair()
            self._priv_keys[facility_id] = load_private_key(priv_hex)
            self._pub_hexes[facility_id] = pub_hex
        return self._pub_hexes[facility_id]

    def get_private_key(self, facility_id: str) -> ed25519.Ed25519PrivateKey:
        if facility_id not in self._priv_keys:
            self.get_public_key(facility_id)
        return self._priv_keys[facility_id]


# Global Authority Registry
authorities = SystemAuthorityKeys()

# Global Ledger Instance
global_ledger = AuditLedger()


def sign_requisition_event(
    facility_id: str,
    requisition_data: Dict[str, Any],
    event_type: str = "REQUISITION_AUTHORIZED",
) -> Dict[str, Any]:
    """
    Cryptographically seals a medical requisition using the facility's Ed25519 private key
    and chains it into the immutable SHA-256 audit ledger.
    """
    priv_key = authorities.get_private_key(facility_id)
    pub_hex = authorities.get_public_key(facility_id)

    record = global_ledger.append_event(
        shipment_id=requisition_data.get("id", "REQ-UNKNOWN"),
        event_type=event_type,
        actor_id=requisition_data.get("authorized_by", "DEPOT-CHIEF"),
        organization_id=facility_id,
        payload=requisition_data,
        private_key=priv_key,
        public_key_hex=pub_hex,
    )
    return record


def verify_event_tampering(
    event_payload: Dict[str, Any],
    expected_hash: str,
    signature_hex: str,
    public_key_hex: str,
) -> Tuple[bool, str]:
    """
    Evaluates whether an event payload has been altered in transit or database.
    """
    c_bytes = canonical_bytes(event_payload)
    recalculated_hash = compute_event_hash(event_payload.get("previous_hash", GENESIS_HASH), event_payload)
    
    hash_match = (recalculated_hash == expected_hash)
    sig_valid = verify_signature(public_key_hex, expected_hash, signature_hex)

    if not hash_match:
        return False, f"Hash Mismatch! Expected {expected_hash[:16]}..., Recalculated {recalculated_hash[:16]}..."
    if not sig_valid:
        return False, "Invalid Signature! Cryptographic assertion failed against authority public key."

    return True, "Valid authentic cryptographic event."
