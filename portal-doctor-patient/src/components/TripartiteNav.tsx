import React from 'react';
import { Activity, Shield, Box, Zap, ExternalLink } from 'lucide-react';

interface TripartiteNavProps {
  currentPortal: 'CLINICAL' | 'LOGISTICS' | 'CYBER_LAB';
  isConnected: boolean;
  onOpenUniversalFinder?: () => void;
  onOpenRebalanceModal?: () => void;
}

export const TripartiteNav: React.FC<TripartiteNavProps> = ({
  currentPortal,
  isConnected,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-5 py-2.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm">
            PHARMASHIELD
          </span>
          <span className="hidden lg:inline text-slate-500 text-xs pl-2 border-l border-slate-800">
            Intelligent Medical Supply & Custody Network
          </span>
        </div>

        {/* Live Network Bus Indicator */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400' : 'bg-rose-400'
            }`}
          />
          <span className="text-[11px] font-mono text-slate-400">
            {isConnected ? 'Network Synchronized' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Portal Navigation Tabs */}
      <nav className="flex items-center space-x-1.5">
        <a
          href="http://localhost:5173"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
            currentPortal === 'CLINICAL'
              ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Clinical Requisitions (:5173)</span>
        </a>

        <a
          href="http://localhost:5174"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
            currentPortal === 'LOGISTICS'
              ? 'bg-amber-600/15 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Depot Logistics (:5174)</span>
        </a>

        <a
          href="http://localhost:5175"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-2 ${
            currentPortal === 'CYBER_LAB'
              ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Security Ledger (:5175)</span>
        </a>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center space-x-1.5 transition-colors border border-transparent"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </nav>
    </header>
  );
};
