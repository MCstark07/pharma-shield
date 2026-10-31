import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  PlusCircle, 
  Activity, 
  Truck, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  RefreshCw,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Facility, InventoryItem, MedicalRequest, Shipment } from './types';
import { MOCK_FACILITIES, MOCK_INVENTORY, MOCK_REQUESTS, MOCK_SHIPMENTS } from './mock/data';
import { MetricCards } from './components/MetricCards';
import { CommandMap } from './components/CommandMap';
import { RequestModal } from './components/RequestModal';
import { SecurityLab } from './components/SecurityLab';
import { api } from './services/api';

export const App: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>(MOCK_FACILITIES);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [requests, setRequests] = useState<MedicalRequest[]>(MOCK_REQUESTS);
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [facs, inv, reqs, shps] = await Promise.all([
        api.getFacilities(),
        api.getInventory(),
        api.getRequests(),
        api.getShipments(),
      ]);
      setFacilities(facs);
      setInventory(inv);
      setRequests(reqs);
      setShipments(shps);
      // Check if actual backend responded
      setIsBackendConnected(false); // Standalone mode active
    } catch {
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (newRequest: Partial<MedicalRequest>) => {
    const created = await api.createRequest(newRequest);
    setRequests((prev) => [created as MedicalRequest, ...prev]);

    // Simulate 5-factor scoring automatic match notification
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === created.id
            ? { ...r, status: 'MATCHED', allocated_facility_id: 'fac_mayaganj' }
            : r
        )
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Status Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded-xl shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase font-mono bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  PharmaShield
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  OPS-V1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Predictive & Cryptographically Verifiable Medical Logistics • Bhagalpur Mesh
              </p>
            </div>
          </div>

          {/* Controls & Connection Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">
                {isBackendConnected ? 'API Connected (:8000)' : 'Standalone Real-Time Mode'}
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium text-xs font-mono uppercase tracking-wider rounded-lg shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Emergency Requisition</span>
            </button>
          </div>
        </div>
      </header>

      {/* Critical Shortage Warning Ticker */}
      <div className="bg-rose-950/40 border-b border-rose-900/60 px-4 py-2 text-xs font-mono text-rose-300 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-rose-400">Critical Shortage Alert:</span>
          <span className="truncate">
            JLNMCH Tertiary Care reports O+ RBC stock critical (4 units left, DOS = 0.8 days). Automated 5-factor matching routed to Mayaganj Central Depot.
          </span>
        </div>
      </div>

      {/* Main Operational Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Metric Cards Row */}
        <MetricCards
          facilities={facilities}
          inventory={inventory}
          requests={requests}
          shipments={shipments}
        />

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Command Map & Active Shipments (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* GIS Command Map */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold font-mono uppercase tracking-wide text-slate-200">
                    Geospatial Healthcare Network & Live Dispatch
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Bhagalpur District, Bihar
                </span>
              </div>

              <CommandMap
                facilities={facilities}
                shipments={shipments}
                selectedFacilityId={selectedFacility?.id}
                onSelectFacility={(fac) => setSelectedFacility(fac)}
              />
            </div>

            {/* Active Medical Shipments & Sensor Telemetry */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wide text-slate-200">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>Active Cold-Chain In-Transit Shipments ({shipments.length})</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> Telemetry Stream Active
                </span>
              </div>

              <div className="space-y-4">
                {shipments.map((shp) => (
                  <div
                    key={shp.id}
                    className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            {shp.id}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {shp.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100 mt-1">
                          {shp.resource_name} ({shp.quantity} Units)
                        </h4>
                      </div>

                      {/* Live Temp Badge */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-slate-400 uppercase">Current Temp</div>
                          <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                            <Thermometer className="w-4 h-4" />
                            <span>{shp.current_temp.toFixed(1)}°C</span>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-right">
                          <div className="text-[10px] font-mono text-slate-400">ETA</div>
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {shp.eta_minutes} mins
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transit Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>From: {shp.source_facility_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span>To: {shp.destination_facility_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Vehicle: {shp.vehicle_id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Cold Window: {shp.min_temp_threshold}°C – {shp.max_temp_threshold}°C</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Emergency Requisitions & Security Lab (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Requisitions & AI Matching Feed */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wide text-slate-200">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Emergency Requisitions ({requests.length})</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-mono text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request</span>
                </button>
              </div>

              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {req.resource_name || req.resource_code}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          req.urgency === 'CRITICAL'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Units Needed: <b className="text-slate-200">{req.quantity}</b></span>
                      <span className="text-cyan-400 font-medium">Status: {req.status}</span>
                    </div>

                    {req.clinical_note_redacted && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800/80">
                        "{req.clinical_note_redacted}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Facility: {req.requesting_facility_name || req.requesting_facility_id}</span>
                      <span>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Security Lab Panel (Securathon Track 2) */}
            <SecurityLab />
          </div>
        </div>
      </main>

      {/* Emergency Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilities={facilities}
        onSubmitRequest={handleCreateRequest}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        PharmaShield • Securathon 2026 (IIIT Bhagalpur Track 2: Cybersecurity 1.2x) • Modular Monolith Architecture
      </footer>
    </div>
  );
};

export default App;

