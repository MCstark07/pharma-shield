import React, { useState } from 'react';
import { CandidateMatch, EmergencyRequestResponse } from '../types';
import { Award, CheckCircle2, XCircle, Truck, Shield, AlertTriangle, ArrowRight } from 'lucide-react';

interface MatchingViewProps {
  request: EmergencyRequestResponse;
  candidates: CandidateMatch[];
  onAllocate: (facilityId: string, quantity: number) => Promise<void>;
  onClose?: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  request,
  candidates,
  onAllocate,
  onClose,
}) => {
  const [allocatingId, setAllocatingId] = useState<string | null>(null);

  const handleAllocate = async (facId: string) => {
    setAllocatingId(facId);
    try {
      await onAllocate(facId, request.quantity);
    } finally {
      setAllocatingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-md">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">AI Resource Matching Engine</h3>
            <span className="text-xs font-mono px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
              {request.urgency}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Requisition: {request.quantity} units of {request.resource_code} ({request.category})
          </p>
        </div>

        <div className="text-right font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-cyan-400 font-semibold">Algorithm: </span>
          Score = 0.30·U + 0.25·A + 0.20·T + 0.15·S + 0.10·R
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-mono text-sm">
          No supplier facilities found with inventory matching {request.resource_code}.
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand, idx) => {
            const isTopRanked = idx === 0 && cand.is_eligible;

            return (
              <div
                key={cand.facility_id}
                className={`p-4 rounded-xl border transition-all ${
                  isTopRanked
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                    : cand.is_eligible
                    ? 'bg-slate-800/40 border-slate-700/60'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-400">#{cand.rank}</span>
                      <h4 className="font-bold text-white text-base">{cand.facility_name}</h4>
                      {isTopRanked && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold">
                          Optimal Candidate
                        </span>
                      )}
                      {!cand.is_eligible && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>Disqualified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                      <span>Distance: <strong className="text-slate-200">{cand.distance_km} km</strong></span>
                      <span>Stock: <strong className="text-slate-200">{cand.available_units} units</strong></span>
                      {cand.disqualification_reason && (
                        <span className="text-rose-400 font-semibold">
                          Reason: {cand.disqualification_reason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score & Action */}
                  <div className="flex items-center space-x-4 self-end md:self-center">
                    {cand.is_eligible && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-cyan-400 font-mono">
                          {cand.score}
                          <span className="text-xs text-slate-500 font-normal"> / 100</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">Fitness Match</div>
                      </div>
                    )}

                    {cand.is_eligible && (
                      <button
                        onClick={() => handleAllocate(cand.facility_id)}
                        disabled={allocatingId === cand.facility_id}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono transition shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <span>{allocatingId === cand.facility_id ? 'Locking Stock...' : 'Allocate & Dispatch'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                {cand.is_eligible && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <div className="flex justify-between">
                        <span>Urgency (30%)</span>
                        <span className="text-slate-200">{cand.score_breakdown.urgency}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(cand.score_breakdown.urgency / 30) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>Availability (25%)</span>
                        <span className="text-slate-200">{cand.score_breakdown.availability}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(cand.score_breakdown.availability / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>Transport (20%)</span>
                        <span className="text-slate-200">{cand.score_breakdown.transport}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(cand.score_breakdown.transport / 20) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>Handling (15%)</span>
                        <span className="text-slate-200">{cand.score_breakdown.safety}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(cand.score_breakdown.safety / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <span>Reliability (10%)</span>
                        <span className="text-slate-200">{cand.score_breakdown.reliability}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(cand.score_breakdown.reliability / 10) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

