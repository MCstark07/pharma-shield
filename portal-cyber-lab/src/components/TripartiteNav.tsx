import React from 'react';
import { Activity, Shield, Box, Zap, ExternalLink, Globe2 } from 'lucide-react';

interface TripartiteNavProps {
  currentPortal: 'CLINICAL' | 'LOGISTICS' | 'CYBER_LAB';
  isConnected: boolean;
  onOpenUniversalFinder?: () => void;
  onOpenRebalanceModal?: () => void;
}

export const TripartiteNav: React.FC<TripartiteNavProps> = ({
  currentPortal,
  isConnected,
  onOpenUniversalFinder,
  onOpenRebalanceModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-4 py-2 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-2xl">
      {/* Brand & Ecosystem Tagline */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/30 text-lime-400 font-black tracking-widest text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-lime-400" />
            PHARMASHIELD
          </span>
          <span className="hidden md:inline text-slate-500 text-[11px] font-sans">
            Every medical resource. Available when it matters.
          </span>
        </div>

        {/* Live Backend Connection Indicator */}
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/60">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="text-[10px] text-slate-400">
            {isConnected ? 'BUS :8000 LIVE' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Cross-Portal Switcher Pills */}
      <div className="flex items-center space-x-1.5">
        <a
          href="http://localhost:5173"
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
            currentPortal === 'CLINICAL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Clinical Access: Bedside Requisition & Doctor Approval (:5173)"
        >
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Clinical (:5173)</span>
        </a>

        <a
          href="http://localhost:5174"
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
            currentPortal === 'LOGISTICS'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Pharma Operations & Logistics Hub (:5174)"
        >
          <Box className="w-3 h-3 text-amber-400" />
          <span>Logistics (:5174)</span>
        </a>

        <a
          href="http://localhost:5175"
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center space-x-1.5 ${
            currentPortal === 'CYBER_LAB'
              ? 'bg-lime-500/20 text-lime-300 border border-lime-500/40 shadow-sm shadow-lime-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
          }`}
          title="Cyber Attack & Defense Lab (:5175)"
        >
          <Zap className="w-3 h-3 text-lime-400" />
          <span>Cyber Lab (:5175)</span>
        </a>

        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="px-2 py-1 rounded-md text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/30 flex items-center space-x-1 transition-all"
          title="3D Flow Wave WebGL Interactive API Studio (:8000/docs)"
        >
          <span>3D Studio</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Global Quick Action Tool Buttons */}
      <div className="flex items-center space-x-2">
        {onOpenUniversalFinder && (
          <button
            onClick={onOpenUniversalFinder}
            className="px-2.5 py-1 rounded-md bg-lime-600 hover:bg-lime-500 text-black font-semibold text-[11px] flex items-center space-x-1 shadow-md transition-colors"
          >
            <Globe2 className="w-3 h-3 text-black" />
            <span>Universal Medicine Finder</span>
          </button>
        )}
        {onOpenRebalanceModal && (
          <button
            onClick={onOpenRebalanceModal}
            className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] flex items-center space-x-1 shadow-md transition-colors"
          >
            <Activity className="w-3 h-3" />
            <span>AI Rebalance</span>
          </button>
        )}
      </div>
    </header>
  );
};
