import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { wsClient } from '../services/ws';
import {
  FacilityBase,
  Shipment,
  ShortagePrediction,
  TelemetryRecord,
  EmergencyRequestResponse,
  CandidateMatch,
  EmergencyRequestCreate,
} from '../types';
import { MetricCards } from '../components/MetricCards';
import { CommandMap } from '../components/CommandMap';
import { ColdChainChart } from '../components/ColdChainChart';
import { ThreeBioVial } from '../components/ThreeBioVial';
import { ThreeSupplyGlobe } from '../components/ThreeSupplyGlobe';
import { EmergencyModal } from '../components/EmergencyModal';
import { MatchingView } from '../components/MatchingView';
import {
  PlusCircle,
  Radio,
  Clock,
  Layers,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  FlaskConical,
  ShieldCheck,
  Server
} from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityBase[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [forecasts, setForecasts] = useState<ShortagePrediction[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'2D_MAP' | '3D_GRID'>('2D_MAP');

  // Emergency Modal & AI Matching States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeRequest, setActiveRequest] = useState<EmergencyRequestResponse | null>(null);
  const [matchCandidates, setMatchCandidates] = useState<CandidateMatch[]>([]);

  // Load Initial Data
  const loadData = async () => {
    try {
      const [facs, ships, preds] = await Promise.all([
        api.getFacilities(),
        api.getShipments(),
        api.getForecasts(),
      ]);
      setFacilities(facs);
      setShipments(ships);
      setForecasts(preds);

      if (ships.length > 0) {
        const tele = await api.getShipmentTelemetry(ships[0].id);
        setTelemetry(tele);
      }
    } catch (err) {
      console.error('Failed to load Command Center data:', err);
    }
  };

  useEffect(() => {
    loadData();
    wsClient.connect();

    // Listen to real-time events
    const handleTelemetry = (data: any) => {
      setRecentEvents((prev) => [
        { time: new Date().toLocaleTimeString(), text: `Telemetry received: ${data.temperature_c}°C`, type: 'telemetry' },
        ...prev.slice(0, 9),
      ]);
      setTelemetry((prev) => [data, ...prev]);
    };

    const handleExcursion = (data: any) => {
      setRecentEvents((prev) => [
        { time: new Date().toLocaleTimeString(), text: `ALERT: Temperature excursion (${data.temperature_c}°C)!`, type: 'excursion' },
        ...prev.slice(0, 9),
      ]);
      loadData();
    };

    const handleAllocated = (data: any) => {
      setRecentEvents((prev) => [
        { time: new Date().toLocaleTimeString(), text: `Resource allocated from ${data.origin}!`, type: 'allocated' },
        ...prev.slice(0, 9),
      ]);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      loadData();
    };

    wsClient.on('TELEMETRY_RECEIVED', handleTelemetry);
    wsClient.on('COLD_CHAIN_EXCURSION', handleExcursion);
    wsClient.on('RESOURCE_ALLOCATED', handleAllocated);

    return () => {
      wsClient.off('TELEMETRY_RECEIVED', handleTelemetry);
      wsClient.off('COLD_CHAIN_EXCURSION', handleExcursion);
      wsClient.off('RESOURCE_ALLOCATED', handleAllocated);
    };
  }, []);

  const handleCreateRequest = async (payload: EmergencyRequestCreate) => {
    const newReq = await api.createEmergencyRequest(payload);
    setActiveRequest(newReq);

    // Fetch AI Matches
    const matchRes = await api.getMatches(newReq.id);
    setMatchCandidates(matchRes.candidates);
  };

  const handleAllocate = async (fulfillingFacilityId: string, quantity: number) => {
    if (!activeRequest) return;
    await api.allocateResource(activeRequest.id, fulfillingFacilityId, quantity, true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#06b6d4', '#10b981', '#f43f5e', '#ffffff'],
    });
    setActiveRequest(null);
    setMatchCandidates([]);
    await loadData();
  };

  const currentTemp = telemetry[0]?.temperature_c ?? 4.2;
  const isCurrentExcursion = telemetry.some((t) => t.is_excursion);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar with Emergency Dispatch Trigger & Portal Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Logistics Command Center</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>3D WebGL / Three.js Active</span>
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Geospatial tracking, 3D cold-chain cryo-vial holograms, and immutable Ed25519 hash-chain monitoring
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Sub-Portals Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px] font-mono">
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center space-x-1 transition"
              title="Open Pharma Operations Portal"
            >
              <FlaskConical className="w-3 h-3 text-cyan-400" />
              <span>Ops :5174</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="http://localhost:5175"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center space-x-1 transition"
              title="Open Cybersecurity Attack Console"
            >
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Cyber :5175</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-semibold flex items-center space-x-1 transition"
              title="Open Swagger OpenAPI Documentation"
            >
              <Server className="w-3 h-3 text-cyan-400" />
              <span>API :8000</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
            </a>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Emergency Requisition</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricCards
        facilityCount={facilities.length}
        shipments={shipments}
        forecasts={forecasts}
      />

      {/* AI Matching View if active emergency requisition */}
      {activeRequest && (
        <MatchingView
          request={activeRequest}
          candidates={matchCandidates}
          onAllocate={handleAllocate}
          onClose={() => setActiveRequest(null)}
        />
      )}

      {/* Main Grid: 2D/3D Geospatial Map Area + Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {/* View Mode Switcher Header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Geospatial Visualization Mode</span>
            </span>

            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <button
                onClick={() => setViewMode('2D_MAP')}
                className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                  viewMode === '2D_MAP'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>2D Tactical Map</span>
              </button>
              <button
                onClick={() => setViewMode('3D_GRID')}
                className={`px-3 py-1 rounded-md flex items-center space-x-1.5 transition ${
                  viewMode === '3D_GRID'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>3D WebGL Hologram</span>
              </button>
            </div>
          </div>

          {/* Conditional View: 2D Leaflet Map or 3D Three.js Grid */}
          {viewMode === '2D_MAP' ? (
            <CommandMap
              facilities={facilities}
              shipments={shipments}
              forecasts={forecasts}
            />
          ) : (
            <ThreeSupplyGlobe
              facilities={facilities}
              shipments={shipments}
            />
          )}
        </div>

        {/* Live Incident & Telemetry Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Live Event Stream</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Bhagalpur Node</span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  Awaiting real-time WebSocket events...
                </div>
              ) : (
                recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-[11px] transition ${
                      ev.type === 'excursion'
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : ev.type === 'allocated'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{ev.time}</span>
                      </span>
                    </div>
                    <div>{ev.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 text-[11px] uppercase">Active Lead Time Warning:</div>
            <p className="text-[10px] leading-relaxed">
              JLNMCH blood bank threshold breached (0.8d &lt; 2.0d). Sadar Hospital and Mayaganj Central Depot standing by for automated crossmatch dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Cold Chain: Recharts Live Curve + 3D WebGL Three.js BioVial */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <ColdChainChart telemetry={telemetry} />
        </div>
        <div className="lg:col-span-1">
          <ThreeBioVial
            temperature={currentTemp}
            isExcursion={isCurrentExcursion}
            status={shipments[0]?.status || 'IN_TRANSIT'}
            className="h-full"
          />
        </div>
      </div>

      {/* Emergency Requisition Modal */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilities={facilities}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};
