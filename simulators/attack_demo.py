import requests
import json
import hashlib
from cryptography.hazmat.primitives.asymmetric import ed25519

API_BASE = "http://127.0.0.1:8000/api/v1"

def canonical_json_bytes(data: dict) -> bytes:
    return json.dumps(data, sort_keys=True, separators=(',', ':')).encode('utf-8')

def compute_hash(previous_hash: str, canonical_payload: dict) -> str:
    hasher = hashlib.sha256()
    hasher.update(previous_hash.encode('utf-8'))
    hasher.update(canonical_json_bytes(canonical_payload))
    return hasher.hexdigest()

def verify_sig(public_key_hex: str, event_hash: str, signature_hex: str) -> bool:
    try:
        pub_key = ed25519.Ed25519PublicKey.from_public_bytes(bytes.fromhex(public_key_hex))
        pub_key.verify(bytes.fromhex(signature_hex), event_hash.encode('utf-8'))
        return True
    except Exception:
        return False

def main():
    print("=" * 70)
    print("  PHARMASHIELD CYBERSECURITY LAB: CRYPTOGRAPHIC TAMPER DEMONSTRATION  ")
    print("=" * 70)

    print("\n[Phase 1] Fetching authentic ledger records from PharmaShield backend...")
    try:
        res = requests.get(f"{API_BASE}/security/ledger?limit=1", timeout=5)
        if res.status_code != 200 or not res.json():
            print("[-] Unable to fetch ledger from running API. Falling back to local offline cryptographic test.")
            run_offline_tamper_demo()
            return
        
        record = res.json()[0]
        event = record["event"]
        recorded_hash = record["event_hash"]
        signature = record["signature_hex"]
        pub_key = record["public_key_hex"]

        print(f"[+] Loaded Ledger Event: {event['event_type']} (Shipment: {event['shipment_id']})")
        print(f"    Original Payload:   {json.dumps(event['payload'])}")
        print(f"    Event Hash:         {recorded_hash}")
        print(f"    Authority PubKey:   {pub_key[:24]}...")
        print(f"    Ed25519 Signature:  {signature[:24]}...")

        # Test authentic verification
        is_legit = verify_sig(pub_key, recorded_hash, signature)
        print(f"\n[Phase 2] Verifying authentic signature...")
        print(f"    Result: {'[SUCCESS] Signature Valid! Cryptographic integrity confirmed.' if is_legit else '[FAIL] Signature Invalid.'}")

        # Simulate Attack
        print("\n[Phase 3] SIMULATING MAN-IN-THE-MIDDLE ATTACK...")
        print("    Adversary modifies allocated_quantity from 10 to 500 without private key...")
        
        tampered_payload = dict(event["payload"])
        if "allocated_quantity" in tampered_payload:
            tampered_payload["allocated_quantity"] = 500
        else:
            tampered_payload["tampered"] = True

        tampered_hash = compute_hash(event["previous_hash"], tampered_payload)
        print(f"    Original Hash: {recorded_hash}")
        print(f"    Tampered Hash: {tampered_hash}")

        # Verification under attack
        attack_verified = verify_sig(pub_key, tampered_hash, signature)
        print(f"\n[Phase 4] Verifying signature against tampered payload...")
        if not attack_verified:
            print("    >>> [ALERT - ATTACK REPELLED] Cryptographic signature check FAILED!")
            print("    >>> System instantly caught the data tampering!")
            print("    >>> Reason: The attacker cannot generate a valid Ed25519 signature without the private key.")
        else:
            print("    >>> Security Breach: Tampered payload passed signature check!")

    except requests.exceptions.ConnectionError:
        print("[-] PharmaShield backend is not running on http://127.0.0.1:8000.")
        print("    Running offline cryptographic test instead...")
        run_offline_tamper_demo()

def run_offline_tamper_demo():
    print("\n--- STANDALONE OFFLINE CRYPTOGRAPHIC TEST ---")
    priv = ed25519.Ed25519PrivateKey.generate()
    pub = priv.public_key()
    pub_hex = pub.public_bytes_raw().hex()

    prev_hash = "0" * 64
    payload = {"shipment_id": "DEMO-001", "quantity": 10, "origin": "Mayaganj"}
    legit_hash = compute_hash(prev_hash, payload)
    sig_hex = priv.sign(legit_hash.encode('utf-8')).hex()

    print(f"1. Generated Authentic Payload: {payload}")
    print(f"   Authentic Hash: {legit_hash}")
    print(f"   Signature:      {sig_hex[:24]}...")
    print(f"   Verified:       {verify_sig(pub_hex, legit_hash, sig_hex)}")

    # Attack
    tampered_payload = {"shipment_id": "DEMO-001", "quantity": 500, "origin": "Mayaganj"}
    tampered_hash = compute_hash(prev_hash, tampered_payload)
    print(f"\n2. Adversary Tampered Payload: {tampered_payload}")
    print(f"   Tampered Hash:  {tampered_hash}")
    attack_result = verify_sig(pub_hex, tampered_hash, sig_hex)
    print(f"   Attacker Signature Verification: {attack_result}")
    assert not attack_result, "Cryptographic failure: tampered payload was accepted!"
    print("   >>> SUCCESS: Tamper was mathematically and cryptographically rejected! <<<")

if __name__ == "__main__":
    main()

