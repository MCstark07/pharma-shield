import json
import hashlib
from typing import Tuple, List, Optional, Dict, Any
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def canonical_json_bytes(data: dict) -> bytes:
    """Deterministic UTF-8 bytes: sorted keys, no whitespace separators."""
    return json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')

def compute_hash(previous_hash: str, canonical_payload: dict) -> str:
    """H_i = SHA-256(H_{i-1} || CanonicalPayload_i)"""
    hasher = hashlib.sha256()
    hasher.update(previous_hash.encode('utf-8'))
    hasher.update(canonical_json_bytes(canonical_payload))
    return hasher.hexdigest()

def generate_keypair() -> Tuple[str, str]:
    """Generate Ed25519 private and public keys encoded as hex strings."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    )
    return private_bytes.hex(), public_bytes.hex()

def private_key_from_hex(private_key_hex: str) -> ed25519.Ed25519PrivateKey:
    return ed25519.Ed25519PrivateKey.from_private_bytes(bytes.fromhex(private_key_hex))

def sign_event_hash(private_key: ed25519.Ed25519PrivateKey, event_hash: str) -> str:
    """Sign the SHA-256 hex digest using Ed25519."""
    signature = private_key.sign(event_hash.encode('utf-8'))
    return signature.hex()

def verify_event_signature(public_key_hex: str, event_hash: str, signature_hex: str) -> bool:
    """Verify digital signature against the registered public key."""
    try:
        pub_key = ed25519.Ed25519PublicKey.from_public_bytes(bytes.fromhex(public_key_hex))
        pub_key.verify(bytes.fromhex(signature_hex), event_hash.encode('utf-8'))
        return True
    except Exception:
        return False

def verify_ledger_chain(records: List[Dict[str, Any]]) -> Tuple[bool, Optional[str]]:
    """
    Validate the chronological chain of records:
    1. Previous hash matches earlier record's hash (or GENESIS for first)
    2. Recalculated event_hash matches recorded event_hash
    3. Ed25519 signature is cryptographically valid
    """
    expected_prev_hash = GENESIS_HASH
    for idx, rec in enumerate(records):
        prev_hash = rec.get("previous_hash")
        if prev_hash != expected_prev_hash and idx != 0:
            return False, f"Broken chain link at index {idx}: expected {expected_prev_hash}, got {prev_hash}"
        
        computed = compute_hash(prev_hash, rec.get("payload", {}))
        recorded_hash = rec.get("event_hash")
        if computed != recorded_hash:
            return False, f"Hash mismatch at index {idx}: payload modified! Computed {computed} != recorded {recorded_hash}"
            
        pub_key = rec.get("public_key_hex")
        sig = rec.get("signature_hex")
        if not verify_event_signature(pub_key, recorded_hash, sig):
            return False, f"Invalid cryptographic signature at index {idx}"
            
        expected_prev_hash = recorded_hash
        
    return True, None

