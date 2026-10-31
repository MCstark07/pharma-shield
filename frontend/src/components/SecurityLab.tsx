import React, { useState } from 'react';
import { AuditRecordResponse, TamperSimulationResponse } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, Lock, Terminal, Play, Check, X } from 'lucide-react';
import { api } from '../services/api';

interface SecurityLabProps {
  records: AuditRecordResponse[];
}

export const SecurityLab: React.FC<SecurityLabProps> = ({ records }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(records[0]?.id || '');
  const [fieldToModify, setFieldToModify] = useState<string>('allocated_quantity');
  const [tamperedValue, setTamperedValue] = useState<string>('999');
  const [loading, setLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<TamperSimulationResponse | null>(null);

  const activeRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const handleSimulate = async () => {
    if (!activeRecord || !activeRecord.id) return;
    setLoading(true);
    try {
      const parsedVal = isNaN(Number(tamperedValue)) ? tamperedValue : Number(tamperedValue);
      const res = await api.simulateTampering(activeRecord.id, fieldToModify, parsedVal);
      setSimulationResult(res);
    } catch (err) {
      console.error('Tampering simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Cryptographic Tampering Simulation Lab</h3>
            <p className="text-xs text-slate-400 font-mono">Ed25519 & SHA-256 Tamper-Evidence Verification Testbed</p>
          </div>
        </div>

        <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-mono text-cyan-400 flex items-center space-x-1.5 self-start">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zero-Knowledge Proof Guard</span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-8 text-slate-500 font-mono text-sm">
          No audit ledger records available to test.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Target Ledger Block to Attack
              </label>
              <select
                value={selectedRecordId}
                onChange={(e) => {
                  setSelectedRecordId(e.target.value);
                  setSimulationResult(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {records.map((r, idx) => (
                  <option key={r.id || idx} value={r.id || idx}>
                    Block #{records.length - idx} — {r.event.event_type} ({r.event_hash.slice(0, 16)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Field to Modify
                </label>
                <input
                  type="text"
                  value={fieldToModify}
                  onChange={(e) => setFieldToModify(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                  placeholder="field name..."
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Malicious Value
                </label>
                <input
                  type="text"
                  value={tamperedValue}
                  onChange={(e) => setTamperedValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                  placeholder="malicious value..."
                />
              </div>
            </div>

            {activeRecord && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-500 uppercase text-[10px]">Current Canonical Payload:</div>
                <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(activeRecord.event.payload, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? 'Executing Attack Simulation...' : 'Simulate Malicious Payload Tampering'}</span>
            </button>
          </div>

          {/* Real-time Tamper Output */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Cryptographic Verifier Terminal</span>
                </span>
                {simulationResult ? (
                  simulationResult.tamper_detected ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                      TAMPERING CAUGHT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                      VERIFIED AUTHENTIC
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 text-[10px]">IDLE</span>
                )}
              </div>

              {simulationResult ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ORIGINAL LEDGER HASH (SHA-256):</span>
                    <span className="text-emerald-400 break-all">{simulationResult.original_hash}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px]">TAMPERED RECOMPUTED HASH:</span>
                    <span className="text-rose-400 break-all">{simulationResult.tampered_hash}</span>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-slate-400">Hash Match:</div>
                      <div className={`font-bold flex items-center space-x-1 ${simulationResult.hashes_match ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simulationResult.hashes_match ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{simulationResult.hashes_match ? 'MATCHED' : 'DIVERGED'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-slate-400">Ed25519 Signature:</div>
                      <div className={`font-bold flex items-center space-x-1 ${simulationResult.signature_verified ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {simulationResult.signature_verified ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        <span>{simulationResult.signature_verified ? 'VALID' : 'REJECTED (FAIL)'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg text-rose-200 text-xs">
                    {simulationResult.diagnostic_message}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Select a ledger block and run a tamper simulation to view mathematical verification rejection in real time.
                </div>
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              Protection: RFC 8032 Ed25519 Curve25519 asymmetric cryptography.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

