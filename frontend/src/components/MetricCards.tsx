import React from 'react';
import { Building2, Truck, AlertOctagon, Thermometer, ShieldCheck } from 'lucide-react';
import { ShortagePrediction, Shipment, ShipmentStatus } from '../types';

interface MetricCardsProps {
  facilityCount: number;
  shipments: Shipment[];
  forecasts: ShortagePrediction[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  facilityCount,
  shipments,
  forecasts,
}) => {
  const criticalForecasts = forecasts.filter((f) => f.alert_level === 'CRITICAL');
  const activeShipments = shipments.filter(
    (s) => s.status === ShipmentStatus.IN_TRANSIT || s.status === ShipmentStatus.ALLOCATED
  );
  const excursions = shipments.filter((s) => s.status === ShipmentStatus.UNDER_REVIEW);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Network Facilities */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center space-x-4">
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Facilities</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{facilityCount}</span>
            <span className="text-xs text-emerald-400 font-mono">100% Operational</span>
          </div>
        </div>
      </div>

      {/* 2. Active Shipments */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex items-center space-x-4">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Shipments</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{activeShipments.length}</span>
            <span className="text-xs text-cyan-400 font-mono">In Transit</span>
          </div>
        </div>
      </div>

      {/* 3. DOS Shortage Alerts */}
      <div className={`border rounded-xl p-4 shadow-lg flex items-center space-x-4 ${
        criticalForecasts.length > 0 ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className={`p-3 rounded-lg border ${
          criticalForecasts.length > 0
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Predicted Shortages (DOS)</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${criticalForecasts.length > 0 ? 'text-rose-400' : 'text-white'}`}>
              {criticalForecasts.length}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {criticalForecasts.length > 0 ? 'Lead-time Breached' : 'Stock Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Cold Chain Health */}
      <div className={`border rounded-xl p-4 shadow-lg flex items-center space-x-4 ${
        excursions.length > 0 ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className={`p-3 rounded-lg border ${
          excursions.length > 0
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {excursions.length > 0 ? <Thermometer className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Cold Chain Integrity</p>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${excursions.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {excursions.length === 0 ? '100%' : `${excursions.length} Flaw`}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {excursions.length > 0 ? 'UNDER REVIEW' : '2.0°C – 8.0°C Verified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

