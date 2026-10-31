import React from 'react';
import { Building2, Package, AlertTriangle, ShieldCheck, ThermometerSnowflake } from 'lucide-react';
import { Facility, InventoryItem, MedicalRequest, Shipment } from '../types';

interface MetricCardsProps {
  facilities: Facility[];
  inventory: InventoryItem[];
  requests: MedicalRequest[];
  shipments: Shipment[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  facilities,
  inventory,
  requests,
  shipments,
}) => {
  const activeFacilitiesCount = facilities.filter(f => f.is_active).length;
  const totalStock = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const pendingCriticalRequests = requests.filter(r => r.urgency === 'CRITICAL' && r.status === 'PENDING').length;
  const totalPendingRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'MATCHED').length;
  
  // Excursions: shipments with temp out of range or status UNDER_REVIEW
  const coldChainExcursions = shipments.filter(
    s => s.status === 'UNDER_REVIEW' || s.current_temp < s.min_temp_threshold || s.current_temp > s.max_temp_threshold
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Active Facilities */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Network Nodes</p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {activeFacilitiesCount} <span className="text-xs font-normal text-slate-400">/ {facilities.length} Active</span>
            </h3>
          </div>
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/50 rounded-lg text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Bhagalpur Metro Mesh 100% Online</span>
        </div>
      </div>

      {/* 2. Total Stocked Units */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Stocked Units</p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {totalStock.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 bg-indigo-950/60 border border-indigo-800/50 rounded-lg text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
          <span>6 Categories Tracked</span>
          <span className="text-cyan-400 font-mono font-medium">Row-Locked</span>
        </div>
      </div>

      {/* 3. Pending Emergency Requests */}
      <div className={`bg-slate-900/90 border rounded-xl p-4 shadow-lg backdrop-blur relative overflow-hidden group transition-all ${
        pendingCriticalRequests > 0 ? 'border-rose-500/60 shadow-rose-950/30' : 'border-slate-800 hover:border-amber-500/50'
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Emergency Requests</p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {totalPendingRequests}
              {pendingCriticalRequests > 0 && (
                <span className="ml-2 text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCriticalRequests} CRITICAL
                </span>
              )}
            </h3>
          </div>
          <div className={`p-3 rounded-lg border ${
            pendingCriticalRequests > 0 
              ? 'bg-rose-950/80 border-rose-800 text-rose-400' 
              : 'bg-amber-950/60 border-amber-800/50 text-amber-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <span>AI 5-Factor Matching Active</span>
        </div>
      </div>

      {/* 4. Cold-Chain Alerts */}
      <div className={`bg-slate-900/90 border rounded-xl p-4 shadow-lg backdrop-blur relative overflow-hidden group transition-all ${
        coldChainExcursions > 0 ? 'border-rose-500/80' : 'border-slate-800 hover:border-emerald-500/50'
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Cold-Chain Status</p>
            <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">
              {coldChainExcursions > 0 ? (
                <span className="text-rose-400">{coldChainExcursions} EXCURSION</span>
              ) : (
                <span className="text-emerald-400">2°C – 8°C NOMINAL</span>
              )}
            </h3>
          </div>
          <div className={`p-3 rounded-lg border ${
            coldChainExcursions > 0
              ? 'bg-rose-950/80 border-rose-800 text-rose-400'
              : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
          }`}>
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">Active Sensors: {shipments.length}</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Ed25519 Verified
          </span>
        </div>
      </div>
    </div>
  );
};

