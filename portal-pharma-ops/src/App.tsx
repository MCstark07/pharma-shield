import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Shield,
  Activity,
  Radio,
  AlertOctagon,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  Building2,
  CheckCircle2,
  Bell,
  ArrowRight,
  Sparkles,
  Lock,
  KeyRound,
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { VendorLoginModal, VendorInfo } from './components/VendorLoginModal';
import { ActiveOrderShowcase } from './components/ActiveOrderShowcase';
import { RequisitionTable, MedicalRequisition } from './components/RequisitionTable';
import { StockAllocation, InventoryItem } from './components/StockAllocation';
import { TripartiteNav } from './components/TripartiteNav';
import { ShipmentTrackingMap } from './components/ShipmentTrackingMap';
import { ThreeFreightLogistics } from './components/ThreeFreightLogistics';
import { UniversalMedicineFinderModal } from './components/UniversalMedicineFinderModal';
import { AIRebalanceModal } from './components/AIRebalanceModal';
import { ColdChainDispositionModal } from './components/ColdChainDispositionModal';
import { Navigation } from 'lucide-react';

export function App() {
  const [currentVendor, setCurrentVendor] = useState<VendorInfo | null>(null);
  const [requisitions, setRequisitions] = useState<MedicalRequisition[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE_ORDERS' | 'LIVE_SHIPMENTS' | 'ALL_REQUISITIONS' | 'INVENTORY'>('ACTIVE_ORDERS');
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);
  const [dispositionShipment, setDispositionShipment] = useState<any | null>(null);

  // Real-time Notification for Incoming Doctor-Approved Orders
  const [incomingNotification, setIncomingNotification] = useState<{
    id: string;
    resource: string;
    quantity: number;
    patientName: string;
    bedNumber: string;
    doctorName: string;
    facility: string;
  } | null>(null);

  // Dispatch Confirmation Toast
  const [dispatchSuccessToast, setDispatchSuccessToast] = useState<{
    id: string;
    resource: string;
    quantity: number;
    hash?: string;
    signature?: string;
  } | null>(null);

  // WebSocket sync
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    if (event.event_type === 'INITIAL_STATE' && event.data) {
      if (event.data.requisitions) setRequisitions(event.data.requisitions);
      if (event.data.inventory) setInventory(event.data.inventory);
    } else if (
      (event.event_type === 'DOCTOR_PRESCRIPTION_APPROVED' ||
        event.event_type === 'REQUISITION_CREATED' ||
        event.event_type === 'PRESCRIPTION_REQUESTED') &&
      event.data
    ) {
      setRequisitions((prev) => {
        const exists = prev.some((r) => r.id === event.data.id);
        if (exists) return prev.map((r) => (r.id === event.data.id ? event.data : r));
        return [event.data, ...prev];
      });

      // If doctor just approved or created an order awaiting vendor dispatch
      if (event.data.status === 'REQUESTED') {
        setIncomingNotification({
          id: event.data.id,
          resource: event.data.resource_code,
          quantity: event.data.quantity,
          patientName: event.data.patient_name || 'Rohit Kumar',
          bedNumber: event.data.bed_number || 'Bed #ICU-04',
          doctorName: event.data.prescribed_by || 'Dr. Ananya Sharma',
          facility: event.data.requesting_facility_id || 'FAC-JLNMCH-01',
        });
      }
    } else if (event.event_type === 'REQUISITION_AUTHORIZED' && event.data) {
      setRequisitions((prev) =>
        prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data } : r))
      );
      setInventory((prev) =>
        prev.map((inv) => {
          if (
            inv.resource_code === event.data.resource_code &&
            inv.facility_id === event.data.supplying_facility_id
          ) {
            const newQty = Math.max(0, inv.quantity - event.data.quantity);
            const newDos = newQty / 5.0;
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

  const { isConnected, securityAlert, clearAlert } = useWebSocketSync(handleWebSocketEvent);

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
      console.error('[OPS] Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuthorize = async (reqId: string) => {
    try {
      const response = await fetch(`/api/v1/requisitions/${reqId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplying_facility_id: currentVendor?.facilityId || 'FAC-MAYAGANJ-01',
          authorized_by: currentVendor?.vendorName || 'Dr. R. K. Sinha (Chief Medical Officer)',
          batch_id: `BATCH-2026-${currentVendor?.facilityId.split('-')[1] || 'MAYAGANJ'}-ALPHA`,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(`Authorization Failed: ${err.detail || 'Internal server error'}`);
        return;
      }

      const updated = await response.json();
      setRequisitions((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

      // Trigger Dispatch Confirmation Toast
      setDispatchSuccessToast({
        id: updated.id,
        resource: updated.resource_code,
        quantity: updated.quantity,
        hash: updated.event_hash,
        signature: updated.signature_hex,
      });

      // Clear incoming banner if it was for this req
      if (incomingNotification?.id === reqId) {
        setIncomingNotification(null);
      }

      setTimeout(() => setDispatchSuccessToast(null), 10000);
    } catch (err) {
      console.error('Failed to authorize:', err);
      alert('Network error authorizing requisition.');
    }
  };

  const pendingCount = requisitions.filter((r) => r.status === 'REQUESTED').length;
  const authorizedCount = requisitions.filter((r) => r.status === 'AUTHORIZED').length;

  // View 1: If not logged in, show Vendor Login Modal
  if (!currentVendor) {
    return <VendorLoginModal onLogin={(vendor) => setCurrentVendor(vendor)} />;
  }

  // View 2: Clean, Aesthetic Vendor Dashboard
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* PharmaShield Universal Tripartite Command Strip */}
      <TripartiteNav
        currentPortal="LOGISTICS"
        isConnected={isConnected}
        onOpenUniversalFinder={() => setIsFinderOpen(true)}
        onOpenRebalanceModal={() => setIsRebalanceOpen(true)}
      />
      {/* Real-time Security Alert Banner */}
      {securityAlert && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-3 sticky top-0 z-50 backdrop-blur-md flex items-center justify-between text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-bold text-rose-200">
              Zero-Trust Interception: {securityAlert.attack_type || 'SECURITY ALERT'}
            </span>
            <span className="text-rose-300/80 hidden sm:inline">
              — Requisition #{securityAlert.requisition_id} payload quarantined.
            </span>
          </div>
          <button
            onClick={clearAlert}
            className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-[10px] font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Modern Compact Navbar */}
      <header className="border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">PharmaShield</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  VENDOR
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentVendor.facilityName}
              </div>
            </div>
          </div>

          {/* Clean Segment Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab('LIVE_SHIPMENTS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'LIVE_SHIPMENTS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Shipments (GPS)</span>
            </button>

            <button
              onClick={() => setActiveTab('ACTIVE_ORDERS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ACTIVE_ORDERS'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Active Orders</span>
              {pendingCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('ALL_REQUISITIONS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ALL_REQUISITIONS'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('INVENTORY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'INVENTORY'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Depot Stock</span>
            </button>
          </div>

          {/* Right Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px]">{isConnected ? 'Live' : 'Syncing'}</span>
            </div>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setCurrentVendor(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
              title="Switch Vendor Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🔔 New Incoming Doctor-Approved Order Notification Bar */}
      {incomingNotification && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/90 border-b-2 border-cyan-500/80 px-4 py-3 sticky top-16 z-30 shadow-2xl animate-in slide-in-from-top-3 duration-300 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-cyan-300 tracking-tight">
                    🔔 NEW PRESCRIPTION APPROVED & TRANSMITTED:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono text-[10px] font-bold">
                    {incomingNotification.id}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5">
                  <strong>{incomingNotification.doctorName}</strong> approved <strong className="text-white">{incomingNotification.quantity} Units of {incomingNotification.resource}</strong> for {incomingNotification.patientName} ({incomingNotification.bedNumber}) at {incomingNotification.facility}.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setActiveTab('ACTIVE_ORDERS');
                  setIncomingNotification(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <span>Inspect & Dispatch Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIncomingNotification(null)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✓ Vendor Dispatch & Cryptographic Anchoring Confirmation Toast */}
      {dispatchSuccessToast && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b-2 border-emerald-500/80 px-4 py-3 sticky top-16 z-30 shadow-2xl animate-in slide-in-from-top-3 duration-300 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-300 tracking-tight">
                    ✓ ORDER DISPATCHED & CRYPTOGRAPHICALLY ANCHORED:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono text-[10px] font-bold">
                    #{dispatchSuccessToast.id}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5 font-mono">
                  Signed via Ed25519 Authority Key • Chained to SHA-256 Ledger Block {dispatchSuccessToast.hash ? `(${dispatchSuccessToast.hash.slice(0, 16)}...)` : ''} • Real-time dispatch telemetry streaming to Hospital Bedside.
                </div>
              </div>
            </div>

            <button
              onClick={() => setDispatchSuccessToast(null)}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Subtle Operational Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 text-[11px] block">Awaiting Dispatch</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{pendingCount} Orders</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 text-[11px] block">Authorized & Chained</span>
              <span className="text-base font-bold text-emerald-400 font-mono">{authorizedCount} Dispatched</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 text-[11px] block">Active Signer</span>
              <span className="text-xs font-semibold text-slate-300">{currentVendor.vendorName}</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Ed25519 Authority: {currentVendor.facilityId}</span>
          </div>
        </div>

        {/* Tab 0: Live Medical Shipment Tracking & Cold-Chain Telemetry */}
        {activeTab === 'LIVE_SHIPMENTS' && (
          <div className="space-y-6">
            <ThreeFreightLogistics
              shipmentStatus={requisitions[0]?.status || 'IN_TRANSIT'}
              temperature={requisitions[0]?.temperature_celsius || 4.1}
            />
            <ShipmentTrackingMap
              onOpenDispositionModal={(s) => setDispositionShipment(s)}
            />
          </div>
        )}

        {/* Tab 1: Focused Active Orders Showcase */}
        {activeTab === 'ACTIVE_ORDERS' && (
          <ActiveOrderShowcase
            requisitions={requisitions}
            currentVendor={currentVendor}
            onAuthorize={handleAuthorize}
            isLoading={isLoading}
          />
        )}

        {/* Tab 2: Requisition Table History */}
        {activeTab === 'ALL_REQUISITIONS' && (
          <RequisitionTable
            requisitions={requisitions}
            onAuthorize={handleAuthorize}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Depot Stock Allocation */}
        {activeTab === 'INVENTORY' && (
          <StockAllocation inventory={inventory} />
        )}
      </main>

      {/* Modals for Problem 2, 3, 4, 6 */}
      <UniversalMedicineFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
      />
      <AIRebalanceModal
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
        onActionComplete={fetchData}
      />
      <ColdChainDispositionModal
        isOpen={!!dispositionShipment}
        shipment={dispositionShipment}
        onClose={() => setDispositionShipment(null)}
        onDispositionRecorded={(res) => {
          fetchData();
          setDispatchSuccessToast({
            id: res.shipment_id,
            resource: 'COLD_CHAIN_DISPOSITION',
            quantity: 1,
            hash: res.event_hash,
            signature: res.signature_hex,
          });
        }}
      />

      {/* Subtle Minimal Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-600">
        PharmaShield • Vendor Dispatch Hub • Port 5174
      </footer>
    </div>
  );
}

export default App;
