import React, { useState } from 'react';
import {
  Stethoscope,
  User,
  Shield,
  KeyRound,
  ArrowRight,
  Sparkles,
  Lock,
  Hospital,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface LoginModalProps {
  onLogin: (role: 'DOCTOR' | 'PATIENT', userInfo: { name: string; title: string; facility: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'DOCTOR' | 'PATIENT'>('DOCTOR');
  const [username, setUsername] = useState<string>('dr.ananya');
  const [password, setPassword] = useState<string>('••••••••');

  const handleRoleChange = (role: 'DOCTOR' | 'PATIENT') => {
    setSelectedRole(role);
    if (role === 'DOCTOR') {
      setUsername('dr.ananya');
    } else {
      setUsername('patient.rohit');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'DOCTOR') {
      onLogin('DOCTOR', {
        name: 'Dr. Ananya Sharma',
        title: 'Chief of Trauma & Critical ICU Care',
        facility: 'JLNMCH Bhagalpur',
      });
    } else {
      onLogin('PATIENT', {
        name: 'Rohit Kumar',
        title: 'Bed #ICU-04 • Patient ID: PT-2026-JLNMCH-04',
        facility: 'JLNMCH Bhagalpur (Emergency Wing)',
      });
    }
  };

  const handleQuickDoctor = () => {
    onLogin('DOCTOR', {
      name: 'Dr. Ananya Sharma',
      title: 'Chief of Trauma & Critical ICU Care',
      facility: 'JLNMCH Bhagalpur',
    });
  };

  const handleQuickPatient = () => {
    onLogin('PATIENT', {
      name: 'Rohit Kumar',
      title: 'Bed #ICU-04 • Patient ID: PT-2026-JLNMCH-04',
      facility: 'JLNMCH Bhagalpur (Emergency Wing)',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 font-black mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            PHARMASHIELD <span className="text-cyan-400">CLINICAL</span>
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Medical Logistics & Zero-Trust Verification Gateway
          </p>
        </div>

        {/* Role Selector Tabs (Doctor vs Patient) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => handleRoleChange('DOCTOR')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              selectedRole === 'DOCTOR'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('PATIENT')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
              selectedRole === 'PATIENT'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Login</span>
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              {selectedRole === 'DOCTOR' ? 'Doctor ID / Medical License' : 'Patient ID / Hospital Card'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Security Key / PIN</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>Enter as {selectedRole === 'DOCTOR' ? 'Physician' : 'Patient'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Buttons for Securathon Pitch */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block text-center">
            ⚡ Quick Demo 1-Click Access (Pitch Mode)
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleQuickDoctor}
              type="button"
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[11px]">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Dr. Ananya Sharma</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">ICU Head • JLNMCH</p>
            </button>

            <button
              onClick={handleQuickPatient}
              type="button"
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors group"
            >
              <div className="flex items-center space-x-1.5 text-teal-400 font-bold text-[11px]">
                <User className="w-3.5 h-3.5" />
                <span>Rohit Kumar (Pt)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Bed #ICU-04 • O+ RBC</p>
            </button>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 font-mono">
          <Lock className="w-3 h-3 text-cyan-400" />
          <span>Zero-Trust Ed25519 Cryptographic Guard Active</span>
        </div>
      </div>
    </div>
  );
};

