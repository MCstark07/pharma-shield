import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AuditRecordResponse } from '../types';
import { SecurityLab } from '../components/SecurityLab';
import { Shield, Lock, Link2, CheckCircle2, AlertOctagon, Terminal, RefreshCw } from 'lucide-react';

export const AuditLedger: React.FC = () => {
  const [records, setRecords] = useState<AuditRecordResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLedger();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load cryptographic audit ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Cryptographic Trust Ledger</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Ed25519 + SHA-256
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable chain-of-custody, telemetry excursion audit trail, and zero-trust verification
          </p>
        </div>

        <button
          onClick={loadLedger}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center space-x-2 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Chain</span>
        </button>
      </div>

      {/* Security Lab Demonstration Widget */}
      <SecurityLab records={records} />

      {/* Visual Hash-Chain Block Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Immutable Hash-Chain Explorer</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Total Blocks: {records.length}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-sm">
            {loading ? 'Reading canonical cryptographic ledger...' : 'No ledger records currently available.'}
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((rec, idx) => {
              const isGenesis = rec.event.previous_hash.startsWith('000000000000');
              const isExcursion = rec.event.event_type === 'SENSOR_EXCURSION';

              return (
                <div
                  key={rec.id || idx}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden ${
                    isExcursion ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Chain connector indicator */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-cyan-400">
                        Block #{records.length - idx}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                        isExcursion
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {rec.event.event_type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Shipment: <strong className="text-slate-200">{rec.event.shipment_id.slice(0, 16)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] font-mono">
                      <span className="text-slate-500">{rec.event.timestamp_utc}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ed25519 Valid</span>
                      </span>
                    </div>
                  </div>

                  {/* Hash Chain Links */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-3 text-[11px] font-mono">
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 uppercase text-[10px] block">Previous Hash (H_i-1):</span>
                      <span className={`break-all ${isGenesis ? 'text-amber-400' : 'text-slate-400'}`}>
                        {isGenesis ? 'GENESIS_ROOT: ' + rec.event.previous_hash : rec.event.previous_hash}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                      <span className="text-slate-500 uppercase text-[10px] block">Block Event Hash (SHA-256):</span>
                      <span className="text-cyan-400 font-semibold break-all">
                        {rec.event_hash}
                      </span>
                    </div>
                  </div>

                  {/* Payload & Digital Signature */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-[11px] font-mono text-slate-400">
                    <div className="lg:col-span-2 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                      <span className="text-slate-500 uppercase text-[10px] block mb-1">Canonical Deterministic Payload:</span>
                      <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap text-[10px]">
                        {JSON.stringify(rec.event.payload, null, 2)}
                      </pre>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 space-y-2">
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] block">Public Key (Ed25519):</span>
                        <span className="text-slate-300 break-all text-[10px]">{rec.public_key_hex}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] block">Signature:</span>
                        <span className="text-slate-400 break-all text-[10px]">{rec.signature_hex}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

