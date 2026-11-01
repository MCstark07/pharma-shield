import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  FileSignature,
  ShieldAlert,
  ThermometerSnowflake,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ColdChainDispositionModalProps {
  isOpen: boolean;
  shipment: any;
  onClose: () => void;
  onDispositionRecorded: (result: any) => void;
}

export const ColdChainDispositionModal: React.FC<ColdChainDispositionModalProps> = ({
  isOpen,
  shipment,
  onClose,
  onDispositionRecorded,
}) => {
  const [disposition, setDisposition] = useState<'CLEARED_WITH_OVERRIDE' | 'PERMANENTLY_REJECTED'>(
    'CLEARED_WITH_OVERRIDE'
  );
  const [inspectorName, setInspectorName] = useState('Dr. S. K. Verma (Chief Clinical Toxicologist)');
  const [inspectorLicense, setInspectorLicense] = useState('LIC-QC-9941-COLDCHAIN');
  const [justificationNotes, setJustificationNotes] = useState(
    'Thermal excursion logged at 14.8°C for 18 minutes. Evaluated under product stability curve; active biological efficacy retained.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !shipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/coldchain/disposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: shipment.id || 'ship_mayaganj_to_jlnmch',
          disposition,
          inspector_name: inspectorName,
          inspector_license: inspectorLicense,
          justification_notes: justificationNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onDispositionRecorded(data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to record disposition:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/50 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <ThermometerSnowflake className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
                <span>Qualified Cold-Chain Excursion Review</span>
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5 font-mono">
                Shipment {shipment.id} locked in UNDER_REVIEW
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Excursion Context Box */}
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs font-mono space-y-1.5">
            <div className="flex justify-between text-rose-300">
              <span>Threshold Violation:</span>
              <span className="font-bold text-rose-200">
                {shipment.current_temp || 14.8}°C (Safe: 2.0°C – 8.0°C)
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Resource Code:</span>
              <span className="text-white font-bold">{shipment.resource_code || 'VACCINES'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Zero-Trust Policy:</span>
              <span className="text-amber-300 font-bold">Never Auto-Clears Without Clinical Sign-Off</span>
            </div>
          </div>

          {/* Disposition Decision */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Authorized Clinical Disposition:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDisposition('CLEARED_WITH_OVERRIDE')}
                className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all text-left space-y-1 ${
                  disposition === 'CLEARED_WITH_OVERRIDE'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CLEARED W/ OVERRIDE</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">
                  Thermal buffer acceptable; dispatch authorized to recipient.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDisposition('PERMANENTLY_REJECTED')}
                className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all text-left space-y-1 ${
                  disposition === 'PERMANENTLY_REJECTED'
                    ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-950'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>PERMANENT REJECT</span>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">
                  Biological potency destroyed; deflect to biohazard quarantine.
                </p>
              </button>
            </div>
          </div>

          {/* Inspector Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Authorized Inspector Name
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Medical / QC License ID
              </label>
              <input
                type="text"
                value={inspectorLicense}
                onChange={(e) => setInspectorLicense(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          {/* Justification Notes */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Clinical Justification & Stability Audit Trail:
            </label>
            <textarea
              rows={3}
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center space-x-2"
            >
              <FileSignature className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing with Ed25519...' : 'Sign & Record Disposition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

