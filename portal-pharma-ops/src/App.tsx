import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Shield,
  Activity,
  Radio,
  AlertOctagon,
  XCircle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { ThreeSupplyFlow } from './components/ThreeSupplyFlow';
import { RequisitionTable, MedicalRequisition } from './components/RequisitionTable';
import { StockAllocation, InventoryItem } from './components/StockAllocation';

export function App() {
  const [requisitions, setRequisitions] = useState<MedicalRequisition[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'REQUISITIONS' | 'INVENTORY'>('REQUISITIONS');

  // Handle incoming WebSocket events
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    console.log('[OPS APP] WS Event received:', event.event_type, event);

    if (event.event_type === 'INITIAL_STATE' && event.data) {
      if (event.data.requisitions) setRequisitions(event.data.requisitions);
      if (event.data.inventory) setInventory(event.data.inventory);
    } else if (event.event_type === 'REQUISITION_CREATED' && event.data) {
      setRequisitions((prev) => {
        const exists = prev.some((r) => r.id === event.data.id);
        if (exists) return prev.map((r) => (r.id === event.data.id ? event.data : r));
        return [event.data, ...prev];
      });
    } else if (event.event_type === 'REQUISITION_AUTHORIZED' && event.data) {
      setRequisitions((prev) =>
        prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data } : r))
      );
      // Deduct inventory
      setInventory((prev) =>
        prev.map((inv) => {
          if (
            inv.resource_code === event.data.resource_code &&
            inv.facility_id === event.data.supplying_facility_id
          ) {
            const newQty = Math.max(0, inv.quantity - event.data.quantity);
            const newDos = newQty / 5.0; // daily consumption = 5.0
            return {
              ...inv,
              quantity: newQty,
              days_of_stock: newDos,
              is_critical: newDos <= 2.0,
            };
          }
          return inv;
        })
      );
    } else if (event.event_type === 'SECURITY_ALERT' && event.data) {
      if (event.data.requisition_id) {
        setRequisitions((prev) =>
          prev.map((r) =>
            r.id === event.data.requisition_id
              ? {
                  ...r,
                  status:
                    event.data.attack_type === 'TEMPERATURE_BREACH'
                      ? 'UNDER_REVIEW'
                      : 'TAMPER_REJECTED',
                }
              : r
          )
        );
      }
    }
  }, []);

  const { isConnected, lastEvent, securityAlert, clearAlert } = useWebSocketSync(handleWebSocketEvent);

  // Initial Fetch on component mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, invRes] = await Promise.all([
        fetch('/api/v1/requisitions'),
        fetch('/api/v1/inventory'),
      ]);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequisitions(reqData);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
      }
    } catch (err) {
      console.error('[OPS] Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Action: Authorize requisition with Ed25519 signature
  const handleAuthorize = async (reqId: string) => {
    try {
      const response = await fetch(`/api/v1/requisitions/${reqId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplying_facility_id: 'FAC-MAYAGANJ-01',
          authorized_by: 'Dr. R. K. Sinha (Chief Medical Officer)',
          batch_id: 'BATCH-2026-MAYAGANJ-ALPHA',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Authorization Failed: ${err.detail || 'Internal server error'}`);
        return;
      }

      const updated = await response.json();
      setRequisitions((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      console.error('Failed to authorize:', err);
      alert('Network error authorizing requisition.');
    }
  };

  // Metrics
  const pendingCount = requisitions.filter((r) => r.status === 'REQUESTED').length;
  const authorizedCount = requisitions.filter((r) => r.status === 'AUTHORIZED').length;
  const alertCount = requisitions.filter(
    (r) => r.status === 'TAMPER_REJECTED' || r.status === 'UNDER_REVIEW'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 🚨 Security Alert Banner (Cross-Portal Broadcast) */}
      {securityAlert && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 p-4 sticky top-0 z-50 backdrop-blur-md shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/40 animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-rose-200 flex items-center space-x-2">
                  <span>DEFENSE BUS INTERCEPTION: {securityAlert.attack_type || 'SECURITY ALERT'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/30 rounded-full font-mono text-rose-300">
                    STATUS: QUARANTINED
                  </span>
                </h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Target Requisition: <span className="font-mono font-bold text-rose-100">{securityAlert.requisition_id}</span> — {securityAlert.defense_action || 'Signature hash mismatch rejected by zero-trust gateway.'}
                </p>
              </div>
            </div>
            <button
              onClick={clearAlert}
              className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-lg border border-rose-700/60 transition-colors"
            >
              Acknowledge Alert
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-teal-400 rounded-xl shadow-lg shadow-cyan-500/20 text-slate-950 font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-100">PHARMASHIELD</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">
                  PORTAL 2 // OPS HUB
                </span>
                <span className="text-slate-500 text-xs font-mono">:5174</span>
              </div>
              <p className="text-[10px] text-slate-400">Bhagalpur Regional Medical Logistics & Authority Signer</p>
            </div>
          </div>

          {/* Center Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('REQUISITIONS')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'REQUISITIONS'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Live Requisition Queue</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-cyan-900 text-cyan-200 text-[10px] rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-colors ${
                activeTab === 'INVENTORY'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Depot Inventory & DOS</span>
            </button>
          </div>

          {/* Right Status / Connection */}
          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-700/50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
              <Radio
                className={`w-3.5 h-3.5 ${
                  isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="font-mono text-[11px] text-slate-300">
                {isConnected ? 'BUS CONNECTED (:8000)' : 'CONNECTING...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Top Operational Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Pending Approvals</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{pendingCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Requires Ed25519 digital signature</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Signed & Dispatched</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{authorizedCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Chained into SHA-256 Ledger</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Deflected Attacks</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{alertCount}</div>
            <p className="text-[10px] text-slate-500 mt-1">Quarantined by Defense Bus</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Central Authority Key</span>
            <div className="text-xs font-mono text-teal-300 font-bold mt-2 truncate">
              FAC-MAYAGANJ-01 [ED25519]
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Zero-Trust Cryptographic Core</p>
          </div>
        </div>

        {/* 3D Animated Supply Flow Canvas */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300">
              Interactive 3D Supply-Flow Topology
            </span>
            <span>Real-time Bhagalpur Medical Conduit Visualizer</span>
          </div>
          <ThreeSupplyFlow lastEvent={lastEvent} />
        </section>

        {/* Tab Content: Live Requisitions OR Stock Allocation */}
        {activeTab === 'REQUISITIONS' ? (
          <section className="space-y-4">
            <RequisitionTable
              requisitions={requisitions}
              onAuthorize={handleAuthorize}
              isLoading={isLoading}
            />
          </section>
        ) : (
          <section className="space-y-4">
            <StockAllocation inventory={inventory} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 bg-slate-950">
        PharmaShield Tripartite Platform • Portal 2 (Pharma Operations Hub) • Port 5174
      </footer>
    </div>
  );
}
export default App;

