import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Fingerprint,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';

export interface MedicalRequisition {
  id: string;
  requesting_facility_id: string;
  supplying_facility_id?: string;
  category: string;
  resource_code: string;
  quantity: number;
  urgency: string;
  clinical_note?: string;
  status: string;
  created_at: string;
  authorized_at?: string;
  authorized_by?: string;
  batch_id?: string;
  event_hash?: string;
  signature_hex?: string;
  public_key_hex?: string;
  previous_hash?: string;
  temperature_celsius?: number;
}

interface RequisitionTableProps {
  requisitions: MedicalRequisition[];
  onAuthorize: (reqId: string) => Promise<void>;
  isLoading?: boolean;
}

export const RequisitionTable: React.FC<RequisitionTableProps> = ({
  requisitions,
  onAuthorize,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedReq, setSelectedReq] = useState<MedicalRequisition | null>(null);
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);

  const filteredReqs = requisitions.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'REQUESTED') return r.status === 'REQUESTED';
    if (filter === 'AUTHORIZED') return r.status === 'AUTHORIZED';
    if (filter === 'ALERT') return r.status === 'TAMPER_REJECTED' || r.status === 'UNDER_REVIEW';
    return true;
  });

  const handleAuthorizeClick = async (req: MedicalRequisition) => {
    try {
      setAuthorizingId(req.id);
      await onAuthorize(req.id);
    } finally {
      setAuthorizingId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
            🚨 CRITICAL
          </span>
        );
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            URGENT
          </span>
        );
      case 'STANDARD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            STANDARD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/50 text-slate-300">
            {urgency}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Clock className="w-3 h-3 animate-spin" />
            <span>PENDING OPS</span>
          </span>
        );
      case 'AUTHORIZED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ED25519 SIGNED</span>
          </span>
        );
      case 'TAMPER_REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>TAMPER REJECTED</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>QUARANTINED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getFacilityName = (facId: string) => {
    if (facId.includes('JLNMCH')) return 'JLNMCH Hospital';
    if (facId.includes('SADAR')) return 'Sadar Hospital';
    if (facId.includes('CLINIC')) return 'IIIT Bhagalpur Clinic';
    if (facId.includes('MAYAGANJ')) return 'Mayaganj Central Depot';
    return facId;
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Table Header & Filter Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Live Medical Requisition Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incoming clinic orders with Ed25519 authorization controls
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({requisitions.length})
          </button>
          <button
            onClick={() => setFilter('REQUESTED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'REQUESTED'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({requisitions.filter((r) => r.status === 'REQUESTED').length})
          </button>
          <button
            onClick={() => setFilter('AUTHORIZED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'AUTHORIZED'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Authorized ({requisitions.filter((r) => r.status === 'AUTHORIZED').length})
          </button>
          <button
            onClick={() => setFilter('ALERT')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'ALERT'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security Alerts ({requisitions.filter((r) => r.status === 'TAMPER_REJECTED' || r.status === 'UNDER_REVIEW').length})
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Requisition ID</th>
              <th className="py-3.5 px-4">Facility</th>
              <th className="py-3.5 px-4">Item & Category</th>
              <th className="py-3.5 px-4 text-center">Units</th>
              <th className="py-3.5 px-4">Urgency</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Cryptographic Hash</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredReqs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No requisitions match the selected filter.
                </td>
              </tr>
            ) : (
              filteredReqs.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedReq(req)}
                >
                  {/* ID & Time */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-bold text-cyan-400">{req.id}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>

                  {/* Requesting Facility */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{getFacilityName(req.requesting_facility_id)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{req.requesting_facility_id}</div>
                  </td>

                  {/* Resource */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{req.resource_code}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{req.category}</div>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-sm font-bold text-slate-100 px-2 py-0.5 bg-slate-800 rounded">
                      {req.quantity}
                    </span>
                  </td>

                  {/* Urgency */}
                  <td className="py-3.5 px-4">{getUrgencyBadge(req.urgency)}</td>

                  {/* Status */}
                  <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>

                  {/* Hash / Ledger Proof */}
                  <td className="py-3.5 px-4">
                    {req.event_hash ? (
                      <div className="flex items-center space-x-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20 max-w-[140px]">
                        <Fingerprint className="w-3 h-3 flex-shrink-0 text-emerald-400" />
                        <span className="truncate">{req.event_hash}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">Awaiting Signature</span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {req.status === 'REQUESTED' ? (
                      <button
                        onClick={() => handleAuthorizeClick(req)}
                        disabled={authorizingId === req.id || isLoading}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {authorizingId === req.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Signing...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Authorize & Sign</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="text-xs text-slate-400 hover:text-cyan-400 font-medium inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-800/60 rounded-md border border-slate-700/50"
                      >
                        <span>Inspect Proof</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cryptographic Proof Modal Inspector */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">Cryptographic Requisition Proof</h3>
                  <p className="text-xs text-slate-400">ID: {selectedReq.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-semibold px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            {/* Requisition Details */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500">Resource Requested:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedReq.resource_code} ({selectedReq.category})</p>
              </div>
              <div>
                <span className="text-slate-500">Authorized Quantity:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedReq.quantity} Units</p>
              </div>
              <div>
                <span className="text-slate-500">Origin / Requester:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{getFacilityName(selectedReq.requesting_facility_id)}</p>
              </div>
              <div>
                <span className="text-slate-500">Supplying Central Depot:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">{selectedReq.supplying_facility_id || 'Pending Allocation'}</p>
              </div>
              {selectedReq.clinical_note && (
                <div className="col-span-2">
                  <span className="text-slate-500">Clinical Protocol / Redacted Note:</span>
                  <p className="text-slate-300 mt-0.5 italic">{selectedReq.clinical_note}</p>
                </div>
              )}
            </div>

            {/* Cryptographic Signatures */}
            {selectedReq.signature_hex ? (
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 text-xs font-mono">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ed25519 Asymmetric Verification: VALID</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Current Block SHA-256 Digest:</span>
                  <p className="text-emerald-300 break-all bg-slate-900 p-2 rounded border border-emerald-500/20 select-all">
                    {selectedReq.event_hash}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Previous Hash (Chained):</span>
                  <p className="text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
                    {selectedReq.previous_hash || '0'.repeat(64)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Ed25519 Signature:</span>
                  <p className="text-cyan-300 break-all bg-slate-900 p-2 rounded border border-cyan-500/20 select-all">
                    {selectedReq.signature_hex}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Authority Public Key (Mayaganj Depot):</span>
                  <p className="text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
                    {selectedReq.public_key_hex}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  This requisition has not yet been cryptographically signed. Authorize it in the queue to commit to the tamper-evident hash ledger.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close Inspector
              </button>
              {selectedReq.status === 'REQUESTED' && (
                <button
                  onClick={() => {
                    handleAuthorizeClick(selectedReq);
                    setSelectedReq(null);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20"
                >
                  Sign & Authorize Requisition
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

