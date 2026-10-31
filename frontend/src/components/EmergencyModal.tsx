import React, { useState } from 'react';
import { X, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { FacilityBase, ResourceCategory, UrgencyLevel, EmergencyRequestCreate } from '../types';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: FacilityBase[];
  onSubmit: (data: EmergencyRequestCreate) => Promise<void>;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  facilities,
  onSubmit,
}) => {
  const [requestingFacilityId, setRequestingFacilityId] = useState<string>(facilities[0]?.id || '');
  const [category, setCategory] = useState<ResourceCategory>(ResourceCategory.BLOOD_COMPONENTS);
  const [resourceCode, setResourceCode] = useState<string>('O_POS_RBC');
  const [quantity, setQuantity] = useState<number>(10);
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.CRITICAL);
  const [requiredHours, setRequiredHours] = useState<number>(2);
  const [clinicalNote, setClinicalNote] = useState<string>(
    'Emergency Trauma Unit: Massive blood loss protocol activated. Urgent compatible RBC units required.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const requiredBy = new Date(Date.now() + requiredHours * 3600 * 1000).toISOString();
      await onSubmit({
        requesting_facility_id: requestingFacilityId || facilities[0]?.id,
        category,
        resource_code: resourceCode,
        quantity: Number(quantity),
        urgency,
        required_by: requiredBy,
        clinical_note_redacted: clinicalNote,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit emergency requisition:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-lg text-white">Emergency Medical Requisition</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>
              <strong>HIPAA / Clinical Privacy Guardrail:</strong> Do not include identifiable patient names or MRNs. Redacted clinical context only.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Requesting Facility
              </label>
              <select
                value={requestingFacilityId}
                onChange={(e) => setRequestingFacilityId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.facility_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Resource Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ResourceCategory;
                  setCategory(cat);
                  if (cat === ResourceCategory.BLOOD_COMPONENTS) setResourceCode('O_POS_RBC');
                  else if (cat === ResourceCategory.MEDICINES) setResourceCode('INSULIN_GLARGINE');
                  else if (cat === ResourceCategory.VACCINES) setResourceCode('RABIES_VACCINE');
                  else if (cat === ResourceCategory.EMERGENCY_SUPPLIES) setResourceCode('TRAUMA_KIT');
                  else if (cat === ResourceCategory.MEDICAL_EQUIPMENT) setResourceCode('DEFIB_AED_PORTABLE');
                  else setResourceCode('SAMPLE_CSF_PATH');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(ResourceCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Resource Code
              </label>
              <input
                type="text"
                value={resourceCode}
                onChange={(e) => setResourceCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                placeholder="e.g. O_POS_RBC"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Quantity Units
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(UrgencyLevel).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Required Timeframe (Hours from now)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={requiredHours}
              onChange={(e) => setRequiredHours(parseFloat(e.target.value) || 1)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Redacted Clinical Context
            </label>
            <textarea
              rows={2}
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Clinical reason (de-identified)..."
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Triggering AI Match...' : 'Broadcast Emergency Requisition'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

