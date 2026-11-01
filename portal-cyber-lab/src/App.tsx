import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  TrendingDown,
  Droplets,
  Thermometer,
  Boxes,
  ShieldAlert,
  Sparkles,
  Link2,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  XCircle,
  Zap,
  Activity,
  FileText,
  DollarSign
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { ThreeCyberGrid } from './components/ThreeCyberGrid';
import { MatterPacketArena } from './components/MatterPacketArena';
import { AttackConsole } from './components/AttackConsole';
import { LedgerInspector } from './components/LedgerInspector';
import { TripartiteNav } from './components/TripartiteNav';

type NavSection =
  | 'DASHBOARD'
  | 'PRICE_INTELLIGENCE'
  | 'BLOOD_NETWORK'
  | 'COLD_CHAIN'
  | 'REGIONAL_DEMAND'
  | 'CYBER_ATTACK_LAB'
  | 'AI_RECOMMENDATIONS'
  | 'AUDIT_LEDGER';

export function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('DASHBOARD');
  const [isUnderAttack, setIsUnderAttack] = useState<boolean>(false);
  const [lastAttackData, setLastAttackData] = useState<any | null>(null);
  const [attackCount, setAttackCount] = useState<number>(3);

  // Live Backend Data States
  const [facilities, setFacilities] = useState<any[]>([]);
  const [priceReport, setPriceReport] = useState<any | null>(null);
  const [rebalanceList, setRebalanceList] = useState<any[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<any[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial intelligence data from central backend
  const loadIntelligenceData = async () => {
    setIsLoading(true);
    try {
      const [facRes, priceRes, rebRes, ledRes, reqRes] = await Promise.allSettled([
        fetch('/api/v1/facilities'),
        fetch('/api/v1/prices/intelligence'),
        fetch('/api/v1/ai/rebalance'),
        fetch('/api/v1/security/ledger'),
        fetch('/api/v1/requisitions'),
      ]);

      if (facRes.status === 'fulfilled' && facRes.value.ok) setFacilities(await facRes.value.json());
      if (priceRes.status === 'fulfilled' && priceRes.value.ok) setPriceReport(await priceRes.value.json());
      if (rebRes.status === 'fulfilled' && rebRes.value.ok) setRebalanceList(await rebRes.value.json());
      if (ledRes.status === 'fulfilled' && ledRes.value.ok) setLedgerBlocks(await ledRes.value.json());
      if (reqRes.status === 'fulfilled' && reqRes.value.ok) setRequisitions(await reqRes.value.json());
    } catch (err) {
      console.warn('Error loading intelligence data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntelligenceData();
  }, []);

  // Handle WebSocket messages from the central bus
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    console.log('[CYBER LAB] WS Event received:', event.event_type, event);

    if (event.event_type === 'INITIAL_STATE' && event.data?.requisitions) {
      setRequisitions(event.data.requisitions);
    } else if (event.event_type === 'REQUISITION_CREATED' && event.data) {
      setRequisitions((prev) => [event.data, ...prev]);
    } else if (event.event_type === 'SECURITY_ALERT' && event.data) {
      setIsUnderAttack(true);
      setLastAttackData(event.data);
      setAttackCount((prev) => prev + 1);
      setTimeout(() => setIsUnderAttack(false), 8000);
    }
  }, []);

  const { isConnected, securityAlert, clearAlert } = useWebSocketSync(handleWebSocketEvent);

  const handleAttackTriggered = (result: any) => {
    setIsUnderAttack(true);
    setLastAttackData(result);
    setAttackCount((prev) => prev + 1);
    setTimeout(() => setIsUnderAttack(false), 8000);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#F1F0E8] flex flex-col font-sans selection:bg-[#D8FF77] selection:text-black">
      {/* PharmaShield Universal Tripartite Command Strip */}
      <TripartiteNav currentPortal="CYBER_LAB" isConnected={isConnected} />

      {/* 🚨 Security Alert Banner (Cross-Portal Broadcast) */}
      {(securityAlert || isUnderAttack) && (
        <div className="bg-rose-950/95 border-b border-rose-500/60 p-4 sticky top-0 z-50 backdrop-blur-md shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/40 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-rose-200 flex items-center space-x-2">
                  <span>ZERO-TRUST GATEWAY: ADVERSARIAL THREAT DEFLECTED</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/30 rounded-full font-mono text-rose-300">
                    STATUS: QUARANTINED
                  </span>
                </h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Vector:{' '}
                  <span className="font-mono font-bold text-rose-100">
                    {lastAttackData?.attack_type || 'MAN_IN_THE_MIDDLE_PAYLOAD_MUTATION'}
                  </span>{' '}
                  | Deflection: Ed25519 Canonical Signature Verification Failed
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsUnderAttack(false);
                clearAlert();
              }}
              className="text-xs px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 rounded-lg border border-rose-500/30 transition-all font-mono"
            >
              DISMISS ALARM
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout with Sidebar Navigation */}
      <div className="flex-1 flex overflow-hidden">
        {/* ZAPLINE-Inspired Command Sidebar */}
        <aside className="w-72 bg-[#09090D] border-r border-[#1D1D26] flex flex-col justify-between shrink-0">
          <div className="p-5 space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D8FF77] animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-[#D8FF77] font-semibold">
                  INTELLIGENCE HUB
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-1">
                PharmaShield Command
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Market Analytics & Defense Matrix
              </p>
            </div>

            {/* Navigation Sections */}
            <nav className="space-y-1">
              {[
                { id: 'DASHBOARD', label: 'Command Dashboard', icon: LayoutDashboard },
                { id: 'PRICE_INTELLIGENCE', label: 'Medicine Price Intel', icon: DollarSign },
                { id: 'BLOOD_NETWORK', label: 'Blood Shortage Grid', icon: Droplets },
                { id: 'COLD_CHAIN', label: 'Cold-Chain Telemetry', icon: Thermometer },
                { id: 'REGIONAL_DEMAND', label: 'Predictive Stock (DOS)', icon: TrendingUp },
                { id: 'CYBER_ATTACK_LAB', label: 'Security & Attack Lab', icon: ShieldAlert },
                { id: 'AI_RECOMMENDATIONS', label: 'AI Rebalance Transfers', icon: Sparkles },
                { id: 'AUDIT_LEDGER', label: 'Immutable Audit Ledger', icon: Link2 },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as NavSection)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#181822] text-[#D8FF77] border border-[#D8FF77]/40 shadow-lg shadow-[#D8FF77]/5'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#12121A]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D8FF77]' : 'text-zinc-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Real-time System Metrics Footer */}
          <div className="p-4 bg-[#050507] border-t border-[#1D1D26] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">DEFENSE STATUS</span>
              <span className="text-[#D8FF77] font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF77]" />
                <span>ONLINE (0 BLOCKS)</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">FACILITIES MONITORED</span>
              <span className="text-white font-semibold">{facilities.length || 9} Medical Depots</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-500">THREATS DEFLECTED</span>
              <span className="text-rose-400 font-semibold">{attackCount} Attacks</span>
            </div>
            <button
              onClick={loadIntelligenceData}
              className="w-full mt-2 flex items-center justify-center space-x-1.5 py-1.5 bg-[#14141E] hover:bg-[#1C1C2A] text-zinc-300 rounded-lg text-[10px] font-mono border border-zinc-800 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>SYNC INTELLIGENCE</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050507]">
          {/* SECTION: COMMAND DASHBOARD */}
          {activeSection === 'DASHBOARD' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                      Healthcare Logistics & Intelligence Overview
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                      Real-time visibility across Bihar, West Bengal, and Jharkhand medical centers.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-[#D8FF77]/10 border border-[#D8FF77]/30 text-[#D8FF77] text-xs font-mono rounded-lg">
                      RFC 8032 ED25519 CONSENSUS ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400">MONITORED DEPOTS</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{facilities.length || 9}</div>
                  <div className="text-[11px] text-[#D8FF77] mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>3 States (Bihar, WB, Jharkhand)</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400">CRITICAL STOCKOUT RISK</div>
                  <div className="text-3xl font-extrabold text-rose-400 mt-2">1 Facility</div>
                  <div className="text-[11px] text-rose-300 mt-1">
                    JLNMCH Bhagalpur (O+ RBC: 0.8d DOS)
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400">COLD-CHAIN SAFE RATE</div>
                  <div className="text-3xl font-extrabold text-[#D8FF77] mt-2">99.2%</div>
                  <div className="text-[11px] text-zinc-400 mt-1">Strict 2.0°C – 8.0°C Safe Zone</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] relative overflow-hidden">
                  <div className="text-xs font-mono text-zinc-400">IMMUTABLE BLOCKS</div>
                  <div className="text-3xl font-extrabold text-[#A66CFF] mt-2">
                    {ledgerBlocks.length || 6}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">SHA-256 Canonical Chained</div>
                </div>
              </div>

              {/* 3D Visualizer & Matter Arena Embed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-[#0C0C12] border border-[#1C1C28] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#D8FF77] font-semibold">
                      3D CYBER DEFENSE GRID (THREE.JS)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">REAL-TIME SHOCKWAVE</span>
                  </div>
                  <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden relative border border-zinc-800">
                    <ThreeCyberGrid isUnderAttack={isUnderAttack} />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0C0C12] border border-[#1C1C28] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#D8FF77] font-semibold">
                      MATTER.JS ZERO-TRUST PACKET DEFLECTION
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">PHYSICS DEFENSE</span>
                  </div>
                  <div className="flex-1 min-h-[300px] rounded-xl overflow-hidden relative border border-zinc-800">
                    <MatterPacketArena lastAttack={lastAttackData} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MEDICINE PRICE INTELLIGENCE */}
          {activeSection === 'PRICE_INTELLIGENCE' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-6 h-6 text-[#D8FF77]" />
                  <span>Cross-State Medicine Price Intelligence</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Automated wholesale price aggregation and predatory price gouging anomaly detection across Bihar, West Bengal, and Jharkhand.
                </p>
              </div>

              {priceReport ? (
                <div className="rounded-2xl bg-[#0C0C12] border border-[#1C1C28] p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                      <span className="text-xs font-mono text-zinc-500 uppercase">PRODUCT SKU</span>
                      <h3 className="text-xl font-bold text-white mt-0.5">{priceReport.product_name}</h3>
                      <span className="text-xs font-mono text-[#D8FF77]">{priceReport.resource_code}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-500">NATIONAL MEDIAN PRICE</span>
                      <div className="text-2xl font-bold text-white mt-0.5">
                        ₹{priceReport.national_median_price_inr?.toFixed(2)}
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        priceReport.price_anomaly_detected
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-[#D8FF77]/20 text-[#D8FF77] border border-[#D8FF77]/30'
                      }`}>
                        {priceReport.price_anomaly_detected ? 'ANOMALY DETECTED (>35% SPREAD)' : 'NORMAL SPREAD (<10%)'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {priceReport.state_breakdown?.map((st: any) => (
                      <div key={st.state} className="p-4 rounded-xl bg-[#14141E] border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{st.state}</span>
                          <span className="text-xs font-mono text-zinc-400">{st.total_units_in_state} Units</span>
                        </div>
                        <div className="text-2xl font-extrabold text-[#D8FF77]">
                          ₹{st.average_price_inr?.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex justify-between font-mono">
                          <span>Min: ₹{st.min_price_inr}</span>
                          <span>Max: ₹{st.max_price_inr}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-[#101018] border border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Lowest Cost State: <strong className="text-white">{priceReport.lowest_cost_state}</strong></span>
                    <span className="text-zinc-400">Highest Cost State: <strong className="text-white">{priceReport.highest_cost_state}</strong></span>
                    <span className="text-zinc-400">Freshness: <strong className="text-[#D8FF77]">{priceReport.data_freshness_minutes}m ago</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                  Loading real-time price observations...
                </div>
              )}
            </div>
          )}

          {/* SECTION: BLOOD SHORTAGE GRID */}
          {activeSection === 'BLOOD_NETWORK' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Droplets className="w-6 h-6 text-rose-500" />
                  <span>Hospital Blood Shortage & Compatibility Network (Problem 1)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Non-public blood component allocation strictly adhering to 100% ABO/Rh donor-recipient compatibility rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] space-y-4">
                  <h3 className="text-base font-bold text-white">Active Blood Stockout Crisis (JLNMCH)</h3>
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-rose-200 font-bold">JLNMCH Bhagalpur (Tertiary Care)</span>
                      <span className="px-2 py-0.5 bg-rose-500 text-black font-extrabold rounded text-[10px]">
                        CRITICAL STOCKOUT
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-white">4 Units O+ RBC Remaining</div>
                    <div className="text-xs text-rose-300 font-mono">
                      Daily Consumption: 5 units/day | Days of Stock: <strong>0.8 Days</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#14141E] border border-zinc-800 space-y-2">
                    <div className="text-xs font-mono text-zinc-400">PAIRED SURPLUS RESERVES</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">Sadar Hospital Bhagalpur</span>
                      <span className="font-mono text-[#D8FF77] font-bold">28 Units (Compatible)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">Mayaganj Central Blood Depot</span>
                      <span className="font-mono text-[#D8FF77] font-bold">50 Units (Cold-Chain Certified)</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] space-y-4">
                  <h3 className="text-base font-bold text-white">ABO Compatibility Safety Filter</h3>
                  <div className="space-y-2 text-xs font-mono text-zinc-300">
                    <div className="p-2.5 rounded-lg bg-[#14141E] border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Recipient: O+</span>
                      <span className="text-[#D8FF77]">Eligible Donors: O+, O-</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#14141E] border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Recipient: A+</span>
                      <span className="text-[#D8FF77]">Eligible Donors: A+, A-, O+, O-</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#14141E] border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Recipient: B+</span>
                      <span className="text-[#D8FF77]">Eligible Donors: B+, B-, O+, O-</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#14141E] border border-zinc-800 flex justify-between">
                      <span className="text-zinc-400">Recipient: AB+</span>
                      <span className="text-[#D8FF77]">Universal Recipient (All Groups)</span>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200">
                    ⚠️ Regulatory Lock: Blood units cannot be purchased commercially. Transfers require human medical officer sign-off.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: COLD-CHAIN TELEMETRY */}
          {activeSection === 'COLD_CHAIN' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Thermometer className="w-6 h-6 text-[#00D9FF]" />
                  <span>Vaccine Cold-Chain Telemetry & Anomaly Engine (Problem 2)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Continuous sensor monitoring enforcing 2.0°C–8.0°C bounds with non-bypassable clinical disposition locks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28]">
                  <div className="text-xs font-mono text-zinc-400">SAFE TEMPERATURE RANGE</div>
                  <div className="text-3xl font-extrabold text-[#D8FF77] mt-2">2.0°C – 8.0°C</div>
                  <div className="text-xs text-zinc-400 mt-1">Automated Lock Below or Above</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28]">
                  <div className="text-xs font-mono text-zinc-400">ACTIVE CONVOY SENSORS</div>
                  <div className="text-3xl font-extrabold text-white mt-2">12 Loggers</div>
                  <div className="text-xs text-zinc-400 mt-1">BLE + Cellular GPS Telematics</div>
                </div>
                <div className="p-5 rounded-2xl bg-[#0C0C12] border border-[#1C1C28]">
                  <div className="text-xs font-mono text-zinc-400">EXCURSION RESOLUTION</div>
                  <div className="text-3xl font-extrabold text-[#A66CFF] mt-2">HUMAN SIGN-OFF</div>
                  <div className="text-xs text-zinc-400 mt-1">Software Never Auto-Clears</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: REGIONAL DEMAND & PREDICTIVE DOS */}
          {activeSection === 'REGIONAL_DEMAND' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-[#D8FF77]" />
                  <span>Predictive Stockout Prevention & Days of Stock (Problem 6)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Days of Stock calculation (DOS = Current Inventory / Daily Consumption) preventing hospital stockouts before they occur.
                </p>
              </div>

              <div className="rounded-2xl bg-[#0C0C12] border border-[#1C1C28] p-6 space-y-4">
                <h3 className="text-sm font-mono text-zinc-400 uppercase">Active Days-of-Stock Forecast Matrix</h3>
                <div className="divide-y divide-zinc-800">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Jawaharlal Nehru Medical College (JLNMCH)</div>
                      <div className="text-xs text-zinc-400 font-mono">Resource: O_POS_RBC | Consumption: 5/day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-rose-400">0.8 Days</div>
                      <span className="text-[10px] font-mono text-rose-300">CRITICAL SHORTAGE</span>
                    </div>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Sadar Hospital Bhagalpur</div>
                      <div className="text-xs text-zinc-400 font-mono">Resource: O_POS_RBC | Consumption: 2/day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-[#D8FF77]">14.0 Days</div>
                      <span className="text-[10px] font-mono text-[#D8FF77]">HEALTHY SURPLUS</span>
                    </div>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Care Pharmacy Siliguri</div>
                      <div className="text-xs text-zinc-400 font-mono">Resource: REMDESIVIR_100MG | Consumption: 3/day</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-rose-400">0.0 Days</div>
                      <span className="text-[10px] font-mono text-rose-300">DEPLETED (SOURCED VIA WB MEDIHUB)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: CYBER ATTACK LAB & DEFENSE */}
          {activeSection === 'CYBER_ATTACK_LAB' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                  <span>Interactive Cyber Attack & Deflection Lab (Track 2: Cybersecurity)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Simulate live Man-in-the-Middle (MITM) quantity tampering, forged signatures, and sensor spoofing to prove instant Ed25519 rejection.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttackConsole
                  availableRequisitions={requisitions}
                  onAttackTriggered={handleAttackTriggered}
                />
                <div className="rounded-2xl bg-[#0C0C12] border border-[#1C1C28] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#D8FF77] font-semibold">
                      LIVE PHYSICS DEFLECTION SENSOR (MATTER.JS)
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 animate-pulse">
                      ZERO-TRUST ACTIVE
                    </span>
                  </div>
                  <div className="flex-1 min-h-[360px] rounded-xl overflow-hidden relative border border-zinc-800">
                    <MatterPacketArena lastAttack={lastAttackData} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: AI RECOMMENDATIONS & REBALANCE */}
          {activeSection === 'AI_RECOMMENDATIONS' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-[#D8FF77]" />
                  <span>AI Predictive Stock Rebalancing Recommendations</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Automated pairing of regional shortage facilities with nearest surplus facilities to eliminate stockouts.
                </p>
              </div>

              <div className="space-y-4">
                {rebalanceList.map((rec, i) => (
                  <div
                    key={rec.recommendation_id || i}
                    className="p-6 rounded-2xl bg-[#0C0C12] border border-[#1C1C28] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-sm font-bold text-white font-mono">
                          {rec.resource_code} REPLENISHMENT
                        </span>
                      </div>
                      <span className="text-xs font-mono px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg">
                        CRITICAL SHORTAGE RESCUE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="p-3 bg-[#14141E] rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block">SHORTAGE DESTINATION</span>
                        <strong className="text-white text-sm">{rec.target_facility_name}</strong>
                        <span className="text-rose-400 block mt-1">Current DOS: {rec.target_dos_days}d</span>
                      </div>
                      <div className="p-3 bg-[#14141E] rounded-xl border border-zinc-800">
                        <span className="text-zinc-500 block">SURPLUS SOURCE</span>
                        <strong className="text-white text-sm">{rec.source_facility_name}</strong>
                        <span className="text-[#D8FF77] block mt-1">Current DOS: {rec.source_dos_days}d</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#101018] rounded-xl border border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Transfer: <strong className="text-white">{rec.recommended_transfer_quantity} Units</strong></span>
                      <span className="text-zinc-400">Distance: <strong className="text-white">{rec.distance_km} km</strong></span>
                      <span className="text-zinc-400">Transit: <strong className="text-[#D8FF77]">{rec.estimated_transit_minutes} min</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: AUDIT LEDGER */}
          {activeSection === 'AUDIT_LEDGER' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Link2 className="w-6 h-6 text-[#A66CFF]" />
                  <span>Cryptographic Audit Ledger & Chain Explorer</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Chronological SHA-256 hash-chain verified by Ed25519 digital signatures (RFC 8032 & RFC 8785).
                </p>
              </div>

              <LedgerInspector />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
