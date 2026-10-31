import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Lock, ArrowRight, RefreshCw, Key, FileCheck, Terminal } from 'lucide-react';
import { AuditRecord } from '../types';
import { MOCK_AUDIT_RECORD } from '../mock/data';

// Helper function for deterministic canonical JSON representation (RFC 8785 style)
function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(obj[key])}`);
  return '{' + pairs.join(',') + '}';
}

// Compute SHA-256 hash using native Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const SecurityLab: React.FC = () => {
  const initialAudit: AuditRecord = MOCK_AUDIT_RECORD;

  // Editable simulation states
  const [quantity, setQuantity] = useState<number>(initialAudit.event.payload.quantity);
  const [temperature, setTemperature] = useState<number>(initialAudit.event.payload.temperature_celsius || 3.8);
  const [actionNote, setActionNote] = useState<string>(initialAudit.event.payload.action_note);
  
  // Real-time computed values
  const [computedHash, setComputedHash] = useState<string>(initialAudit.event_hash);
  const [canonicalString, setCanonicalString] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isSimulatingTampering, setIsSimulatingTampering] = useState<boolean>(false);

  // Recalculate canonical hash whenever any payload parameter changes
  useEffect(() => {
    async function evaluateIntegrity() {
      // 1. Construct current payload
      const currentPayload = {
        resource_code: initialAudit.event.payload.resource_code,
        quantity: Number(quantity),
        temperature_celsius: Number(temperature),
        from_facility_id: initialAudit.event.payload.from_facility_id,
        to_facility_id: initialAudit.event.payload.to_facility_id,
        action_note: actionNote,
      };

      // 2. Canonical serialization
      const canonicalPayloadStr = canonicalJson(currentPayload);
      setCanonicalString(canonicalPayloadStr);

      // 3. Compute H_i = SHA-256(previous_hash || canonical_payload)
      const inputToHash = initialAudit.event.previous_hash + canonicalPayloadStr;
      const newHash = await sha256(inputToHash);
      setComputedHash(newHash);

      // 4. Compare with the legitimate original event hash signed by the Ed25519 key
      const matches = newHash.toLowerCase() === initialAudit.event_hash.toLowerCase();
      setIsValid(matches);
    }

    evaluateIntegrity();
  }, [quantity, temperature, actionNote]);

  const handleSimulateTamper = () => {
    setIsSimulatingTampering(true);
    setQuantity(50); // Attacker tries to alter 10 units to 50 units!
  };

  const handleResetToAuthentic = () => {
    setIsSimulatingTampering(false);
    setQuantity(initialAudit.event.payload.quantity);
    setTemperature(initialAudit.event.payload.temperature_celsius || 3.8);
    setActionNote(initialAudit.event.payload.action_note);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
              Securathon Track 2: Cybersecurity (1.2x)
            </span>
            <span className="text-xs text-slate-400 font-mono">Zero Gas Fees / Pure Ed25519</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-slate-100 mt-1 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Security Lab: Interactive Cryptographic Tamper Engine
          </h2>
        </div>

        {/* Action Toggle */}
        <div className="flex items-center gap-2">
          {!isValid ? (
            <button
              onClick={handleResetToAuthentic}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium rounded-lg border border-slate-700 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Authentic Event</span>
            </button>
          ) : (
            <button
              onClick={handleSimulateTamper}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-mono font-semibold rounded-lg border border-rose-500/40 transition-colors shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Inject Adversarial Tamper (10 → 50 Units)</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className="my-5">
        {isValid ? (
          <div className="flex items-center justify-between p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-emerald-300 uppercase tracking-wide">
                  Cryptographic Integrity Verified (Ed25519 Valid)
                </h4>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Canonical SHA-256 payload digest strictly matches the Ed25519 signature registered to Mayaganj Central Depot.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-full border border-emerald-500/30">
              TAMPER PROOF 100%
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-rose-950/60 border border-rose-500/60 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-mono text-rose-300 uppercase tracking-wide flex items-center gap-2">
                  <span>TAMPER DETECTED: Cryptographic Signature Mismatch!</span>
                </h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Malicious mutation in custody payload detected. The computed SHA-256 digest does not match the Ed25519 digital signature!
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-rose-500/30 text-rose-200 text-xs font-mono font-bold rounded-full border border-rose-500/50">
              REJECTED AT INGESTION
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Interactive Tamper Inputs & Hash Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Left Column: Live Editable Custody Event */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              <span>Custody Transfer Payload (Editable Sandbox)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Shipment: {initialAudit.event.shipment_id}
            </span>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Resource Code (Fixed):</label>
              <input
                type="text"
                disabled
                value={initialAudit.event.payload.resource_code}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono opacity-80 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1 flex items-center justify-between">
                  <span>Quantity (Units):</span>
                  <span className="text-[10px] text-cyan-400">Try changing me!</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full rounded px-2.5 py-1.5 font-mono text-slate-100 transition-colors ${
                    quantity !== initialAudit.event.payload.quantity
                      ? 'bg-rose-950/40 border-2 border-rose-500 text-rose-200'
                      : 'bg-slate-900 border border-slate-700 focus:border-cyan-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Ingested Temp (°C):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  className={`w-full rounded px-2.5 py-1.5 font-mono text-slate-100 transition-colors ${
                    temperature !== (initialAudit.event.payload.temperature_celsius || 3.8)
                      ? 'bg-rose-950/40 border-2 border-rose-500 text-rose-200'
                      : 'bg-slate-900 border border-slate-700 focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Custody Action Note:
              </label>
              <input
                type="text"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className={`w-full rounded px-2.5 py-1.5 font-mono text-slate-100 transition-colors ${
                  actionNote !== initialAudit.event.payload.action_note
                    ? 'bg-rose-950/40 border-2 border-rose-500 text-rose-200'
                    : 'bg-slate-900 border border-slate-700 focus:border-cyan-500'
                }`}
              />
            </div>

            <div className="pt-2 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-bold">Previous Hash Link:</span>
              <div className="truncate text-slate-500 font-mono mt-0.5">
                {initialAudit.event.previous_hash}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cryptographic Chain & Hashes */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Cryptographic Digest & Signature Inspection</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Ed25519 + SHA-256</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Expected / Authentic Hash */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Authentic Signed Event Hash ($H_i$):</span>
                  <span className="text-emerald-400 font-bold">Registered in Ledger</span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] text-emerald-400 font-mono break-all select-all">
                  {initialAudit.event_hash}
                </div>
              </div>

              {/* Real-time Computed Hash */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Dynamically Computed SHA-256 Digest:</span>
                  <span className={isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold animate-pulse'}>
                    {isValid ? 'MATCH' : 'MISMATCH DETECTED'}
                  </span>
                </div>
                <div className={`p-2 rounded text-[11px] font-mono break-all select-all transition-colors ${
                  isValid 
                    ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/60 border-2 border-rose-500 text-rose-200'
                }`}>
                  {computedHash}
                </div>
              </div>

              {/* Ed25519 Signature Display */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Ed25519 Digital Signature:</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Key className="w-3 h-3 text-cyan-400" /> 64-byte Edwards-curve
                  </span>
                </div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono truncate select-all">
                  {initialAudit.signature_hex}
                </div>
              </div>

              {/* Public Key */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1">Mayaganj Depot Public Key:</div>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-400 font-mono truncate select-all">
                  {initialAudit.public_key_hex}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Canonical Bytes: {canonicalString.length} bytes</span>
            <span className="text-cyan-400 font-mono">Algorithm: Ed25519 / SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};

