import React, { useState } from 'react';
import {
  Building2,
  ArrowRight,
  Boxes,
  Truck,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export interface VendorInfo {
  facilityId: string;
  facilityName: string;
  vendorName: string;
  roleTitle: string;
  publicKeyHex: string;
  depotType: string;
}

interface VendorLoginModalProps {
  onLogin: (vendor: VendorInfo) => void;
}

export const VENDOR_PRESETS: VendorInfo[] = [
  {
    facilityId: 'FAC-MAYAGANJ-01',
    facilityName: 'Mayaganj Central Blood Depot',
    vendorName: 'Dr. R. K. Sinha',
    roleTitle: 'Chief Logistics Officer',
    publicKeyHex: 'PUB-MAYAGANJ-8821',
    depotType: 'Central Blood & Cold-Chain Depot',
  },
  {
    facilityId: 'FAC-SADAR-01',
    facilityName: 'Sadar Hospital Depot',
    vendorName: 'Priya Verma',
    roleTitle: 'District Supply Coordinator',
    publicKeyHex: 'PUB-SADAR-4190',
    depotType: 'District Trauma & Antidote Store',
  },
  {
    facilityId: 'FAC-LOGISTICS-01',
    facilityName: 'Bhagalpur Fleet Carrier',
    vendorName: 'Vikram Anand',
    roleTitle: 'Fleet Telemetry Supervisor',
    publicKeyHex: 'PUB-FLEET-9023',
    depotType: 'Reefer Telemetry Logistics',
  },
];

export const VendorLoginModal: React.FC<VendorLoginModalProps> = ({ onLogin }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [facilityId, setFacilityId] = useState<string>(VENDOR_PRESETS[0].facilityId);
  const [pin, setPin] = useState<string>('••••••••');

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setFacilityId(VENDOR_PRESETS[idx].facilityId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(VENDOR_PRESETS[selectedIdx]);
  };

  const current = VENDOR_PRESETS[selectedIdx];

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Soft ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] bg-teal-500/6 rounded-full blur-[100px] pointer-events-none" />

      {/* Modern Centered Card */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 space-y-7">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Vendor Dispatch Hub
          </h1>
          <p className="text-xs text-slate-400">
            PharmaShield Regional Medical Logistics • Port 5174
          </p>
        </div>

        {/* Minimalist Segment Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-400 px-1">Select Facility:</div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs font-medium">
            {VENDOR_PRESETS.map((v, i) => {
              const active = selectedIdx === i;
              return (
                <button
                  key={v.facilityId}
                  type="button"
                  onClick={() => handleSelect(i)}
                  className={`py-2 px-2 rounded-xl text-center transition-all truncate ${
                    active
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {i === 0 ? 'Mayaganj' : i === 1 ? 'Sadar' : 'Carrier'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Facility Identity Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-200">{current.facilityName}</div>
            <div className="text-[11px] text-slate-400">
              Signer: <span className="text-cyan-400">{current.vendorName}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {current.facilityId}
          </span>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 px-1">Facility ID</label>
            <input
              type="text"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 px-1">Security PIN / Passkey</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>Enter Dispatch Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Bottom subtle note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ed25519 Zero-Trust Signer Ready</span>
        </div>
      </div>
    </div>
  );
};
