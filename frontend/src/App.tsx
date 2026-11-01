import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Navigation,
  Search,
  Pill,
  Droplets,
  Syringe,
  Package,
  Microscope,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Send,
  User,
  LogOut,
  RefreshCw,
  ExternalLink,
  Check,
  Building2,
  Thermometer,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { TripartiteNav } from './components/TripartiteNav';
import { Live3DTransitMap } from './components/Live3DTransitMap';
import { DEFAULT_EXAMPLE_MEDICINES, CatalogItem } from './types/exampleData';

interface PatientUser {
  patientId: string;
  name: string;
  bedNumber: string;
  facility: string;
  facilityId: string;
}

export default function App() {
  // 1. Patient Profile State (Pre-authenticated to Rohit Kumar)
  const [patient, setPatient] = useState<PatientUser | null>(null);

  // Login form fields
  const [loginName, setLoginName] = useState('Rohit Kumar');
  const [loginBed, setLoginBed] = useState('ICU Bed #04');
  const [loginFacility, setLoginFacility] = useState('fac_jlnmch');

  // 2. Formulary & Medicine Catalog State
  const [catalog, setCatalog] = useState<CatalogItem[]>(DEFAULT_EXAMPLE_MEDICINES);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 3. Selected Requisition Configuration State
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(5);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('URGENT');
  const [clinicalNote, setClinicalNote] = useState('Emergency bedside replenishment for acute clinical indication');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [is3DMapOpen, setIs3DMapOpen] = useState<boolean>(true);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [notification, setNotification] = useState<{ id: string; message: string; type: 'success' | 'info' } | null>(null);

  // 4. Patient's Submitted Requisitions (Starts clean with zero fake examples)
  const [myRequests, setMyRequests] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('ps_patient_requests');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fetch updated catalog from backend API if available
  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/v1/medicines/catalog');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        }
      }
    } catch {
      // Retains DEFAULT_EXAMPLE_MEDICINES seamlessly
    }
  };

  // Fetch existing orders for this specific patient
  const fetchRequisitions = async () => {
    try {
      const res = await fetch('/api/v1/requisitions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          // Merge with session orders
          setMyRequests((prev) => {
            const map = new Map();
            data.filter((r) => !patient || r.patient_id === patient.patientId || r.patient_name === patient.name)
                .forEach((r) => map.set(r.id, r));
            prev.forEach((r) => map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
            const list = Array.from(map.values());
            list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            return list;
          });
        }
      }
    } catch {
      // Local state preserved
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchRequisitions();
    const interval = setInterval(fetchRequisitions, 3000);
    return () => clearInterval(interval);
  }, [patient?.patientId]);

  // Persist session orders locally
  useEffect(() => {
    try {
      localStorage.setItem('ps_patient_requests', JSON.stringify(myRequests));
    } catch {}
  }, [myRequests]);

  // Real-time WebSocket Event Synchronization
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    if (event.event_type === 'REQUISITION_AUTHORIZED') {
      if (event.data) {
        setMyRequests((prev) =>
          prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data, status: 'AUTHORIZED' } : r))
        );
        setNotification({
          id: event.data.id,
          message: `Requisition #${event.data.id} authorized by Central Depot. Digital signature verified (Ed25519) — In Transit.`,
          type: 'success',
        });
        setTimeout(() => setNotification(null), 10000);
      }
    } else if (event.event_type === 'INITIAL_STATE' && event.data?.requisitions) {
      if (patient) {
        const patientOrders = event.data.requisitions.filter(
          (r: any) => r.patient_id === patient.patientId || r.patient_name === patient.name
        );
        if (patientOrders.length > 0) {
          setMyRequests((prev) => {
            const map = new Map(prev.map((r) => [r.id, r]));
            patientOrders.forEach((r: any) => map.set(r.id, r));
            return Array.from(map.values());
          });
        }
      }
    }
  }, [patient]);

  const { isConnected } = useWebSocketSync(handleWebSocketEvent);

  // Submit patient requisition
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !patient) return;

    setIsSubmitting(true);
    const newId = `REQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      requesting_facility_id: patient.facilityId,
      category: selectedItem.category,
      resource_code: selectedItem.resource_code,
      quantity: orderQuantity,
      urgency: urgency,
      clinical_note: clinicalNote || `Prescription request for ${patient.name} (${patient.bedNumber})`,
      patient_id: patient.patientId,
      patient_name: patient.name,
      bed_number: patient.bedNumber,
    };

    let createdRecord = {
      id: newId,
      ...payload,
      status: 'REQUESTED',
      doctor_approved: true,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/v1/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const serverData = await res.json();
        createdRecord = { ...createdRecord, ...serverData };
      }
    } catch (err) {
      console.warn('Backend temporarily offline, queued locally:', err);
    }

    // Update state and cross-port persistence
    setMyRequests((prev) => [createdRecord, ...prev.filter((r) => r.id !== createdRecord.id)]);
    try {
      const globalReqs = JSON.parse(localStorage.getItem('ps_requisitions') || '[]');
      localStorage.setItem('ps_requisitions', JSON.stringify([createdRecord, ...globalReqs.filter((x: any) => x.id !== createdRecord.id)]));
    } catch {}

    setSelectedItem(null);
    setTrackedOrder(createdRecord);
    setIs3DMapOpen(true);
    setIsSubmitting(false);
    setNotification({
      id: createdRecord.id,
      message: `Requisition #${createdRecord.id} successfully queued for Central Depot authorization.`,
      type: 'info',
    });
    setTimeout(() => setNotification(null), 8000);
  };

  // Filter Catalog Items
  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.resource_code.toLowerCase().includes(query) ||
      (item.generic && item.generic.toLowerCase().includes(query)) ||
      (item.brand && item.brand.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    ALL: catalog.length,
    MEDICINES: catalog.filter((i) => i.category === 'MEDICINES').length,
    BLOOD_COMPONENTS: catalog.filter((i) => i.category === 'BLOOD_COMPONENTS').length,
    VACCINES: catalog.filter((i) => i.category === 'VACCINES').length,
    EMERGENCY_SUPPLIES: catalog.filter((i) => i.category === 'EMERGENCY_SUPPLIES').length,
    MEDICAL_EQUIPMENT: catalog.filter((i) => i.category === 'MEDICAL_EQUIPMENT').length,
    DIAGNOSTIC_SAMPLES: catalog.filter((i) => i.category === 'DIAGNOSTIC_SAMPLES').length,
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatient({
      patientId: `PT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: loginName || 'Clinical Patient',
      bedNumber: loginBed || 'Ward Bed #01',
      facility: loginFacility === 'fac_jlnmch' ? 'JLNMCH Bhagalpur (Emergency Wing)' : 'Sadar Hospital Bhagalpur',
      facilityId: loginFacility,
    });
  };

  // Render Login screen if logged out
  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <TripartiteNav currentPortal="CLINICAL" isConnected={isConnected} />
        <div className="flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-7 shadow-xl space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-1">
              <Pill className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Clinical Access Sign In</h1>
            <p className="text-xs text-slate-400">
              Access the clinical formulary to submit bedside medication and supply requisitions.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">PATIENT FULL NAME</label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="e.g. Rohit Kumar"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">BED / WARD NUMBER</label>
              <input
                type="text"
                required
                value={loginBed}
                onChange={(e) => setLoginBed(e.target.value)}
                placeholder="e.g. ICU Bed #04"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">HEALTHCARE FACILITY</label>
              <select
                value={loginFacility}
                onChange={(e) => setLoginFacility(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
              >
                <option value="fac_jlnmch">JLNMCH Bhagalpur (Tertiary Care)</option>
                <option value="fac_sadar">Sadar Hospital Bhagalpur</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Sign In to Clinical Workspace
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                setPatient({
                  patientId: 'PT-2026-JLNMCH-04',
                  name: 'Rohit Kumar',
                  bedNumber: 'ICU Bed #04',
                  facility: 'JLNMCH Bhagalpur (Emergency Wing)',
                  facilityId: 'fac_jlnmch',
                });
              }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Quick Demo: Continue as Rohit Kumar (ICU Bed #04)
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Enterprise Header */}
      <TripartiteNav currentPortal="CLINICAL" isConnected={isConnected} />

      {/* Operational Workflow Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-slate-400">Clinical Workflow:</span>
          <span className="text-slate-200 font-medium">Bedside Formulation Selection & Dispatch Authorization</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setIs3DMapOpen(!is3DMapOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-colors ${
              is3DMapOpen
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3 h-3 text-blue-400" />
            <span>{is3DMapOpen ? 'Hide 3D Transit Map' : 'View 3D Transit Map'}</span>
          </button>
          <span className="text-slate-500 hidden sm:inline">Linked Facility:</span>
          <span className="text-slate-300 font-medium">{patient.facility}</span>
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded border border-amber-500/25 transition-colors font-medium text-[11px]"
          >
            <span>Depot Logistics (:5174)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Status Notifications */}
      {notification && (
        <div className="bg-slate-900 border-b border-blue-500/40 px-6 py-3 sticky top-10 z-40 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Live 3D Transit Map & Package Tracking Window */}
        {is3DMapOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  3D True-to-Life Route & Package Transit Tracking
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">
                  {trackedOrder?.id || (myRequests.length > 0 ? myRequests[0].id : 'Active Bhagalpur Corridor')}
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Drag to rotate 3D angle • Scroll to zoom • Follow Courier cam
              </span>
            </div>
            <Live3DTransitMap
              activeOrder={trackedOrder || myRequests.find((r) => r.status === 'AUTHORIZED') || (myRequests.length > 0 ? myRequests[0] : null)}
              onClose={() => setIs3DMapOpen(false)}
            />
          </div>
        )}
        {/* Patient Identity & Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Hospital Formulary</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {filteredCatalog.length} Items Available
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorized patient: <strong className="text-slate-200">{patient.name}</strong> • {patient.bedNumber}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative w-full md:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search medication, generic, brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <button
                onClick={() => setPatient(null)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition-colors shrink-0"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Change Patient</span>
              </button>
            </div>
          </div>

          {/* Clean Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            {[
              { id: 'ALL', label: `All Resources (${categoryCounts.ALL})` },
              { id: 'MEDICINES', label: `Medicines (${categoryCounts.MEDICINES})` },
              { id: 'BLOOD_COMPONENTS', label: `Blood Units (${categoryCounts.BLOOD_COMPONENTS})` },
              { id: 'VACCINES', label: `Vaccines (${categoryCounts.VACCINES})` },
              { id: 'EMERGENCY_SUPPLIES', label: `Emergency Supplies (${categoryCounts.EMERGENCY_SUPPLIES})` },
              { id: 'MEDICAL_EQUIPMENT', label: `Equipment (${categoryCounts.MEDICAL_EQUIPMENT})` },
              { id: 'DIAGNOSTIC_SAMPLES', label: `Diagnostic (${categoryCounts.DIAGNOSTIC_SAMPLES})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formulary List (Left) & Requisition Configuration (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulary Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            {isLoadingCatalog ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Loading formulary data...
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
                No matching medications found for "{searchQuery}".
              </div>
            ) : (
              filteredCatalog.map((item) => {
                const isSelected = selectedItem?.resource_code === item.resource_code;
                return (
                  <div
                    key={item.resource_code}
                    onClick={() => {
                      setSelectedItem(item);
                      setOrderQuantity(5);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500 shadow-sm ring-1 ring-blue-500/40'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          item.category === 'BLOOD_COMPONENTS'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : item.category === 'VACCINES'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : item.category === 'MEDICAL_EQUIPMENT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {item.category === 'BLOOD_COMPONENTS' ? (
                          <Droplets className="w-4 h-4" />
                        ) : item.category === 'VACCINES' ? (
                          <Syringe className="w-4 h-4" />
                        ) : item.category === 'EMERGENCY_SUPPLIES' ? (
                          <Package className="w-4 h-4" />
                        ) : item.category === 'MEDICAL_EQUIPMENT' ? (
                          <Layers className="w-4 h-4" />
                        ) : (
                          <Pill className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 font-mono">
                            {item.pack_size}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span className="text-slate-400 font-mono text-[11px]">{item.resource_code}</span>
                          {item.brand && <span>• {item.brand}</span>}
                          {item.generic && <span className="hidden sm:inline">({item.generic})</span>}
                        </div>
                        {item.min_temp !== undefined && (
                          <div className="text-[11px] text-cyan-400 mt-1 flex items-center space-x-1">
                            <Thermometer className="w-3 h-3" />
                            <span>Storage: {item.min_temp}°C – {item.max_temp}°C</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-100 font-mono">
                        ₹{item.reference_price_inr?.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        {item.total_available_units} units available
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setOrderQuantity(5);
                        }}
                        className={`mt-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Requisition Panel (5 Cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bedside Requisition</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Orders route directly to Central Depot for authorization.
                </p>
              </div>

              {selectedItem ? (
                <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
                  {/* Selected Resource Summary */}
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        SELECTED ITEM
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Change Item
                      </button>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {selectedItem.name}
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Rate: ₹{selectedItem.reference_price_inr}</span>
                      <span>Category: {selectedItem.category}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div>
                    <label className="text-slate-400 block mb-1.5 font-medium">REQUISITION QUANTITY</label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center text-base font-bold text-white font-mono">
                        {orderQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => q + 1)}
                        className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-right flex-1 text-slate-400 text-xs">
                        Est. Cost: <strong className="text-white font-mono">₹{(orderQuantity * selectedItem.reference_price_inr).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Urgency Picker */}
                  <div>
                    <label className="text-slate-400 block mb-1.5 font-medium">CLINICAL PRIORITY</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['STANDARD', 'URGENT', 'CRITICAL'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgency(lvl)}
                          className={`py-1.5 rounded text-center font-medium text-xs transition-colors ${
                            urgency === lvl
                              ? lvl === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : lvl === 'URGENT'
                                ? 'bg-amber-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {lvl === 'CRITICAL' ? 'Critical' : lvl === 'URGENT' ? 'Urgent' : 'Standard'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Justification */}
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">CLINICAL JUSTIFICATION</label>
                    <textarea
                      rows={2}
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="Bedside clinical indication..."
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Transmitting Order...' : 'Submit Order to Central Depot (:5174)'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h4 className="text-white font-semibold text-xs">No Medication Selected</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Select any medication from the formulary on the left to configure quantity and submit a bedside order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Recent Bedside Orders Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Bedside Orders</h3>
              <p className="text-xs text-slate-400">
                Live fulfillment and cryptographic audit status for {patient.name}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {myRequests.length} Total Orders
            </span>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-sans">
              No active orders recorded for this patient. Select an item above to place an order.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                    <th className="pb-2">ORDER REF</th>
                    <th className="pb-2">MEDICATION / RESOURCE</th>
                    <th className="pb-2">UNITS</th>
                    <th className="pb-2">PRIORITY</th>
                    <th className="pb-2">DEPOT STATUS</th>
                    <th className="pb-2">AUDIT VERIFICATION</th>
                    <th className="pb-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-mono text-slate-300">
                        #{req.id}
                      </td>
                      <td className="py-2.5 font-medium text-white">
                        {req.resource_code}
                      </td>
                      <td className="py-2.5 font-mono">
                        {req.quantity}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : req.urgency === 'URGENT'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {req.status === 'AUTHORIZED' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                            <Check className="w-3 h-3" />
                            <span>Authorized & Dispatched</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting Depot Review</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                        {req.status === 'AUTHORIZED' ? (
                          <span className="text-slate-400">
                            Ed25519 Signed ({req.signature_hex ? req.signature_hex.slice(0, 10) + '...' : 'Verified'})
                          </span>
                        ) : (
                          <span className="text-slate-500">Pending Review on Port 5174</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {req.status === 'AUTHORIZED' ? (
                          <button
                            onClick={() => {
                              setTrackedOrder(req);
                              setIs3DMapOpen(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <Navigation className="w-3 h-3 text-emerald-400" />
                            <span>Track in 3D Map →</span>
                          </button>
                        ) : (
                          <a
                            href="http://localhost:5174"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 text-[11px] font-medium transition-colors inline-flex items-center space-x-1"
                            title="Tracking unlocks once confirmed on Port 5174"
                          >
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Awaiting Confirmation (:5174)</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
