import React, { useState, useEffect } from 'react';
import { ThreeBioVial } from './components/ThreeBioVial';
import { ThreeMorphosNetwork } from './components/ThreeMorphosNetwork';
import { MatterSupplyDrop } from './components/MatterSupplyDrop';
import { EmergencyOrderForm } from './components/EmergencyOrderForm';
import { LoginModal } from './components/LoginModal';
import { PatientView } from './components/PatientView';
import { TripartiteNav } from './components/TripartiteNav';
import { UniversalMedicineFinderModal } from './components/UniversalMedicineFinderModal';
import { AIRebalanceModal } from './components/AIRebalanceModal';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import {
  Shield,
  Activity,
  Wifi,
  AlertOctagon,
  CheckCircle2,
  Droplets,
  Thermometer,
  LogOut,
  Stethoscope,
  User,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  MapPin,
  Pill,
  Syringe,
  Microscope,
  HeartPulse,
  Package,
} from 'lucide-react';

interface UserInfo {
  role: 'DOCTOR' | 'PATIENT';
  name: string;
  title: string;
  facility: string;
}

export default function App() {
  // Pre-authenticated default session for instant evaluation
  const [currentUser, setCurrentUser] = useState<UserInfo>({
    role: 'DOCTOR',
    name: 'Dr. Ananya Sharma',
    title: 'Chief of Trauma & Critical ICU Care',
    facility: 'JLNMCH Bhagalpur',
  });

  const [activeRequisition, setActiveRequisition] = useState<any>({
    id: 'REQ-2026-JLNMCH-001',
    category: 'BLOOD_COMPONENTS',
    resource_code: 'O_POS_RBC',
    quantity: 10,
    status: 'PRESCRIPTION_PENDING',
    patient_id: 'PT-2026-JLNMCH-04',
    patient_name: 'Rohit Kumar',
    bed_number: 'Bed #ICU-04',
    clinical_note: 'Severe acute blood loss trauma - Emergency O+ RBC transfusion needed',
    temperature_celsius: 4.2,
  });

  const [physicsDropCount, setPhysicsDropCount] = useState<number>(1);
  const [leftVisual, setLeftVisual] = useState<'BIO_VIAL' | 'MORPHOS_NETWORK'>('MORPHOS_NETWORK');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [doctorSuccessToast, setDoctorSuccessToast] = useState<string | null>(null);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Fetch initial requisition state from backend
  const fetchRequisition = async () => {
    try {
      const res = await fetch('/api/v1/requisitions');
      if (res.ok) {
        const reqs = await res.json();
        if (reqs && reqs.length > 0) {
          setActiveRequisition(reqs[0]);
        }
      }
    } catch (e) {
      console.warn('Could not fetch active requisitions:', e);
    }
  };

  useEffect(() => {
    fetchRequisition();
  }, []);

  // Real-time synchronization with central bus
  const { isConnected, securityAlert, clearAlert } = useWebSocketSync((event: WebSocketEvent) => {
    console.log('[CLINICAL WS] Event received:', event.event_type, event);

    if (event.event_type === 'INITIAL_STATE' && event.data?.requisitions?.length > 0) {
      setActiveRequisition(event.data.requisitions[0]);
    } else if (event.event_type === 'PRESCRIPTION_REQUESTED' && event.data) {
      setActiveRequisition(event.data);
    } else if (event.event_type === 'DOCTOR_PRESCRIPTION_APPROVED' && event.data) {
      setActiveRequisition(event.data);
      setPhysicsDropCount((c) => c + 1);
    } else if (event.event_type === 'REQUISITION_AUTHORIZED') {
      const data = event.data;
      setActiveRequisition(data);
      setPhysicsDropCount((c) => c + 1);
    } else if (event.event_type === 'SECURITY_ALERT') {
      setActiveRequisition((prev: any) => ({
        ...prev,
        status:
          event.data.attack_type === 'TEMPERATURE_BREACH'
            ? 'UNDER_REVIEW'
            : 'TAMPER_REJECTED',
      }));
    }
  });

  const handlePatientRequest = async (orderData: any) => {
    try {
      const res = await fetch('/api/v1/patient/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRequisition(data);
        setPhysicsDropCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Failed to submit prescription:', err);
    }
  };

  const handleDoctorApprove = async () => {
    if (!activeRequisition?.id) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/v1/doctor/prescriptions/${activeRequisition.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: 'Dr. Ananya Sharma',
          doctor_license: 'LIC-BH-8842-TRAUMA',
          clinical_notes: 'Clinically verified for emergency bedside infusion protocol',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRequisition(data);
        setDoctorSuccessToast(`Prescription for ${data.resource_code} signed & transmitted to Mayaganj Central Depot on Port 5174!`);
        setTimeout(() => setDoctorSuccessToast(null), 8000);
      }
    } catch (err) {
      console.error('Failed to approve prescription:', err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleOrderSubmitted = (order: any) => {
    setActiveRequisition(order);
    setPhysicsDropCount((c) => c + 1);
  };

  const handleToggleRole = () => {
    if (currentUser.role === 'DOCTOR') {
      setCurrentUser({
        role: 'PATIENT',
        name: 'Rohit Kumar',
        title: 'Bed #ICU-04 • Patient ID: PT-2026-JLNMCH-04',
        facility: 'JLNMCH Bhagalpur (Emergency Wing)',
      });
    } else {
      setCurrentUser({
        role: 'DOCTOR',
        name: 'Dr. Ananya Sharma',
        title: 'Chief of Trauma & Critical ICU Care',
        facility: 'JLNMCH Bhagalpur',
      });
    }
  };

  const statusColor =
    activeRequisition?.status === 'AUTHORIZED'
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500'
      : activeRequisition?.status === 'TAMPER_REJECTED' ||
        activeRequisition?.status === 'UNDER_REVIEW'
      ? 'text-rose-400 bg-rose-950/80 border-rose-500'
      : activeRequisition?.status === 'PRESCRIPTION_PENDING'
      ? 'text-amber-400 bg-amber-950/80 border-amber-500'
      : 'text-cyan-400 bg-cyan-950/80 border-cyan-500';

  return (
    <div className="min-h-screen bg-[#010001] text-[#F4F7FA] flex flex-col font-sans selection:bg-[#00D9FF] selection:text-black">
      {/* PharmaShield Universal Tripartite Command Strip */}
      <TripartiteNav
        currentPortal="CLINICAL"
        isConnected={isConnected}
        onOpenUniversalFinder={() => setIsFinderOpen(true)}
        onOpenRebalanceModal={() => setIsRebalanceOpen(true)}
      />

      {/* 🚨 Security Alert Banner */}
      {securityAlert && (
        <div className="bg-rose-950/95 border-b-2 border-rose-500 px-6 py-3.5 flex items-center justify-between text-rose-200 text-xs font-mono shadow-2xl animate-in slide-in-from-top duration-200 sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <span className="font-extrabold text-rose-200 text-sm uppercase tracking-wider flex items-center space-x-2">
                <span>🚨 ZERO-TRUST SECURITY DEFENSE INTERCEPTION</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/30 font-mono text-rose-300">
                  {securityAlert.attack_type || 'EXPLOIT BLOCKED'}
                </span>
              </span>
              <p className="text-rose-300/90 text-xs mt-0.5">
                Target Requisition <span className="font-bold text-white">{securityAlert.requisition_id}</span> compromised. Cryptographic assertion failed; payload deflected to quarantine.
              </p>
            </div>
          </div>
          <button
            onClick={clearAlert}
            className="px-3.5 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 uppercase font-bold text-xs border border-rose-700/60 transition-colors"
          >
            Acknowledge Alert
          </button>
        </div>
      )}

      {/* Main Clinical Navigation Bar */}
      <header className="border-b border-zinc-800/80 bg-[#09090D]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">
                PHARMASHIELD <span className="text-[#00D9FF]">MEDICAL INTELLIGENCE</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-cyan-900">
                PORT 5173
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  currentUser.role === 'DOCTOR'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}
              >
                {currentUser.role === 'DOCTOR' ? 'Physician Mode' : 'Patient Mode'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              {currentUser.name} • {currentUser.title}
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            <Wifi
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-[#00D9FF] animate-pulse' : 'text-rose-400'
              }`}
            />
            <span className={isConnected ? 'text-zinc-300' : 'text-rose-400'}>
              {isConnected ? 'BUS CONNECTED (:8000)' : 'RECONNECTING...'}
            </span>
          </div>

          <button
            onClick={handleToggleRole}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#00D9FF]/10 hover:bg-[#00D9FF]/20 text-cyan-300 border border-[#00D9FF]/30 transition-colors cursor-pointer"
            title="Switch between Doctor and Patient view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to {currentUser.role === 'DOCTOR' ? 'Patient POV' : 'Doctor POV'}</span>
          </button>
        </div>
      </header>

      {/* Morphos-Inspired Hero Section */}
      <section className="relative border-b border-zinc-800/80 bg-gradient-to-b from-[#090912] via-[#05050A] to-[#010001] px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/30 text-[#00D9FF] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTELLIGENT HEALTHCARE AVAILABILITY & VERIFIABLE LOGISTICS</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Healthcare resources should <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] via-[#247BFF] to-[#965BFF]">never be out of reach.</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto">
            Discover emergency medicines, compatible blood components, and cold-chain vaccines across Bihar, West Bengal, and Jharkhand with transparent landed cost intelligence.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto flex items-center gap-2 p-2 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl backdrop-blur-xl">
            <Search className="w-5 h-5 text-zinc-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search Remdesivir, O+ Blood, Insulin Glargine, Trauma Kits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setIsFinderOpen(true)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 font-sans"
            />
            <button
              onClick={() => setIsFinderOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00D9FF] to-[#247BFF] hover:from-[#00c2e6] hover:to-[#1f6ee6] text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 shrink-0"
            >
              <span>Universal Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Medical Resource Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: 'MEDICINES', label: 'Medicines', icon: Pill, count: '6 Batches' },
              { id: 'BLOOD_COMPONENTS', label: 'Blood Units (ABO)', icon: Droplets, count: 'Crisis Stock' },
              { id: 'VACCINES', label: 'Vaccines (2-8°C)', icon: Syringe, count: 'Continuous Telemetry' },
              { id: 'MEDICAL_EQUIPMENT', label: 'Medical Equipment', icon: HeartPulse, count: 'Calibrated' },
              { id: 'DIAGNOSTIC_SAMPLES', label: 'Diagnostic Samples', icon: Microscope, count: 'Transit Viable' },
              { id: 'EMERGENCY_SUPPLIES', label: 'Emergency Trauma', icon: Package, count: 'Critical Priority' },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setIsFinderOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-xs text-zinc-300 hover:text-white transition-all font-mono"
                >
                  <Icon className="w-3.5 h-3.5 text-[#00D9FF]" />
                  <span>{cat.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {currentUser.role === 'PATIENT' ? (
          <PatientView
            activeRequisition={activeRequisition}
            userInfo={currentUser}
            onLogout={() => {}}
            onRequestPrescription={handlePatientRequest}
          />
        ) : (
          <div className="space-y-6">
            {/* Step 2 Alert: Pending Patient Prescription Approval Card */}
            {activeRequisition?.status === 'PRESCRIPTION_PENDING' && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-2 border-amber-500/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase block">
                      ACTION REQUIRED // PATIENT PRESCRIPTION APPROVAL
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{activeRequisition.patient_name || 'Rohit Kumar'} ({activeRequisition.bed_number || 'Bed #ICU-04'})</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                        {activeRequisition.urgency}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Requested: <strong className="text-cyan-300">{activeRequisition.quantity} Units of {activeRequisition.resource_code}</strong> — "{activeRequisition.clinical_note}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDoctorApprove}
                  disabled={isApproving}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isApproving ? 'Authorizing & Signing...' : 'Approve & Sign Prescription (Dr. Ananya Sharma)'}</span>
                </button>
              </div>
            )}

            {/* Doctor Success Toast */}
            {doctorSuccessToast && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between shadow-xl animate-in fade-in duration-200 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{doctorSuccessToast}</span>
                </div>
              </div>
            )}

            {/* Grid Layout: Digital Twin & Requisition Dispatcher */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* Left Column: Morphos 3D Network & Bio-Vial & Matter.js Dispenser */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs font-mono">
                  <button
                    onClick={() => setLeftVisual('MORPHOS_NETWORK')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      leftVisual === 'MORPHOS_NETWORK'
                        ? 'bg-[#00D9FF] text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Morphos 3D Network</span>
                  </button>
                  <button
                    onClick={() => setLeftVisual('BIO_VIAL')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      leftVisual === 'BIO_VIAL'
                        ? 'bg-[#00D9FF] text-black font-bold shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>3D Bio-Vial</span>
                  </button>
                </div>

                {leftVisual === 'MORPHOS_NETWORK' ? (
                  <ThreeMorphosNetwork
                    urgency={activeRequisition?.urgency || 'CRITICAL'}
                    status={activeRequisition?.status || 'REQUESTED'}
                  />
                ) : (
                  <ThreeBioVial
                    status={activeRequisition?.status || 'REQUESTED'}
                    resourceCode={activeRequisition?.resource_code || 'O_POS_RBC'}
                  />
                )}

                <MatterSupplyDrop
                  dropTriggerCount={physicsDropCount}
                  category={activeRequisition?.category}
                  isAuthorized={activeRequisition?.status === 'AUTHORIZED'}
                />

                <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 space-y-3 font-mono text-xs shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">ACTIVE TRACKING:</span>
                    <span className="text-zinc-200 font-bold">{activeRequisition?.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[10px] ${statusColor}`}>
                      {activeRequisition?.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">COLD-CHAIN TEMPERATURE:</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      {activeRequisition?.temperature_celsius ?? 4.2}°C (Safe: 2-8°C)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Emergency Order Creator */}
              <div className="lg:col-span-7 space-y-6">
                <EmergencyOrderForm onOrderSubmitted={handleOrderSubmitted} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Universal Medicine Finder Modal */}
      <UniversalMedicineFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
      />

      {/* AI Stock Rebalance Modal */}
      <AIRebalanceModal
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/80 px-6 py-3 text-center text-xs font-mono text-zinc-500">
        PharmaShield Medical Intelligence • Port 5173 • Securathon 2026
      </footer>
    </div>
  );
}
