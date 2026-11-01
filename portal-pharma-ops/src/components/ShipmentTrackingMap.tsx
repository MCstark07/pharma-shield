import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Play,
  Pause,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface TrackingMapProps {
  onTriggerExcursion?: () => void;
  onOpenDispositionModal?: (shipment: any) => void;
}

export const ShipmentTrackingMap: React.FC<TrackingMapProps> = ({
  onTriggerExcursion,
  onOpenDispositionModal,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [routeProgress, setRouteProgress] = useState(65); // 0 to 100%
  const [currentTemp, setCurrentTemp] = useState(4.1);
  const [shipmentStatus, setShipmentStatus] = useState<'IN_TRANSIT' | 'UNDER_REVIEW' | 'DELIVERED'>('IN_TRANSIT');

  // Waypoints along Mayaganj Depot -> JLNMCH Hospital route
  const waypoints = [
    { name: 'Mayaganj Central Blood Depot (Origin)', lat: 25.2420, lng: 87.0150, time: '14:15 UTC', status: 'DEPARTED' },
    { name: 'Barari Road Junction Checkpoint', lat: 25.2428, lng: 87.0142, time: '14:22 UTC', status: 'PASSED' },
    { name: 'University Health Corridor', lat: 25.2435, lng: 87.0134, time: '14:28 UTC', status: 'IN_TRANSIT' },
    { name: 'JLNMCH Emergency Trauma Bay (Destination)', lat: 25.2445, lng: 87.0125, time: 'ETA 14:35 UTC', status: 'PENDING' },
  ];

  // Current interpolated coordinates
  const currentLat = (25.2420 + (routeProgress / 100) * (25.2445 - 25.2420)).toFixed(4);
  const currentLng = (87.0150 - (routeProgress / 100) * (87.0150 - 87.0125)).toFixed(4);

  // Simulated GPS movement loop
  useEffect(() => {
    if (!isPlaying || shipmentStatus === 'UNDER_REVIEW') return;
    const interval = setInterval(() => {
      setRouteProgress((prev) => {
        if (prev >= 98) {
          setShipmentStatus('DELIVERED');
          return 100;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, shipmentStatus]);

  const handleSimulateExcursion = () => {
    setCurrentTemp(14.8);
    setShipmentStatus('UNDER_REVIEW');
    if (onTriggerExcursion) onTriggerExcursion();
  };

  const handleReset = () => {
    setRouteProgress(20);
    setCurrentTemp(4.1);
    setShipmentStatus('IN_TRANSIT');
  };

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4 font-sans text-slate-100">
      {/* Title & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Navigation className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Active Medical Shipment Route Visibility
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono border border-slate-700">
                ILLUSTRATIVE / SIMULATED GPS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Shipment: <strong className="text-amber-300 font-mono">ship_mayaganj_to_jlnmch</strong> • Transporter: <strong className="text-white">AMBULANCE_UNIT_BHG_04</strong>
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono flex items-center space-x-1.5 text-slate-300 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause Movement' : 'Resume Movement'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Primary Visual Route Vector Canvas */}
      <div className="relative h-64 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden flex flex-col justify-between">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Floating Telemetry Overlay Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GPS: <strong>{currentLat}° N, {currentLng}° E</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>ETA: <strong>~{Math.max(2, Math.round((100 - routeProgress) * 0.2))} mins</strong></span>
            </span>

            {/* Cold Chain Badge */}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                currentTemp > 8.0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <Thermometer className="w-3 h-3" />
              <span>{currentTemp}°C ({currentTemp > 8.0 ? 'EXCURSION' : 'SAFE 2-8°C'})</span>
            </span>
          </div>
        </div>

        {/* Central Vector Route Line with Animated Vehicle */}
        <div className="relative z-10 my-auto px-6">
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            {/* Filled Progress Bar */}
            <div
              className={`h-full transition-all duration-700 ${
                currentTemp > 8.0 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${routeProgress}%` }}
            />
          </div>

          {/* Vehicle Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-5 transition-all duration-700 flex flex-col items-center"
            style={{ left: `${routeProgress}%` }}
          >
            <div className="p-2 rounded-xl bg-amber-500 text-black shadow-lg shadow-amber-500/50 animate-bounce">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 whitespace-nowrap mt-1">
              {routeProgress}% In Transit
            </span>
          </div>
        </div>

        {/* Bottom Origin and Destination Endpoints */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Mayaganj Depot (Bhagalpur)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span>JLNMCH Emergency ICU (Bhagalpur)</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Waypoint Audit & Excursion Simulator Trigger Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
        {/* Waypoints List */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">
            Custody Handover Waypoints
          </span>
          {waypoints.map((wp, idx) => (
            <div key={idx} className="flex justify-between items-center text-slate-400 py-0.5">
              <span className="truncate pr-2">{wp.name}</span>
              <span className="text-slate-500 text-[10px]">{wp.time}</span>
            </div>
          ))}
        </div>

        {/* Cold-Chain Actions */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
            Cold-Chain Telemetry Actions (Problem 2)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSimulateExcursion}
              className="px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Excursion (14.8°C)</span>
            </button>

            {shipmentStatus === 'UNDER_REVIEW' && onOpenDispositionModal && (
              <button
                onClick={() =>
                  onOpenDispositionModal({
                    id: 'ship_mayaganj_to_jlnmch',
                    current_temp: currentTemp,
                    resource_code: 'O_POS_RBC',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-md transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review & Sign Disposition</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

