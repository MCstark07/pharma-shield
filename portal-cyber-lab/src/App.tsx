import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Radio,
  Terminal,
  Link2,
  AlertOctagon,
  RefreshCw,
  Cpu,
  Layers,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { ThreeCyberGrid } from './components/ThreeCyberGrid';
import { MatterPacketArena } from './components/MatterPacketArena';
import { AttackConsole } from './components/AttackConsole';
import { LedgerInspector } from './components/LedgerInspector';
import { TripartiteNav } from './components/TripartiteNav';

export function App() {
  const [activeTab, setActiveTab] = useState<'ATTACK_DEFENSE' | 'LEDGER'>('ATTACK_DEFENSE');
  const [isUnderAttack, setIsUnderAttack] = useState<boolean>(false);
  const [lastAttackData, setLastAttackData] = useState<any | null>(null);
  const [requisitions, setRequisitions] = useState<Array<{ id: string; resource_code: string; quantity: number }>>([]);
  const [attackCount, setAttackCount] = useState<number>(3);

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

      // Flash red alert on cyber grid for 8 seconds
      setTimeout(() => {
        setIsUnderAttack(false);
      }, 8000);
    }
  }, []);

  const { isConnected, securityAlert, clearAlert } = useWebSocketSync(handleWebSocketEvent);

  // Fetch requisitions for attack dropdown
  const fetchRequisitions = async () => {
    try {
      const res = await fetch('/api/v1/requisitions');
      if (res.ok) {
        const data = await res.json();
        setRequisitions(data);
      }
    } catch (err) {
      console.error('Error fetching requisitions:', err);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleAttackTriggered = (result: any) => {
    setIsUnderAttack(true);
    setLastAttackData(result);
    setAttackCount((prev) => prev + 1);
    setTimeout(() => {
      setIsUnderAttack(false);
    }, 8000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* PharmaShield Universal Tripartite Command Strip */}
      <TripartiteNav
        currentPortal="CYBER_LAB"
        isConnected={isConnected}
      />
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
                    {lastAttackData?.attack_type || securityAlert?.attack_type || 'EXPLOIT INTERCEPTED'}
                  </span>{' '}
                  — Cryptographic verification failed and threat payload was deflected to quarantine.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                clearAlert();
                setIsUnderAttack(false);
              }}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-lg border border-rose-700/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-xl shadow-lg shadow-rose-600/20 text-white font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-100">PHARMASHIELD</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md">
                  PORTAL 3 // CYBER LAB
                </span>
                <span className="text-slate-500 text-xs font-mono">:5175</span>
              </div>
              <p className="text-[10px] text-slate-400">Zero-Trust Attack & Defense Arena • Ed25519 Cryptographic Verification</p>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ATTACK_DEFENSE')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ATTACK_DEFENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Exploit Arena & Deflection</span>
            </button>
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'LEDGER'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>SHA-256 Ledger Explorer</span>
            </button>
          </div>

          {/* Right Status */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="font-mono text-[11px] text-slate-300">
                {isConnected ? 'DEFENSE BUS CONNECTED' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Intercepted Exploits</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{attackCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Zero unauthorized access breaches</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Verification Gateway</span>
            <div className="text-sm font-bold font-mono text-emerald-400 mt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>ACTIVE [ED25519]</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Canonical SHA-256 deterministic JSON</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Defense Bus Propagation</span>
            <div className="text-xs font-mono text-cyan-300 font-bold mt-2 truncate">
              BROADCASTING TO :5173 & :5174
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Sub-second multi-portal alerting</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">PostGIS & Hash Security</span>
            <div className="text-xs font-mono text-teal-300 font-bold mt-2 truncate">
              TAMPER-EVIDENT LEDGER
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Zero Gas Fees • 100% Cryptographic</p>
          </div>
        </div>

        {/* 3D Neon Cyber Grid Canvas */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              3D Cyber Sentinel Mesh Grid
            </span>
            <span>Real-time Network Node Integrity & Threat Field</span>
          </div>
          <ThreeCyberGrid
            isUnderAttack={isUnderAttack}
            attackType={lastAttackData?.attack_type || securityAlert?.attack_type}
          />
        </section>

        {/* Tab 1: Attack Console + Matter.js Arena */}
        {activeTab === 'ATTACK_DEFENSE' ? (
          <div className="space-y-6">
            {/* Matter.js 2D Collision Arena */}
            <MatterPacketArena lastAttack={lastAttackData} />

            {/* Exploit Trigger Console */}
            <AttackConsole
              onAttackTriggered={handleAttackTriggered}
              availableRequisitions={requisitions}
            />
          </div>
        ) : (
          /* Tab 2: Ledger Inspector */
          <div className="space-y-6">
            <LedgerInspector />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 bg-slate-950">
        PharmaShield Tripartite Platform • Portal 3 (Cyber Attack & Defense Lab) • Port 5175
      </footer>
    </div>
  );
}
export default App;

