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
} from 'lucide-react';

interface UserInfo {
  role: 'DOCTOR' | 'PATIENT';
  name: string;
  title: string;
  facility: string;
}

export default function App() {
  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

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
      // Trigger physics drop in Matter.js canvas!
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

  // Step 1: Patient Submits Prescription Request
  const handlePatientRequest = async (resourceCode: string, qty: number, note: string) => {
    try {
      const res = await fetch('/api/v1/patient/prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 'PT-2026-JLNMCH-04',
          patient_name: 'Rohit Kumar',
          bed_number: 'Bed #ICU-04',
          facility_id: 'FAC-JLNMCH-01',
          category: resourceCode === 'INSULIN_GLARGINE' ? 'MEDICINES' : 'BLOOD_COMPONENTS',
          resource_code: resourceCode,
          quantity: qty,
          urgency: 'CRITICAL',
          patient_note: note,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRequisition(data);
      }
    } catch (err) {
      console.error('Failed to submit prescription:', err);
    }
  };

  // Step 2: Doctor Approves & Signs Prescription
  const handleDoctorApprove = async () => {
    if (!activeRequisition) return;
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

  const handleLogin = (
    role: 'DOCTOR' | 'PATIENT',
    info: { name: string; title: string; facility: string }
  ) => {
    setCurrentUser({
      role,
      name: info.name,
      title: info.title,
      facility: info.facility,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleToggleRole = () => {
    if (!currentUser) return;
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

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} />;
  }

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
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
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
                PHARMASHIELD <span className="text-cyan-400">CLINICAL</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
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
            <p className="text-xs text-slate-400 font-mono">
              {currentUser.name} • {currentUser.title}
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <Wifi
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'
              }`}
            />
            <span className={isConnected ? 'text-slate-300' : 'text-rose-400'}>
              {isConnected ? 'BUS CONNECTED (:8000)' : 'RECONNECTING...'}
            </span>
          </div>

          {/* Quick Demo Switcher Button: Seamlessly switch between Doctor and Patient */}
          <button
            onClick={handleToggleRole}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
            title="Switch between Doctor and Patient view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to {currentUser.role === 'DOCTOR' ? 'Patient POV' : 'Doctor POV'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700 cursor-pointer"
            title="Log Out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {currentUser.role === 'PATIENT' ? (
          /* ========================================================
             PATIENT VIEW (Step 1 of the Sequence)
             ======================================================== */
          <PatientView
            activeRequisition={activeRequisition}
            userInfo={currentUser}
            onLogout={handleLogout}
            onRequestPrescription={handlePatientRequest}
          />
        ) : (
          /* ========================================================
             DOCTOR VIEW (Step 2 of the Sequence)
             ======================================================== */
          <div className="space-y-6">
            {/* Step 2 Alert: Pending Patient Prescription Approval Card */}
            {activeRequisition?.status === 'PRESCRIPTION_PENDING' && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-300">
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
                    <p className="text-xs text-slate-300 mt-0.5">
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
                <div className="flex items-center justify-between p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setLeftVisual('MORPHOS_NETWORK')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      leftVisual === 'MORPHOS_NETWORK'
                        ? 'bg-cyan-500 text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Morphos 3D Network</span>
                  </button>
                  <button
                    onClick={() => setLeftVisual('BIO_VIAL')}
                    className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      leftVisual === 'BIO_VIAL'
                        ? 'bg-cyan-500 text-black font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
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

                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 font-mono text-xs shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ACTIVE TRACKING:</span>
                    <span className="text-slate-200 font-bold">{activeRequisition?.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[10px] ${statusColor}`}>
                      {activeRequisition?.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">COLD-CHAIN TEMPERATURE:</span>
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-xs font-mono text-slate-500">
        PharmaShield Multi-Portal Architecture • Clinical Portal • Port 5173
      </footer>
    </div>
  );
}
