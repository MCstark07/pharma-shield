import React, { useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Clock,
  Heart,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Lock,
  PhoneCall,
  UserCheck,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { ThreeBioVial } from './ThreeBioVial';

interface PatientViewProps {
  activeRequisition: any;
  userInfo: { name: string; title: string; facility: string };
  onLogout: () => void;
}

export const PatientView: React.FC<PatientViewProps> = ({
  activeRequisition,
  userInfo,
  onLogout,
}) => {
  const [assistanceRequested, setAssistanceRequested] = useState<boolean>(false);

  const handleCallNurse = () => {
    setAssistanceRequested(true);
    setTimeout(() => {
      setAssistanceRequested(false);
    }, 6000);
  };

  const isQuarantined =
    activeRequisition?.status === 'TAMPER_REJECTED' ||
    activeRequisition?.status === 'UNDER_REVIEW';

  const isAuthorized = activeRequisition?.status === 'AUTHORIZED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full animate-in fade-in duration-200">
      {/* Patient Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl">
            RK
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">{userInfo.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                ACTIVE PATIENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {userInfo.title} • {userInfo.facility}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-300">
              <span className="flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Blood Group: <strong className="text-rose-300 font-mono">O Positive (O+)</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Attending: <strong>Dr. Ananya Sharma</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Assistance Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCallNurse}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
              assistanceRequested
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{assistanceRequested ? 'Nurse Station Alerted!' : 'Call ICU Nurse'}</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
          >
            Switch Role / Exit
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Twin + Cold-Chain & Authenticity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Digital Twin of Patient's Medication (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <ThreeBioVial
            status={activeRequisition?.status || 'REQUESTED'}
            resourceCode={activeRequisition?.resource_code || 'O_POS_RBC'}
          />

          {/* Quick Cold Chain Sensor Reading */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Cold-Chain Telemetry:</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {activeRequisition?.temperature_celsius ?? 4.2}°C
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isQuarantined ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: '42%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2.0°C Min Safe</span>
              <span className="text-emerald-400 font-bold">Optimal Range</span>
              <span>8.0°C Max Safe</span>
            </div>
          </div>
        </div>

        {/* Right Column: Requisition Delivery Details & Cryptographic Assurance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Unit Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Assigned Emergency Medical Requisition
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  {activeRequisition?.resource_code === 'O_POS_RBC'
                    ? 'Packed Red Blood Cells (O Positive)'
                    : activeRequisition?.resource_code || 'O_POS_RBC'}
                </h3>
              </div>

              {isAuthorized ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>CRYPTOGRAPHICALLY SEALED</span>
                </span>
              ) : isQuarantined ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>UNDER INVESTIGATION</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>AWAITING DEPOT DISPATCH</span>
                </span>
              )}
            </div>

            {/* Requisition Meta Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Requisition ID</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">{activeRequisition?.id}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Prescribed Dosage</span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                  {activeRequisition?.quantity ?? 10} Units (Emergency Protocol)
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Source Depot</span>
                <span className="font-semibold text-emerald-400 mt-0.5 block">
                  Mayaganj Blood Bank & Central Depot
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Destination</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">JLNMCH Emergency ICU</span>
              </div>
            </div>

            {/* Cryptographic Trust Guarantee */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-Counterfeit Patient Protection Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This unit is cryptographically signed using an asymmetric <strong>Ed25519 digital signature</strong> issued by the certified government blood authority. The physical cold-chain container cannot be altered or swapped without mathematical detection.
              </p>
              {activeRequisition?.signature_hex && (
                <div className="font-mono text-[10px] text-slate-500 break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold">DIGITAL SIGNATURE: </span>
                  {activeRequisition.signature_hex}
                </div>
              )}
            </div>

            {/* Safe Delivery Progress Steps */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 block">Supply Delivery Journey</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 text-emerald-300">
                  <span className="block font-bold">Step 1</span>
                  <span className="text-slate-400">ICU Ordered</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 text-emerald-300">
                  <span className="block font-bold">Step 2</span>
                  <span className="text-slate-400">Ed25519 Signed</span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border font-bold ${
                    isAuthorized
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="block">Step 3</span>
                  <span className="text-slate-400">In Transit (4.2°C)</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-500">
                  <span className="block font-bold">Step 4</span>
                  <span>Bedside Infusion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

