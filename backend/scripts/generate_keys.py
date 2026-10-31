import json
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.services.crypto import generate_keypair

ORGANIZATIONS = [
    {"id": "ORG_JLNMCH", "name": "JLNMCH Hospital Authority"},
    {"id": "ORG_SADAR", "name": "Sadar Hospital Bhagalpur"},
    {"id": "ORG_MAYAGANJ", "name": "Mayaganj Blood Bank Authority"},
    {"id": "ORG_IIIT_BH", "name": "IIIT Bhagalpur Health Clinic"},
    {"id": "ORG_LOGISTICS", "name": "Bihar Rapid Medical Logistics Fleet"}
]

def main():
    keys = {}
    print("=" * 60)
    print("Generating Ed25519 Public/Private Keypairs for Bhagalpur Orgs")
    print("=" * 60)
    for org in ORGANIZATIONS:
        priv_hex, pub_hex = generate_keypair()
        keys[org["id"]] = {
            "name": org["name"],
            "private_key_hex": priv_hex,
            "public_key_hex": pub_hex
        }
        print(f"[*] Org: {org['name']}")
        print(f"    Public Key (Hex):  {pub_hex}")
        print(f"    Private Key (Hex): {priv_hex[:16]}...[PROTECTED]")

    out_file = os.path.join(os.path.dirname(__file__), "demo_keys.json")
    with open(out_file, "w") as f:
        json.dump(keys, f, indent=2)
    print(f"\nKeys successfully saved to {out_file}")

if __name__ == "__main__":
    main()
