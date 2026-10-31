import React, { useState } from 'react';
import {
  Skull,
  ShieldBan,
  ThermometerSnowflake,
  Terminal,
  Zap,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  Fingerprint,
  Radio,
  Dna,
  RefreshCw,
  Flame,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';

interface AttackResponse {
  success: boolean;
  attack_type: string;
  status: string;
  alert_title: string;
  alert_details: string;
  cryptographic_proof: any;
  timestamp_utc: string;
}

interface AttackConsoleProps {
  onAttackTriggered?: (result: AttackResponse) => void;
  availableRequisitions?: Array<{ id: string; resource_code: string; quantity: number }>;
}

export const AttackConsole: React.FC<AttackConsoleProps> = ({
  onAttackTriggered,
  availableRequisitions = [],
}) => {
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [tamperedQty, setTamperedQty] = useState<number>(500);
  const [excursionTemp, setExcursionTemp] = useState<number>(14.8);
  const [activeVector, setActiveVector] = useState<string | null>(null);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [attackLog, setAttackLog] = useState<AttackResponse | null>(null);

  const runAttack = async (attackType: string) => {
    setActiveVector(attackType);
    setIsAttacking(true);
    try {
      const payload: any = {
        attack_type: attackType,
        requisition_id: selectedReqId || undefined,
      };

      if (attackType === 'QUANTITY_TAMPER') {
        payload.tampered_quantity = Number(tamperedQty);
      } else if (attackType === 'TEMPERATURE_BREACH') {
        payload.excursion_temperature_celsius = Number(excursionTemp);
      }

      const res = await fetch('/api/v1/attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Exploit Trigger Failed: ${err.detail || 'Server error'}`);
        return;
      }

      const data: AttackResponse = await res.json();
      setAttackLog(data);

      if (onAttackTriggered) {
        onAttackTriggered(data);
      }
    } catch (err) {
      console.error('Attack execution failed:', err);
      alert('Network error executing attack simulation.');
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/30 text-rose-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center space-x-2">
                <span>Adversarial Cyber Exploit Arena</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  LIVE TESTBED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Trigger real-time adversarial mutations & test instantaneous multi-portal zero-trust defense
              </p>
            </div>
          </div>
        </div>

        {/* Target Requisition Selector */}
        {availableRequisitions.length > 0 && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Target Requisition:</span>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl font-mono text-xs focus:border-rose-500 focus:outline-none"
            >
              <option value="">Auto-Target Active Order</option>
              {availableRequisitions.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.id} ({req.resource_code} × {req.quantity})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5 Animated Exploit Trigger Buttons & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Vector 1: MITM Quantity Tamper */}
        <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                VECTOR 01
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <Skull className="w-4 h-4 text-rose-400" />
                <span>MITM Quantity Inflation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Intercepts payload in-transit and mutates requested units from 10 to 500. Triggers SHA-256 avalanche divergence and signature failure.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Tampered Quantity</span>
                <span className="font-mono text-rose-400 font-bold">{tamperedQty} Units</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={tamperedQty}
                onChange={(e) => setTamperedQty(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          </div>

          <button
            onClick={() => runAttack('QUANTITY_TAMPER')}
            disabled={isAttacking}
            className="mt-4 relative group/btn overflow-hidden rounded-xl p-[1px] font-bold text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-xl group-hover/btn:opacity-100 opacity-80 blur-sm transition-opacity animate-pulse" />
            <span className="relative flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-rose-300 font-extrabold border border-rose-500/40 transition-colors">
              <Zap className="w-3.5 h-3.5 text-rose-400 group-hover/btn:rotate-12 transition-transform" />
              <span>Simulate Quantity Attack</span>
            </span>
          </button>
        </div>

        {/* Vector 2: Ed25519 Signature Forgery */}
        <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                VECTOR 02
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <ShieldBan className="w-4 h-4 text-amber-400" />
                <span>Ed25519 Signature Forgery</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Adversary attaches a fabricated 64-byte signature without possessing the Mayaganj Central Depot private key.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-amber-300/80 truncate">
              Injected Sig: 0xdeadbeefdeadbeef...
            </div>
          </div>

          <button
            onClick={() => runAttack('SIGNATURE_FORGERY')}
            disabled={isAttacking}
            className="mt-4 relative group/btn overflow-hidden rounded-xl p-[1px] font-bold text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-xl group-hover/btn:opacity-100 opacity-80 blur-sm transition-opacity" />
            <span className="relative flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold border border-amber-500/40 transition-colors">
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover/btn:rotate-12 transition-transform" />
              <span>Inject Forged Signature</span>
            </span>
          </button>
        </div>

        {/* Vector 3: Cold-Chain Thermal Excursion */}
        <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/20">
                VECTOR 03
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
                <span>Cold-Chain Thermal Excursion</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Triggers hardware IoT sensor spike breaching 2.0°C–8.0°C safe range. Locks shipment into UNDER_REVIEW quarantine.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Spike Temperature</span>
                <span className="font-mono text-cyan-400 font-bold">{excursionTemp}°C</span>
              </div>
              <input
                type="range"
                min="9.0"
                max="25.0"
                step="0.5"
                value={excursionTemp}
                onChange={(e) => setExcursionTemp(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          <button
            onClick={() => runAttack('TEMPERATURE_BREACH')}
            disabled={isAttacking}
            className="mt-4 relative group/btn overflow-hidden rounded-xl p-[1px] font-bold text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 rounded-xl group-hover/btn:opacity-100 opacity-80 blur-sm transition-opacity" />
            <span className="relative flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-cyan-300 font-extrabold border border-cyan-500/40 transition-colors">
              <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:rotate-12 transition-transform" />
              <span>Trigger Thermal Breach</span>
            </span>
          </button>
        </div>

        {/* Vector 4: ABO Blood Type Incompatibility */}
        <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-rose-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20">
                VECTOR 04
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <Dna className="w-4 h-4 text-rose-400" />
                <span>ABO Blood Incompatibility</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Attempts to allocate B+ blood to an O+ emergency patient. Hard clinical filter halts dispatch instantly.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] flex justify-between">
              <span className="text-slate-400">Donor: <strong className="text-rose-400">B+</strong></span>
              <span className="text-slate-400">Recipient: <strong className="text-cyan-400">O+</strong></span>
            </div>
          </div>

          <button
            onClick={() => runAttack('BLOOD_INCOMPATIBILITY')}
            disabled={isAttacking}
            className="mt-4 relative group/btn overflow-hidden rounded-xl p-[1px] font-bold text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-600 to-amber-600 rounded-xl group-hover/btn:opacity-100 opacity-80 blur-sm transition-opacity" />
            <span className="relative flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-rose-300 font-extrabold border border-rose-500/40 transition-colors">
              <Zap className="w-3.5 h-3.5 text-rose-400 group-hover/btn:rotate-12 transition-transform" />
              <span>Inject Incompatible Blood</span>
            </span>
          </button>
        </div>

        {/* Vector 5: Replay of Expired Batch */}
        <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/80 p-5 flex flex-col justify-between hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
                VECTOR 05
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-1.5">
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>Expired Batch Replay</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Attempts to re-issue an expired or recalled batch into active medical rotation. Prevented by nonce tracking.
              </p>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-purple-300 truncate">
              Target: BATCH-2024-RECALLED
            </div>
          </div>

          <button
            onClick={() => runAttack('REPLAY_EXPIRED_BATCH')}
            disabled={isAttacking}
            className="mt-4 relative group/btn overflow-hidden rounded-xl p-[1px] font-bold text-xs active:scale-95 transition-transform disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 rounded-xl group-hover/btn:opacity-100 opacity-80 blur-sm transition-opacity" />
            <span className="relative flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-purple-300 font-extrabold border border-purple-500/40 transition-colors">
              <Zap className="w-3.5 h-3.5 text-purple-400 group-hover/btn:rotate-12 transition-transform" />
              <span>Simulate Replay Attack</span>
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ATTACK RESULT & PROOF BREAKDOWN (SUCCESS VS FAILURE IN 5175)
          ========================================================================= */}
      {attackLog && (
        <div className="rounded-2xl border-2 border-rose-500/60 bg-gradient-to-b from-slate-950 to-rose-950/20 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Top Banner: Dual Perspective (Attacker vs Zero-Trust Defender) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <AlertOctagon className="w-7 h-7" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase block">
                  ADVERSARIAL ATTACK INTERCEPTED & DEFLECTED
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {attackLog.alert_title}
                </h3>
              </div>
            </div>

            {/* Success vs Failure Pills */}
            <div className="flex items-center space-x-2 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>ATTACK RESULT: <strong className="text-white">FAILED (BLOCKED)</strong></span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DEFENSE RESULT: <strong className="text-white">100% SUCCESS</strong></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {attackLog.alert_details}
          </p>

          {/* Cryptographic Diff Comparison Card */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 font-sans text-xs border-b border-slate-800/80 pb-2">
              <span className="flex items-center space-x-1.5 font-bold text-slate-200">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Cryptographic Assertion & Avalanche Diff</span>
              </span>
              <span className="text-[10px] text-slate-500">RFC 8032 Ed25519 + SHA-256</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              {attackLog.cryptographic_proof.original_hash && (
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block font-sans">
                    Expected SHA-256 Digest (Canonical Ledger):
                  </span>
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 break-all select-all font-mono">
                    {attackLog.cryptographic_proof.original_hash}
                  </div>
                </div>
              )}

              {attackLog.cryptographic_proof.tampered_hash && (
                <div className="space-y-1">
                  <span className="text-rose-400 text-[10px] block font-sans font-bold">
                    Altered SHA-256 Digest (Avalanche Divergence):
                  </span>
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 break-all select-all font-mono">
                    {attackLog.cryptographic_proof.tampered_hash}
                  </div>
                </div>
              )}
            </div>

            {/* Proof Status Ticker */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-sans">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Zero-Trust Decision:</span>
                <span className="font-bold font-mono text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                  REJECTED_UNDER_ZERO_TRUST
                </span>
              </div>
              <div className="flex items-center space-x-2 text-cyan-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Broadcasted `SECURITY_ALERT` to Doctors (:5173) & Pharma Ops (:5174)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
