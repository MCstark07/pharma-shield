import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
  Truck,
} from 'lucide-react';

interface AIRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export const AIRebalanceModal: React.FC<AIRebalanceModalProps> = ({
  isOpen,
  onClose,
  onActionComplete,
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [approvedList, setApprovedList] = useState<string[]>([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/ai/rebalance');
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Failed to fetch rebalance recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const handleApproveRebalance = async (rec: any) => {
    setExecutingId(rec.recommendation_id);
    try {
      // 1. Create emergency transfer requisition
      const reqRes = await fetch('/api/v1/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesting_facility_id: rec.target_facility_id,
          category: rec.resource_code.includes('RBC') ? 'BLOOD_COMPONENTS' : 'MEDICINES',
          resource_code: rec.resource_code,
          quantity: rec.recommended_transfer_quantity,
          urgency: 'CRITICAL',
          clinical_note: `Proactive AI Rebalance: ${rec.clinical_justification}`,
        }),
      });

      if (reqRes.ok) {
        const newReq = await reqRes.json();
        // 2. Authorize immediately via Ed25519 signature
        await fetch(`/api/v1/requisitions/${newReq.id}/authorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplying_facility_id: rec.source_facility_id,
            authorized_by: 'AI Crisis Coordinator (Automated Proactive Protocol)',
            batch_id: `REBAL-${rec.resource_code}`,
          }),
        });

        setApprovedList((prev) => [...prev, rec.recommendation_id]);
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error('Rebalance execution failed:', err);
    } finally {
      setExecutingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  AI Proactive Stockout Prevention & Resource Rebalancing
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                  LOGISTICS DISPATCH
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically identifies emerging stockouts (DOS &le; 2.5d) and pairs with surplus depots.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-mono text-sm animate-pulse">
              Evaluating network-wide Days of Stock (DOS) & consumption velocity...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-mono text-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold">Network Operating Envelope Healthy</p>
              <p className="text-xs mt-1 text-slate-500">
                All facilities maintain Days of Stock (DOS) &gt; 2.5 days. No emergency transfer required.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const isApproved = approvedList.includes(rec.recommendation_id);
                const isBusy = executingId === rec.recommendation_id;
                return (
                  <div
                    key={rec.recommendation_id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          {rec.priority} EMERGENCY
                        </span>
                        <span className="font-bold text-base text-white">{rec.resource_name}</span>
                        <span className="text-xs text-slate-400 font-mono">({rec.resource_code})</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Transit: ~{rec.estimated_transit_minutes} mins ({rec.distance_km} km)</span>
                      </div>
                    </div>

                    {/* Source -> Target Visual Nodes */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                      {/* Target (Shortage) */}
                      <div className="md:col-span-3 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block font-bold">
                          Critical Recipient (Shortage)
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{rec.target_facility_name}</h4>
                        <div className="flex items-center space-x-3 mt-2 text-xs font-mono">
                          <span className="text-rose-300 font-bold">Stock: {rec.target_units_available} units</span>
                          <span className="text-rose-400/90 font-bold">DOS: {rec.target_dos_days}d (&lt; 2d)</span>
                        </div>
                      </div>

                      {/* Direction Arrow */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-mono font-bold text-purple-300">
                          +{rec.recommended_transfer_quantity} UNITS
                        </span>
                        <ArrowRight className="w-6 h-6 text-purple-400 my-1 hidden md:block" />
                        <Truck className="w-4 h-4 text-purple-300" />
                      </div>

                      {/* Source (Surplus) */}
                      <div className="md:col-span-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                          Surplus Donor (Source)
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{rec.source_facility_name}</h4>
                        <div className="flex items-center space-x-3 mt-2 text-xs font-mono">
                          <span className="text-emerald-300 font-bold">Stock: {rec.source_units_available} units</span>
                          <span className="text-emerald-400/90 font-bold">DOS: {rec.source_dos_days}d (Safe)</span>
                        </div>
                      </div>
                    </div>

                    {/* Justification & Approval */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-slate-300/90 italic font-sans flex-1">
                        &ldquo;{rec.clinical_justification}&rdquo;
                      </p>
                      <button
                        disabled={isApproved || isBusy}
                        onClick={() => handleApproveRebalance(rec)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shrink-0 ${
                          isApproved
                            ? 'bg-emerald-600 text-white cursor-default'
                            : isBusy
                            ? 'bg-purple-800 text-purple-200 animate-pulse'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Transfer Dispatched & Signed</span>
                          </>
                        ) : isBusy ? (
                          <span>Authorizing Dispatch...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve Rebalance Transfer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>AI Recommendations remain subject to qualified clinician sign-off.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
