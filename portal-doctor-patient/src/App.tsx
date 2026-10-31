import React, { useState } from 'react';
import { ThreeBioVial } from './components/ThreeBioVial';
import { MatterSupplyDrop } from './components/MatterSupplyDrop';
import { EmergencyOrderForm } from './components/EmergencyOrderForm';
import { LoginModal } from './components/LoginModal';
import { PatientView } from './components/PatientView';
import { useWebSocketSync, WebSocketEvent } from './hooks/useWebSocketSync';
import {
  Shield,
  Activity,
  Wifi,
  AlertOctagon,
  CheckCircle2,
  Droplets,
  Thermometer,
  ExternalLink,
  LogOut,
  Stethoscope,
  User,
  RefreshCw,
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
    status: 'REQUESTED',
    temperature_celsius: 4.2,
  });

  const [physicsDropCount, setPhysicsDropCount] = useState<number>(1);

  // Real-time synchronization with central bus
  const { isConnected, securityAlert, clearAlert } = useWebSocketSync((event: WebSocketEvent) => {
    if (event.event_type === 'REQUISITION_AUTHORIZED') {
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
      : 'text-cyan-400 bg-cyan-950/80 border-cyan-500';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 🚨 Broadcast Security Alert Banner across the top */}
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
          {/* Real-time Bus Status */}
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

          {/* Quick Demo Switcher Button */}
          <button
            onClick={handleToggleRole}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            title="Switch between Doctor and Patient view"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to {currentUser.role === 'DOCTOR' ? 'Patient' : 'Doctor'}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700"
            title="Log Out to Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {currentUser.role === 'PATIENT' ? (
          /* ========================================================
             PATIENT VIEW
             ======================================================== */
          <PatientView
            activeRequisition={activeRequisition}
            userInfo={currentUser}
            onLogout={handleLogout}
          />
        ) : (
          /* ========================================================
             DOCTOR VIEW
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Left Column: 3D Bio-Vial & Matter.js Dispenser (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Three.js Bio-Vial */}
              <ThreeBioVial
                status={activeRequisition?.status || 'REQUESTED'}
                resourceCode={activeRequisition?.resource_code || 'O_POS_RBC'}
              />

              {/* Matter.js Physics Dispenser Drop */}
              <MatterSupplyDrop
                dropTriggerCount={physicsDropCount}
                category={activeRequisition?.category}
                isAuthorized={activeRequisition?.status === 'AUTHORIZED'}
              />

              {/* Real-time Order Summary Status Card */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 font-mono text-xs shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ACTIVE TRACKING:</span>
                  <span className="text-slate-200 font-bold">{activeRequisition?.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">STATUS:</span>
                  <span
                    className={`px-2 py-0.5 rounded border uppercase font-bold text-[10px] ${statusColor}`}
                  >
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
                {activeRequisition?.signature_hex && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-1">
                      ED25519 DIGITAL SIGNATURE:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono break-all bg-slate-950 p-1.5 rounded block border border-slate-800">
                      {activeRequisition.signature_hex}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Emergency Requisition Form & Doctor Hub (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <EmergencyOrderForm onOrderSubmitted={handleOrderSubmitted} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-xs font-mono text-slate-500">
        PharmaShield Multi-Portal Architecture • Securathon 2026 • Port 5173
      </footer>
    </div>
  );
}
