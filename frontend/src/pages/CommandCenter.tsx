import React, { useState, useEffect } from 'react';
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
import { EmergencyModal } from '../components/EmergencyModal';
import { MatchingView } from '../components/MatchingView';
import { ShieldAlert, PlusCircle, Radio, Clock, AlertTriangle } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const [facilities, setFacilities] = useState<FacilityBase[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [forecasts, setForecasts] = useState<ShortagePrediction[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  
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
      // Update telemetry chart if matches active shipment
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
    setActiveRequest(null);
    setMatchCandidates([]);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar with Emergency Dispatch Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Logistics Command Center</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Bhagalpur Ops
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time geospatial tracking, Days-of-Stock forecasting, and cryptographic chain monitor
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Emergency Requisition</span>
        </button>
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

      {/* Main Grid: Command Map + Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CommandMap
            facilities={facilities}
            shipments={shipments}
            forecasts={forecasts}
          />
        </div>

        {/* Live Incident & Telemetry Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Live Event Feed</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Bhagalpur Hub</span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Awaiting real-time WebSocket events...
                </div>
              ) : (
                recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border text-[11px] ${
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

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 text-[11px] uppercase">Active Lead Time Warning:</div>
            <p className="text-[10px] leading-relaxed">
              JLNMCH blood bank threshold breached (0.8d &lt; 2.0d). Sadar Hospital and Mayaganj Central Depot standing by for automated crossmatch dispatch.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Cold Chain Graph */}
      <ColdChainChart telemetry={telemetry} />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilities={facilities}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
};

