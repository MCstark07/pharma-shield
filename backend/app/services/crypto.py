"""
PharmaShield — Central Cryptographic Engine
Implements Ed25519 digital signatures and SHA-256 canonical hash chaining:
H_i = SHA-256(H_{i-1} || CanonicalPayload_i)
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519


# Canonical Genesis Hash (64 zero hex characters)
GENESIS_HASH: str = "0" * 64


def canonical_bytes(data: dict) -> bytes:
    """Deterministic UTF-8 byte serialization (sorted keys, compact separators)."""
    return json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')


# Aliases
canonical_json_bytes = canonical_bytes


def compute_event_hash(prev_hash: str, event_data: dict) -> str:
    """H_i = SHA-256(H_{i-1} || CanonicalPayload_i)"""
    hasher = hashlib.sha256()
    hasher.update(prev_hash.encode('utf-8'))
    hasher.update(canonical_bytes(event_data))
    return hasher.hexdigest()


# Alias
compute_hash = compute_event_hash


def generate_keypair() -> Tuple[str, str]:
    """Generates an Ed25519 keypair: returns (priv_hex, pub_hex)."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return private_bytes.hex(), public_bytes.hex()


def private_key_from_hex(hex_str: str) -> ed25519.Ed25519PrivateKey:
    """Instantiate Ed25519PrivateKey from raw 32-byte hex string."""
    return ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(hex_str))


def public_key_from_hex(hex_str: str) -> ed25519.Ed25519PublicKey:
    """Instantiate Ed25519PublicKey from raw 32-byte hex string."""
    return ed25519.Ed25519PublicKey.from_public_bytes(bytes.fromhex(hex_str))


def load_private_key(key_input: Union[ed25519.Ed25519PrivateKey, str, bytes]) -> ed25519.Ed25519PrivateKey:
    if isinstance(key_input, ed25519.Ed25519PrivateKey):
        return key_input
    if isinstance(key_input, str):
        key_bytes = bytes.fromhex(key_input)
    elif isinstance(key_input, bytes):
        key_bytes = key_input
    else:
        raise TypeError(f"Unsupported private key format: {type(key_input)}")
    return ed25519.Ed25519PrivateKey.from_private_bytes(key_bytes)


def load_public_key(key_input: Union[ed25519.Ed25519PublicKey, str, bytes]) -> ed25519.Ed25519PublicKey:
    if isinstance(key_input, ed25519.Ed25519PublicKey):
        return key_input
    if isinstance(key_input, str):
        key_bytes = bytes.fromhex(key_input)
    elif isinstance(key_input, bytes):
        key_bytes = key_input
    else:
        raise TypeError(f"Unsupported public key format: {type(key_input)}")
    return ed25519.Ed25519PublicKey.from_public_bytes(key_bytes)


def sign_hash(private_key: Union[ed25519.Ed25519PrivateKey, str, bytes], event_hash: str) -> str:
    priv_key_obj = load_private_key(private_key)
    signature_bytes = priv_key_obj.sign(event_hash.encode('utf-8'))
    return signature_bytes.hex()


# Alias
sign_event_hash = sign_hash


def verify_signature(
    public_key: Union[ed25519.Ed25519PublicKey, str, bytes, None] = None,
    event_hash: str = "",
    signature_hex: str = "",
    public_key_hex: Optional[str] = None,
) -> bool:
    key = public_key if public_key is not None else public_key_hex
    if key is None:
        return False
    try:
        pub_key_obj = load_public_key(key)
        sig_bytes = bytes.fromhex(signature_hex)
        pub_key_obj.verify(sig_bytes, event_hash.encode('utf-8'))
        return True
    except (InvalidSignature, ValueError, TypeError, Exception):
        return False


# Alias
verify_event_signature = verify_signature


class AuditLedger:
    """In-memory append-only cryptographic audit chain."""

    def __init__(self, genesis_hash: str = GENESIS_HASH) -> None:
        self.genesis_hash = genesis_hash
        self.chain: List[Dict[str, Any]] = []

    @property
    def latest_hash(self) -> str:
        if not self.chain:
            return self.genesis_hash
        return self.chain[-1]["event_hash"]

    def append_event(
        self,
        shipment_id: str,
        event_type: str,
        actor_id: str,
        organization_id: str,
        payload: Dict[str, Any],
        private_key: Union[ed25519.Ed25519PrivateKey, str, bytes],
        public_key_hex: str,
        timestamp_utc: Optional[str] = None,
    ) -> Dict[str, Any]:
        if timestamp_utc is None:
            timestamp_utc = datetime.now(timezone.utc).isoformat()

        prev_hash = self.latest_hash
        canonical_event = {
            "shipment_id": shipment_id,
            "event_type": event_type,
            "actor_id": actor_id,
            "organization_id": organization_id,
            "timestamp_utc": timestamp_utc,
            "previous_hash": prev_hash,
            "payload": payload,
        }

        event_hash = compute_event_hash(prev_hash, canonical_event)
        sig_hex = sign_hash(private_key, event_hash)
        is_valid = verify_signature(public_key_hex, event_hash, sig_hex)

        record = {
            "event": canonical_event,
            "event_hash": event_hash,
            "signature_hex": sig_hex,
            "public_key_hex": public_key_hex,
            "is_valid": is_valid,
            "sequence_index": len(self.chain),
        }
        self.chain.append(record)
        return record

    def verify_chain(self) -> Tuple[bool, List[Dict[str, Any]]]:
        if not self.chain:
            return True, []

        audit_log: List[Dict[str, Any]] = []
        is_chain_healthy = True

        for idx, block in enumerate(self.chain):
            event = block["event"]
            prev_hash = event.get("previous_hash", "")
            recorded_hash = block["event_hash"]
            sig_hex = block["signature_hex"]
            pub_hex = block["public_key_hex"]

            expected_prev = self.genesis_hash if idx == 0 else self.chain[idx - 1]["event_hash"]
            chain_linked = (prev_hash == expected_prev)
            recomputed_hash = compute_event_hash(prev_hash, event)
            hash_matches = (recomputed_hash == recorded_hash)
            sig_valid = verify_signature(pub_hex, recorded_hash, sig_hex)

            block_ok = chain_linked and hash_matches and sig_valid
            if not block_ok:
                is_chain_healthy = False

            audit_log.append({
                "sequence_index": idx,
                "shipment_id": event.get("shipment_id"),
                "event_type": event.get("event_type"),
                "chain_linked": chain_linked,
                "hash_matches": hash_matches,
                "signature_valid": sig_valid,
                "block_valid": block_ok,
                "discrepancy": None if block_ok else f"link={chain_linked}, hash={hash_matches}, sig={sig_valid}",
            })

        return is_chain_healthy, audit_log

    def simulate_tampering(self, record_index: int, payload_key: str, tampered_value: Any) -> Dict[str, Any]:
        if record_index < 0 or record_index >= len(self.chain):
            raise IndexError("Index out of range")
        target_block = self.chain[record_index]
        target_block["event"]["payload"][payload_key] = tampered_value
        return {"status": "Tampered", "record_index": record_index, "field": payload_key}

    def get_records(self) -> List[Dict[str, Any]]:
        return list(self.chain)

    def __len__(self) -> int:
        return len(self.chain)
