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
  UserCheck,
  Send,
  Boxes,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ThreeBioVial } from './ThreeBioVial';

interface PatientViewProps {
  activeRequisition: any;
  userInfo: { name: string; title: string; facility: string };
  onLogout: () => void;
  onRequestPrescription: (resourceCode: string, qty: number, note: string) => Promise<void>;
}

export const PatientView: React.FC<PatientViewProps> = ({
  activeRequisition,
  userInfo,
  onLogout,
  onRequestPrescription,
}) => {
  const [assistanceRequested, setAssistanceRequested] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [selectedSupply, setSelectedSupply] = useState<string>('O_POS_RBC');
  const [selectedQty, setSelectedQty] = useState<number>(10);
  const [customNote, setCustomNote] = useState<string>('Critical post-trauma ICU protocol');

  const handleCallNurse = () => {
    setAssistanceRequested(true);
    setTimeout(() => {
      setAssistanceRequested(false);
    }, 6000);
  };

  const handleCreateRequest = async () => {
    setIsRequesting(true);
    try {
      await onRequestPrescription(selectedSupply, selectedQty, customNote);
    } finally {
      setIsRequesting(false);
    }
  };

  const isPendingDoctor = activeRequisition?.status === 'PRESCRIPTION_PENDING';
  const isRequestedDoctor = activeRequisition?.status === 'REQUESTED';
  const isAuthorized = activeRequisition?.status === 'AUTHORIZED';
  const isQuarantined =
    activeRequisition?.status === 'TAMPER_REJECTED' ||
    activeRequisition?.status === 'UNDER_REVIEW';

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
                BED #ICU-04
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Patient ID: PT-2026-JLNMCH-04 • {userInfo.facility}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-300">
              <span className="flex items-center space-x-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Blood Group: <strong className="text-rose-300 font-mono">O Positive (O+)</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Attending: <strong>Dr. Ananya Sharma (ICU Chief)</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCallNurse}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
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
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            Switch Role
          </button>
        </div>
      </div>

      {/* Step 1: Patient Prescription Submission Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                Patient Self-Requisition Console
              </span>
              <h3 className="text-base font-bold text-white">
                Request Doctor Prescription & Emergency Supply
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Direct Link to Dr. Ananya Sharma
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setSelectedSupply('O_POS_RBC');
              setSelectedQty(10);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedSupply === 'O_POS_RBC'
                ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-rose-400" />
              <span>O+ RBC Transfusion</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">10 Units • Universal Packed RBCs</div>
          </button>

          <button
            onClick={() => {
              setSelectedSupply('INSULIN_GLARGINE');
              setSelectedQty(5);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedSupply === 'INSULIN_GLARGINE'
                ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span>Insulin Glargine</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">5 Units • 2.0°C Cold Chain</div>
          </button>

          <button
            onClick={() => {
              setSelectedSupply('TRAUMA_KIT');
              setSelectedQty(2);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedSupply === 'TRAUMA_KIT'
                ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Trauma Kit</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">2 Units • Surgical Stabilization</div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            Selected: <strong className="text-cyan-300 font-mono">{selectedQty} Units of {selectedSupply}</strong>
          </div>
          <button
            onClick={handleCreateRequest}
            disabled={isRequesting}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isRequesting ? 'Submitting to Doctor...' : 'Submit Prescription Request to Dr. Ananya'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Twin & Lifecycle Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Digital Twin */}
        <div className="lg:col-span-5 space-y-4">
          <ThreeBioVial
            status={activeRequisition?.status || 'REQUESTED'}
            resourceCode={activeRequisition?.resource_code || 'O_POS_RBC'}
          />

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
              <span>2.0°C Min</span>
              <span className="text-emerald-400 font-bold">Safe Zone</span>
              <span>8.0°C Max</span>
            </div>
          </div>
        </div>

        {/* Right Column: Requisition Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            {/* Status Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Active Prescription Requisition
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  {activeRequisition?.resource_code === 'O_POS_RBC'
                    ? 'Packed Red Blood Cells (O Positive)'
                    : activeRequisition?.resource_code || 'O_POS_RBC'}
                </h3>
              </div>

              {isPendingDoctor ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>STEP 1: AWAITING DOCTOR APPROVAL</span>
                </span>
              ) : isRequestedDoctor ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>STEP 2: AWAITING VENDOR DISPATCH</span>
                </span>
              ) : isAuthorized ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>STEP 3: DISPATCHED & SEALED</span>
                </span>
              ) : isQuarantined ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>QUARANTINED (TAMPER DEFLECTED)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span>STATUS: {activeRequisition?.status}</span>
                </span>
              )}
            </div>

            {/* Lifecycle Progress Bar */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                Full-Circle Supply Chain Sequence:
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 text-emerald-300">
                  <span className="block font-bold">Step 1</span>
                  <span className="text-slate-300">Patient Request</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border font-bold transition-all ${
                    isRequestedDoctor || isAuthorized
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : isPendingDoctor
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="block">Step 2</span>
                  <span>Doctor License</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border font-bold transition-all ${
                    isAuthorized
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                      : isRequestedDoctor
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="block">Step 3</span>
                  <span>Vendor Dispatch</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border font-bold transition-all ${
                    isAuthorized
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="block">Step 4</span>
                  <span>Bedside Delivery</span>
                </div>
              </div>
            </div>

            {/* Live Status Message Callout */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 leading-relaxed">
              {isPendingDoctor ? (
                <div className="text-amber-300 font-medium">
                  ⏳ <strong>Patient Request Active:</strong> Your prescription request for {activeRequisition?.quantity} Units of {activeRequisition?.resource_code} has been submitted. Log in as Doctor (Dr. Ananya Sharma) to clinically approve and sign it.
                </div>
              ) : isRequestedDoctor ? (
                <div className="text-cyan-300 font-medium">
                  ✓ <strong>Prescription Signed by Dr. Ananya Sharma!</strong> Requisition #{activeRequisition?.id} transmitted to Mayaganj Central Blood Depot. Log in as Vendor on Port 5174 to authorize & dispatch.
                </div>
              ) : isAuthorized ? (
                <div className="text-emerald-300 font-medium">
                  🎉 <strong>Order Authorized & Dispatched by Mayaganj Central Depot!</strong> Certified Ed25519 digital signature verified. Temperature locked at 4.2°C. Courier en route to Bed #ICU-04.
                </div>
              ) : (
                <div className="text-slate-300">
                  Requisition #{activeRequisition?.id} ({activeRequisition?.status})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
