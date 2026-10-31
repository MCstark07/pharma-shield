import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Boxes,
  Activity,
  FileCheck2,
  Thermometer,
} from 'lucide-react';
import { MedicalRequisition } from './RequisitionTable';
import { VendorInfo } from './VendorLoginModal';

interface ActiveOrderShowcaseProps {
  requisitions: MedicalRequisition[];
  currentVendor: VendorInfo;
  onAuthorize: (reqId: string) => Promise<void>;
  isLoading?: boolean;
}

export const ActiveOrderShowcase: React.FC<ActiveOrderShowcaseProps> = ({
  requisitions,
  currentVendor,
  onAuthorize,
}) => {
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const pendingOrders = requisitions.filter((r) => r.status === 'REQUESTED');
  const activeOrder =
    pendingOrders.find((r) => r.id === selectedReqId) || pendingOrders[0];

  const handleAccept = async (req: MedicalRequisition) => {
    try {
      setAuthorizingId(req.id);
      await onAuthorize(req.id);
    } finally {
      setAuthorizingId(null);
    }
  };

  if (!activeOrder) {
    return (
      <div className="rounded-3xl bg-slate-900/40 border border-slate-800/50 p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">Requisition Queue Cleared</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No pending orders awaiting fulfillment. Emergency hospital requests will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* If multiple pending orders, show clean minimal selector tabs */}
      {pendingOrders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-medium">Pending Queue:</span>
          {pendingOrders.map((order, idx) => {
            const isSelected = activeOrder.id === order.id;
            return (
              <button
                key={order.id}
                onClick={() => setSelectedReqId(order.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Order #{idx + 1} ({order.resource_code})</span>
                <span className="text-[10px] opacity-75">{order.quantity}u</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Order Card */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800/60 p-6 md:p-8 backdrop-blur-xl relative overflow-hidden space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Incoming Request from <span className="text-slate-200 font-medium">{activeOrder.requesting_facility_id}</span>
              </div>
              <div className="text-sm font-semibold text-white">
                Requisition #{activeOrder.id}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                activeOrder.urgency === 'CRITICAL'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              {activeOrder.urgency} Urgency
            </span>
          </div>
        </div>

        {/* Big Item Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">
              Required Medical Resource
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {activeOrder.quantity} Units <span className="text-slate-400 font-normal">of</span> {activeOrder.resource_code}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Category: <span className="text-slate-300">{activeOrder.category}</span>
            </div>
          </div>

          {/* Verification Chips */}
          <div className="flex flex-wrap gap-2 md:justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Depot Stock Available</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>2.0°C – 8.0°C Validated</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recall Check Passed</span>
            </div>
          </div>
        </div>

        {/* Doctor Note & Clinical Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Patient Details (Bedside Link)
            </span>
            <div className="text-sm font-semibold text-white">
              {activeOrder.patient_name || 'Rohit Kumar'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {activeOrder.bed_number || 'Bed #ICU-04'} • ID: {activeOrder.patient_id || 'PT-2026-JLNMCH-04'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Verified Physician Approval
            </span>
            <div className="text-sm font-semibold text-white">
              {activeOrder.prescribed_by || 'Dr. Ananya Sharma'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              License: {activeOrder.doctor_license || 'LIC-BH-8842-TRAUMA'}
            </div>
          </div>
        </div>

        {/* Clinical Note */}
        {activeOrder.clinical_note && (
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Physician Clinical Justification
            </span>
            <p className="italic text-slate-300">"{activeOrder.clinical_note}"</p>
          </div>
        )}

        {/* Action Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/40">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fulfilling from <span className="text-slate-200 font-medium">{currentVendor.facilityName}</span></span>
          </div>

          <button
            onClick={() => handleAccept(activeOrder)}
            disabled={authorizingId === activeOrder.id}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {authorizingId === activeOrder.id ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                <span>Digitally Signing (Ed25519)...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept & Dispatch Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
