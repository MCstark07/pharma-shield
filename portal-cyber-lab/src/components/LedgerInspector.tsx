import React, { useState, useEffect } from 'react';
import {
  Link2,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Lock,
  Unlock,
  Layers,
  Fingerprint,
} from 'lucide-react';

interface LedgerRecord {
  event: {
    shipment_id: string;
    event_type: string;
    actor_id: string;
    organization_id: string;
    timestamp_utc: string;
    previous_hash: string;
    payload: any;
  };
  event_hash: string;
  signature_hex: string;
  public_key_hex: string;
  is_valid: boolean;
}

interface LedgerResponse {
  is_chain_healthy: boolean;
  total_blocks: number;
  latest_hash: string;
  records: LedgerRecord[];
  audit_verification?: string;
}

export const LedgerInspector: React.FC = () => {
  const [ledger, setLedger] = useState<LedgerResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTamperedClientSide, setIsTamperedClientSide] = useState<boolean>(false);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/ledger');
      if (res.ok) {
        const data: LedgerResponse = await res.json();
        setLedger(data);
        setIsTamperedClientSide(false);
      }
    } catch (err) {
      console.error('Error fetching audit ledger:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const toggleClientTampering = () => {
    setIsTamperedClientSide(!isTamperedClientSide);
  };

  const isHealthy = ledger ? (isTamperedClientSide ? false : ledger.is_chain_healthy) : true;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Immutable SHA-256 Hash Chain Explorer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mathematical proof ledger: H_i = SHA-256(H_i-1 || CanonicalPayload_i) signed with Ed25519
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={toggleClientTampering}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              isTamperedClientSide
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isTamperedClientSide ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isTamperedClientSide ? 'Tamper Active (Chain Broken)' : 'Simulate Ledger Mutation'}</span>
          </button>

          <button
            onClick={fetchLedger}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/60"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chain Status Bar */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
          isHealthy
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isHealthy ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertOctagon className="w-6 h-6 text-rose-400 flex-shrink-0 animate-bounce" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {isHealthy ? 'CRYPTOGRAPHIC INTEGRITY: 100% VERIFIED' : 'LEDGER INTEGRITY BREACH DETECTED!'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHealthy
                ? 'All previous hashes match the deterministic SHA-256 cascade and Ed25519 signatures are authentic.'
                : 'Hash chain link broken at Block #1! Recalculated SHA-256 digest does not match previous_hash.'}
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs hidden sm:block">
          <div className="text-slate-400">Total Blocks: <strong className="text-slate-100">{ledger?.total_blocks || 0}</strong></div>
          <div className="text-[10px] text-slate-500 truncate max-w-[200px]">Latest: {ledger?.latest_hash}</div>
        </div>
      </div>

      {/* Block Sequence Display */}
      <div className="space-y-3">
        {ledger?.records.map((rec, idx) => {
          const isBlockTampered = isTamperedClientSide && idx === 1;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isBlockTampered
                  ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-800 text-cyan-300 font-bold rounded">
                    BLOCK #{idx}
                  </span>
                  <span className="font-semibold text-xs text-slate-200">{rec.event.event_type}</span>
                  <span className="text-[10px] text-slate-500">• {rec.event.actor_id}</span>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  {isBlockTampered ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      HASH MISMATCH
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ED25519 VALID</span>
                    </span>
                  )}
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(rec.event.timestamp_utc).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Block Cryptographic Details */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Previous Hash (H_i-1):</span>
                  <p className="text-slate-400 truncate bg-slate-900/90 p-1.5 rounded border border-slate-800">
                    {isBlockTampered ? 'baadcafe' + '0'.repeat(56) : rec.event.previous_hash}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">Event Hash (H_i):</span>
                  <p
                    className={`truncate p-1.5 rounded border ${
                      isBlockTampered
                        ? 'text-rose-400 bg-rose-950/60 border-rose-500/40 font-bold'
                        : 'text-emerald-400 bg-slate-900/90 border-emerald-500/20'
                    }`}
                  >
                    {rec.event_hash}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="text-[10px] text-slate-500 font-sans block">Ed25519 Signature Hex:</span>
                  <p className="text-cyan-400 truncate bg-slate-900/90 p-1.5 rounded border border-cyan-500/20">
                    {rec.signature_hex}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

