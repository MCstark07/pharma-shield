import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, RefreshCw, AlertTriangle, Database, Lock, Radio } from 'lucide-react';

interface NavbarProps {
  hasCriticalAlert?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hasCriticalAlert = false }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Command Center', path: '/', icon: Activity },
    { label: 'Resource Exchange', path: '/exchange', icon: Database },
    { label: 'Security & Ledger', path: '/security', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800">
      {hasCriticalAlert && (
        <div className="bg-rose-500/15 border-b border-rose-500/40 text-rose-300 px-4 py-1.5 text-xs font-mono flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span className="font-semibold tracking-wide">CRITICAL DISPATCH ALERT:</span>
            <span>O+ Packed RBC stock depleted below 24h lead-time at JLNMCH Bhagalpur!</span>
          </div>
          <span className="uppercase text-[10px] tracking-wider bg-rose-500/30 px-2 py-0.5 rounded font-bold">
            Action Required
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white">PharmaShield</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                  v1.0 Ed25519
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Bhagalpur Regional Medical Grid</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">LIVE TELEMETRY</span>
            </div>
            <div className="text-slate-400 border-l border-slate-700 pl-3">
              Role: <span className="text-slate-200 font-semibold">Crisis Commander</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

