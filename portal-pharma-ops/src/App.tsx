import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  AlertOctagon,
  LogOut,
  RefreshCw,
  Wifi,
  Send,
  Building2,
  FileCheck2,
  Lock,
  ArrowRight,
  User,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { TripartiteNav } from './components/TripartiteNav';

interface VendorInfo {
  facilityId: string;
  facilityName: string;
  vendorName: string;
  roleTitle: string;
  depotType: string;
}

const VENDOR_PRESETS: VendorInfo[] = [
  {
    facilityId: 'fac_mayaganj',
    facilityName: 'Mayaganj Central Blood & Pharmaceutical Depot',
    vendorName: 'Dr. R. K. Sinha',
    roleTitle: 'Chief Logistics Officer',
    depotType: 'CENTRAL_BLOOD_DEPOT',
  },
  {
    facilityId: 'fac_sadar',
    facilityName: 'Sadar Hospital Depot Bhagalpur',
    vendorName: 'Dr. S. K. Verma',
    roleTitle: 'District Health Officer',
    depotType: 'DISTRICT_HOSPITAL_DEPOT',
  },
  {
    facilityId: 'fac_kolkata_hub',
    facilityName: 'Kolkata Central MediHub',
    vendorName: 'P. K. Banerjee',
    roleTitle: 'Regional Supply Director',
    depotType: 'INTER_STATE_WAREHOUSE',
  },
];

export function App() {
  // Pre-authenticated default vendor session
  const [currentVendor, setCurrentVendor] = useState<VendorInfo | null>(VENDOR_PRESETS[0]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'PENDING_APPROVALS' | 'APPROVED_HISTORY' | 'DEPOT_STOCK'>('PENDING_APPROVALS');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  // Fetch initial requisitions & inventory from backend
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, invRes] = await Promise.allSettled([
        fetch('/api/v1/requisitions'),
        fetch('/api/v1/depot-stocks'),
      ]);

      if (reqRes.status === 'fulfilled' && reqRes.value.ok) {
        setRequisitions(await reqRes.value.json());
      }
      if (invRes.status === 'fulfilled' && invRes.value.ok) {
        setInventory(await invRes.value.json());
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time synchronization via WebSocket bus
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    console.log('[VENDOR OPS] WS Event received:', event.event_type, event);

    if (event.event_type === 'INITIAL_STATE' && event.data?.requisitions) {
      setRequisitions(event.data.requisitions);
    } else if (
      event.event_type === 'REQUISITION_CREATED' ||
      event.event_type === 'PRESCRIPTION_REQUESTED' ||
      event.event_type === 'DOCTOR_PRESCRIPTION_APPROVED'
    ) {
      if (event.data) {
        setRequisitions((prev) => [event.data, ...prev.filter((r) => r.id !== event.data.id)]);
        setApprovalToast(
          `🔔 New incoming request #${event.data.id} for ${event.data.quantity} units of ${event.data.resource_code} from Patient on Port 5173!`
        );
        setTimeout(() => setApprovalToast(null), 8000);
      }
    } else if (event.event_type === 'REQUISITION_AUTHORIZED') {
      if (event.data) {
        setRequisitions((prev) =>
          prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data, status: 'AUTHORIZED' } : r))
        );
      }
    }
  }, []);

  const { isConnected } = useWebSocketSync(handleWebSocketEvent);

  // Handle Vendor Approval of an incoming request
  const handleApproveRequisition = async (reqId: string) => {
    if (!currentVendor) return;
    setApprovingId(reqId);

    const payload = {
      supplying_facility_id: currentVendor.facilityId,
      authorized_by: `${currentVendor.vendorName} (${currentVendor.facilityName})`,
      batch_id: `BATCH-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    try {
      const res = await fetch(`/api/v1/requisitions/${reqId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setRequisitions((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, ...updated, status: 'AUTHORIZED' } : r))
        );
        setApprovalToast(
          `✓ Successfully APPROVED & SIGNED Request #${reqId}! Applied Ed25519 signature & broadcast to Patient on Port 5173.`
        );
        setTimeout(() => setApprovalToast(null), 8000);
      } else {
        alert('Failed to authorize requisition.');
      }
    } catch (err) {
      console.error('Error authorizing requisition:', err);
      alert('Network error authorizing requisition.');
    } finally {
      setApprovingId(null);
    }
  };

  const pendingRequests = requisitions.filter((r) => r.status !== 'AUTHORIZED');
  const approvedRequests = requisitions.filter((r) => r.status === 'AUTHORIZED');

  // Render Vendor Login screen if logged out
  if (!currentVendor) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              PharmaShield Vendor Login
            </h1>
            <p className="text-xs text-slate-400">
              Sign in as an authorized depot officer to review and approve hospital requisitions.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono text-slate-400 block">SELECT VENDOR PRESET:</span>
            {VENDOR_PRESETS.map((vp) => (
              <button
                key={vp.facilityId}
                onClick={() => setCurrentVendor(vp)}
                className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer space-y-1"
              >
                <div className="text-sm font-bold text-white">{vp.facilityName}</div>
                <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                  <span>Officer: {vp.vendorName}</span>
                  <span className="text-amber-400">{vp.roleTitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Tripartite Command Strip */}
      <TripartiteNav currentPortal="LOGISTICS" isConnected={isConnected} />

      {/* Real-time Approval Toast */}
      {approvalToast && (
        <div className="bg-emerald-950/95 border-b-2 border-emerald-500 px-6 py-3.5 sticky top-0 z-50 backdrop-blur-md shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-mono text-emerald-200 font-medium">
              {approvalToast}
            </span>
          </div>
          <button
            onClick={() => setApprovalToast(null)}
            className="text-xs px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 rounded-lg border border-emerald-700 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Vendor Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
                PharmaShield <span className="text-amber-400">Vendor Operations Hub</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                PORT 5174
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Depot: <strong className="text-white">{currentVendor.facilityName}</strong> • {currentVendor.vendorName} ({currentVendor.roleTitle})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
            <span className={isConnected ? 'text-slate-300' : 'text-rose-400'}>
              {isConnected ? 'LIVE WEBSOCKET SYNC' : 'OFFLINE'}
            </span>
          </div>

          <button
            onClick={() => setCurrentVendor(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Depot</span>
          </button>
        </div>
      </header>

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-mono text-slate-400">AWAITING APPROVAL</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono flex items-center space-x-2">
              <span>{pendingRequests.length}</span>
              {pendingRequests.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pending requests submitted from Port 5173</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-mono text-slate-400">APPROVED & DISPATCHED</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
              {approvedRequests.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Chained with Ed25519 Digital Signatures</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <span className="text-xs font-mono text-slate-400">SIGNING AUTHORITY</span>
            <div className="text-sm font-bold text-white mt-2 font-mono">
              {currentVendor.facilityId}
            </div>
            <p className="text-[11px] text-cyan-400 mt-1">Zero-Trust Cryptographic Ledger Active</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 w-fit text-xs font-medium">
          <button
            onClick={() => setActiveTab('PENDING_APPROVALS')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'PENDING_APPROVALS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('APPROVED_HISTORY')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'APPROVED_HISTORY'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Approved History ({approvedRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPOT_STOCK')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'DEPOT_STOCK'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Depot Inventory Stock</span>
          </button>
        </div>

        {/* TAB 1: PENDING APPROVALS QUEUE */}
        {activeTab === 'PENDING_APPROVALS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <span>Incoming Patient Requisitions Awaiting Vendor Approval</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click "Approve & Dispatch Order" to apply your Ed25519 digital signature and notify the patient on Port 5173.
                </p>
              </div>

              <button
                onClick={fetchData}
                className="text-xs flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors font-mono cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Queue</span>
              </button>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                Loading incoming requisitions...
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-mono bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">All Clear! No Pending Requests</div>
                <div>When a patient submits a request in Port 5173, it will appear here in real time.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-base text-white">{req.id}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {req.urgency} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {req.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Requested: {new Date(req.created_at || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">REQUESTED RESOURCE</span>
                        <strong className="text-base text-cyan-300 block">{req.resource_code}</strong>
                        <span className="text-white font-bold">{req.quantity} Units Requested</span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">PATIENT / DESTINATION</span>
                        <strong className="text-white block">{req.patient_name || 'Patient'}</strong>
                        <span className="text-slate-400 block">{req.bed_number || 'Bed'} • {req.requesting_facility_id}</span>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-slate-500 block mb-1">CLINICAL NOTE</span>
                        <p className="text-slate-300 italic font-sans">
                          "{req.clinical_note || 'Emergency clinical supply request'}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <div className="text-xs text-slate-400 font-mono flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ready for Ed25519 signature by {currentVendor.vendorName}</span>
                      </div>

                      <button
                        onClick={() => handleApproveRequisition(req.id)}
                        disabled={approvingId === req.id}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {approvingId === req.id
                            ? 'Signing & Authorizing...'
                            : '✓ Approve & Dispatch Order'}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPROVED HISTORY */}
        {activeTab === 'APPROVED_HISTORY' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Cryptographically Authorized & Dispatched Orders</span>
            </h2>

            {approvedRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs bg-slate-900/40 rounded-3xl border border-slate-800">
                No orders approved yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 bg-slate-900/80 rounded-3xl border border-slate-800 p-6 shadow-xl">
                {approvedRequests.map((req) => (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{req.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          ✓ DISPATCHED & SIGNED
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        {req.quantity} Units of <strong className="text-cyan-300">{req.resource_code}</strong> for {req.patient_name} ({req.bed_number})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Signer: {req.authorized_by} • Batch: {req.batch_id || 'BATCH-PRIMARY'}
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs shrink-0 text-slate-400">
                      <div>Authorized: {new Date(req.authorized_at || Date.now()).toLocaleTimeString()}</div>
                      {req.event_hash && (
                        <div className="text-[10px] text-emerald-400">
                          Hash: {req.event_hash.slice(0, 16)}...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEPOT STOCK */}
        {activeTab === 'DEPOT_STOCK' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Boxes className="w-5 h-5 text-cyan-400" />
              <span>Depot Inventory Stock Levels ({currentVendor.facilityName})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.map((inv, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">{inv.resource_code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{inv.facility_id}</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {inv.quantity} <span className="text-xs text-slate-500 font-normal">Units</span>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Days of Stock: <strong>{inv.days_of_stock?.toFixed(1)}d</strong></span>
                    <span className={inv.is_critical ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {inv.is_critical ? 'CRITICAL SHORTAGE' : 'STABLE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-xs font-mono text-slate-500">
        PharmaShield Vendor Logistics Operations • Port 5174
      </footer>
    </div>
  );
}

export default App;
