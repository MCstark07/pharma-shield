import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Pill,
  Droplets,
  Syringe,
  HeartPulse,
  Package,
  Microscope,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  User,
  LogOut,
  RefreshCw,
  Wifi,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Filter,
  Check,
  Building2,
  Stethoscope,
  Info
} from 'lucide-react';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import { TripartiteNav } from './components/TripartiteNav';
import { DEFAULT_EXAMPLE_MEDICINES, DEFAULT_EXAMPLE_REQUISITIONS } from './types/exampleData';

interface CatalogItem {
  resource_code: string;
  name: string;
  category: string;
  brand?: string;
  generic?: string;
  pack_size: string;
  min_temp?: number;
  max_temp?: number;
  reference_price_inr: number;
  total_available_units: number;
}

interface PatientUser {
  patientId: string;
  name: string;
  bedNumber: string;
  facility: string;
  facilityId: string;
}

export default function App() {
  // 1. Patient Authentication State (Pre-authenticated to Rohit Kumar)
  const [patient, setPatient] = useState<PatientUser | null>({
    patientId: 'PT-2026-JLNMCH-04',
    name: 'Rohit Kumar',
    bedNumber: 'ICU Bed #04',
    facility: 'JLNMCH Bhagalpur (Emergency Wing)',
    facilityId: 'fac_jlnmch',
  });

  // Login form fields
  const [loginName, setLoginName] = useState('Rohit Kumar');
  const [loginBed, setLoginBed] = useState('ICU Bed #04');
  const [loginFacility, setLoginFacility] = useState('fac_jlnmch');

  // 2. Big Medicine Catalog State
  const [catalog, setCatalog] = useState<CatalogItem[]>(DEFAULT_EXAMPLE_MEDICINES);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 3. Selected Medicine Requisition State
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(5);
  const [urgency, setUrgency] = useState<'CRITICAL' | 'URGENT' | 'STANDARD'>('URGENT');
  const [clinicalNote, setClinicalNote] = useState('High fever and acute infection - emergency ICU bedside replenishment needed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<{ id: string; message: string } | null>(null);

  // 4. Patient's Submitted Requests
  const [myRequests, setMyRequests] = useState<any[]>(DEFAULT_EXAMPLE_REQUISITIONS.filter(r => r.patient_id === 'PT-2026-JLNMCH-04'));

  // Fetch catalog from backend API
  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/v1/medicines/catalog');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCatalog(data);
        }
      }
    } catch (err) {
      console.log('Using robust client-side medicine catalog fallback');
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Fetch all requisitions to display in patient's tracker
  const fetchRequisitions = async () => {
    try {
      const res = await fetch('/api/v1/requisitions');
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requisitions:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchRequisitions();
  }, []);

  // Real-time synchronization with central WebSocket bus
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    console.log('[PATIENT PORTAL] WS Event received:', event.event_type, event);

    if (event.event_type === 'INITIAL_STATE' && event.data?.requisitions) {
      setMyRequests(event.data.requisitions);
    } else if (
      event.event_type === 'REQUISITION_CREATED' ||
      event.event_type === 'PRESCRIPTION_REQUESTED'
    ) {
      if (event.data) {
        setMyRequests((prev) => [event.data, ...prev.filter((r) => r.id !== event.data.id)]);
      }
    } else if (event.event_type === 'REQUISITION_AUTHORIZED') {
      if (event.data) {
        setMyRequests((prev) =>
          prev.map((r) => (r.id === event.data.id ? { ...r, ...event.data, status: 'AUTHORIZED' } : r))
        );
        setSelectedItem(null);
        setSuccessBanner({
          id: event.data.id,
          message: `🎉 Great news! Your request #${event.data.id} was just APPROVED by the Vendor Depot on Port 5174!`,
        });
        setTimeout(() => setSuccessBanner(null), 12000);
      }
    }
  }, []);

  const { isConnected } = useWebSocketSync(handleWebSocketEvent);

  // Submit patient requisition to the backend
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !patient) return;

    setIsSubmitting(true);
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

    try {
      const res = await fetch('/api/v1/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setMyRequests((prev) => [created, ...prev]);
        setSuccessBanner({
          id: created.id,
          message: `✓ Requisition #${created.id} submitted! Now visible in real-time on Vendor Portal (Port 5174).`,
        });
      } else {
        alert('Failed to submit requisition. Please check backend server.');
      }
    } catch (err) {
      console.error('Error submitting requisition:', err);
      alert('Network error submitting requisition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered catalog list
  const filteredCatalog = catalog.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.resource_code.toLowerCase().includes(query) ||
      (item.generic && item.generic.toLowerCase().includes(query)) ||
      (item.brand && item.brand.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  // Category counts
  const categoryCounts = {
    ALL: catalog.length,
    MEDICINES: catalog.filter((i) => i.category === 'MEDICINES').length,
    BLOOD_COMPONENTS: catalog.filter((i) => i.category === 'BLOOD_COMPONENTS').length,
    VACCINES: catalog.filter((i) => i.category === 'VACCINES').length,
    EMERGENCY_SUPPLIES: catalog.filter((i) => i.category === 'EMERGENCY_SUPPLIES').length,
    MEDICAL_EQUIPMENT: catalog.filter((i) => i.category === 'MEDICAL_EQUIPMENT').length,
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatient({
      patientId: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: loginName || 'Patient User',
      bedNumber: loginBed || 'General Ward #01',
      facility: loginFacility === 'fac_jlnmch' ? 'JLNMCH Bhagalpur' : 'Sadar Hospital Bhagalpur',
      facilityId: loginFacility,
    });
  };

  // If logged out, render clean Patient Login screen
  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
              <Pill className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              PharmaShield Patient Login
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to browse the medicine catalog and submit emergency requisitions.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                PATIENT FULL NAME
              </label>
              <input
                type="text"
                required
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="e.g. Rohit Kumar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                BED / WARD NUMBER
              </label>
              <input
                type="text"
                required
                value={loginBed}
                onChange={(e) => setLoginBed(e.target.value)}
                placeholder="e.g. ICU Bed #04"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                HOSPITAL FACILITY
              </label>
              <select
                value={loginFacility}
                onChange={(e) => setLoginFacility(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-cyan-500 outline-none"
              >
                <option value="fac_jlnmch">JLNMCH Bhagalpur (Tertiary Care)</option>
                <option value="fac_sadar">Sadar Hospital Bhagalpur</option>
                <option value="fac_siliguri_pharmacy">Siliguri Care Pharmacy</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Sign In to Patient Portal
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <span className="text-xs text-slate-500 block mb-2">QUICK DEMO PRESET</span>
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
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 font-mono transition-colors cursor-pointer"
            >
              Quick Login as Rohit Kumar (ICU Bed #04)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Tripartite Command Strip */}
      <TripartiteNav currentPortal="CLINICAL" isConnected={isConnected} />

      {/* Cross-Portal Live Workflow Guidance Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-500/40 px-6 py-2.5 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-cyan-200">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            <strong>STEP 1 OF 2:</strong> Select medicines from the list below and submit your request.
          </span>
          <span className="text-slate-400 hidden sm:inline">
            → Then open Vendor Operations on Port 5174 to approve it!
          </span>
        </div>

        <a
          href="http://localhost:5174"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/40 transition-colors font-bold"
        >
          <span>Open Vendor Portal (:5174)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Real-time Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-950/95 border-b-2 border-emerald-500 px-6 py-4 sticky top-0 z-50 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="text-sm font-bold text-white block">
                {successBanner.message}
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                Order ID: <strong className="text-white">#{successBanner.id}</strong> • Chained to WebSocket Event Bus
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Approve on Port 5174 →</span>
            </a>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-xs px-2.5 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 rounded-lg border border-emerald-700 font-mono"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
                PharmaShield <span className="text-cyan-400">Patient & Hospital Supply</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PORT 5173
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Patient: <strong className="text-white">{patient.name}</strong> • {patient.bedNumber} • {patient.facility}
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

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
          >
            <span>Vendor Portal (:5174)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setPatient(null)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Patient</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Section 1: Search & Category Filter Strip */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Select Medicines from Catalog</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {filteredCatalog.length} Items Available
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click on any medicine below to select it, adjust quantity, and submit an emergency request to the Vendor on Port 5174.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 focus-within:border-cyan-500">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search name, generic, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            {[
              { id: 'ALL', label: `All Items (${categoryCounts.ALL})` },
              { id: 'MEDICINES', label: `Medicines (${categoryCounts.MEDICINES})` },
              { id: 'BLOOD_COMPONENTS', label: `Blood Units (${categoryCounts.BLOOD_COMPONENTS})` },
              { id: 'VACCINES', label: `Vaccines (${categoryCounts.VACCINES})` },
              { id: 'EMERGENCY_SUPPLIES', label: `Emergency Supplies (${categoryCounts.EMERGENCY_SUPPLIES})` },
              { id: 'MEDICAL_EQUIPMENT', label: `Equipment (${categoryCounts.MEDICAL_EQUIPMENT})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Two-Column Split (Big List on Left, Request Form on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Big List of Medicines (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {isLoadingCatalog ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                Loading medicine catalog...
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
                No matching medicines found for "{searchQuery}".
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
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          item.category === 'BLOOD_COMPONENTS'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : item.category === 'VACCINES'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        }`}
                      >
                        {item.category === 'BLOOD_COMPONENTS' ? (
                          <Droplets className="w-5 h-5" />
                        ) : item.category === 'VACCINES' ? (
                          <Syringe className="w-5 h-5" />
                        ) : item.category === 'EMERGENCY_SUPPLIES' ? (
                          <Package className="w-5 h-5" />
                        ) : (
                          <Pill className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                            {item.pack_size}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center space-x-2 mt-0.5 font-mono">
                          <span className="text-cyan-400 font-bold">{item.resource_code}</span>
                          {item.brand && <span>• {item.brand}</span>}
                          {item.generic && <span className="hidden sm:inline">({item.generic})</span>}
                        </div>
                        {item.min_temp !== undefined && (
                          <div className="text-[10px] text-teal-300 mt-1 font-mono">
                            ❄️ Safe Temp: {item.min_temp}°C – {item.max_temp}°C
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-cyan-300 font-mono">
                        ₹{item.reference_price_inr?.toFixed(2)}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold">
                        {item.total_available_units} in Stock
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setOrderQuantity(5);
                        }}
                        className={`mt-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : '+ Select'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Requisition Request Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Create Supply Requisition</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orders are instantly pushed to Vendor Queue on Port 5174.
                  </p>
                </div>
              </div>

              {selectedItem ? (
                <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs font-mono">
                  {/* Selected Medicine Summary Card */}
                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                          SELECTED SUPPLY ITEM
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(null)}
                          className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                        >
                          ✕ Change Item
                        </button>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold">
                        {selectedItem.category}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white font-sans">
                      {selectedItem.name}
                    </div>
                    <div className="flex justify-between text-slate-300 text-xs">
                      <span>Unit Price: <strong>₹{selectedItem.reference_price_inr}</strong></span>
                      <span>Pack: {selectedItem.pack_size}</span>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div>
                    <label className="text-slate-400 block mb-1.5 font-bold">
                      REQUISITION QUANTITY (UNITS)
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-16 text-center text-xl font-bold text-white font-mono">
                        {orderQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => q + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="text-right flex-1 text-slate-400">
                        Total: <strong className="text-cyan-300 font-bold text-base">₹{(orderQuantity * selectedItem.reference_price_inr).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="text-slate-400 block mb-1.5 font-bold">CLINICAL URGENCY LEVEL</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['STANDARD', 'URGENT', 'CRITICAL'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgency(lvl)}
                          className={`py-2.5 rounded-xl text-center font-bold text-[10px] transition-all cursor-pointer ${
                            urgency === lvl
                              ? lvl === 'CRITICAL'
                                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                : lvl === 'URGENT'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Patient Info Summary */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Destination:</span>
                      <span className="text-white font-bold">{patient.facility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Patient:</span>
                      <span className="text-white">{patient.name} ({patient.bedNumber})</span>
                    </div>
                  </div>

                  {/* Clinical Justification Note */}
                  <div>
                    <label className="text-slate-400 block mb-1.5 font-bold">CLINICAL JUSTIFICATION NOTE</label>
                    <textarea
                      rows={2}
                      value={clinicalNote}
                      onChange={(e) => setClinicalNote(e.target.value)}
                      placeholder="e.g. Urgent post-op bedside replenishment"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmitting Request...' : 'Send Request to Vendor Depot (:5174)'}</span>
                  </button>
                </form>
              ) : (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/60 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
                    <Pill className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm font-sans">No Medicine Selected Yet</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Browse the 26 medicines in the catalog on the left and click <strong className="text-cyan-400">+ Select</strong> to choose a medicine and place your request.
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                    <span>👈 Select any medicine to start</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Live Requisition Status Tracker (Real-Time Updates from Port 5174) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>My Active Requisitions & Live Vendor Approval Tracker</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Status changes live when the vendor on Port 5174 approves your order.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRequisitions}
                className="text-xs flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-mono cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
              <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors font-mono font-bold"
              >
                <span>Vendor Portal →</span>
              </a>
            </div>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No requisitions submitted yet. Select a medicine above to create your first request!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {myRequests.map((req) => {
                const isApproved = req.status === 'AUTHORIZED';
                return (
                  <div key={req.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-white">{req.id}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          }`}
                        >
                          {isApproved ? '✓ APPROVED BY VENDOR (DISPATCHED)' : '🟡 AWAITING VENDOR APPROVAL (ON PORT 5174)'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {req.urgency}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Requested: <strong className="text-cyan-300 font-bold">{req.quantity} Units of {req.resource_code}</strong>
                        {req.patient_name && <span> • Patient: {req.patient_name} ({req.bed_number})</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        "{req.clinical_note}"
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs shrink-0">
                      {isApproved ? (
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-bold flex items-center space-x-1 justify-end">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Authorized with Ed25519</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Fulfilling Depot: {req.authorized_by || 'Mayaganj Central Depot'}
                          </span>
                        </div>
                      ) : (
                        <a
                          href="http://localhost:5174"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 font-bold transition-all"
                        >
                          <span>Approve on Port 5174</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-xs font-mono text-slate-500">
        PharmaShield Patient & Clinical Supply Portal • Port 5173
      </footer>
    </div>
  );
}
