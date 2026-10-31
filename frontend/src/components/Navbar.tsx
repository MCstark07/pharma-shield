import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Database, Lock, Radio, ExternalLink, Terminal } from 'lucide-react';

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
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
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
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-white">PharmaShield</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-full font-bold">
                  3D WebGL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Bhagalpur Regional Medical Grid</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
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
            {/* Direct Swagger API Docs link */}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
              title="Open Interactive Swagger UI API Docs"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium">LIVE 8000</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
