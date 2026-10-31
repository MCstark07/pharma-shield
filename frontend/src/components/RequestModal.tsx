import React, { useState } from 'react';
import { X, Send, AlertCircle, ShieldAlert } from 'lucide-react';
import { Facility, ResourceCategory, UrgencyLevel, MedicalRequest } from '../types';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  onSubmitRequest: (request: Partial<MedicalRequest>) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  facilities,
  onSubmitRequest,
}) => {
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [category, setCategory] = useState<ResourceCategory>('BLOOD_COMPONENTS');
  const [resourceCode, setResourceCode] = useState('O_POS_RBC');
  const [quantity, setQuantity] = useState(5);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [clinicalNote, setClinicalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categoryPresets: Record<ResourceCategory, { code: string; label: string }[]> = {
    BLOOD_COMPONENTS: [
      { code: 'O_POS_RBC', label: 'O+ Red Blood Cells (Packed)' },
      { code: 'A_POS_RBC', label: 'A+ Red Blood Cells (Packed)' },
      { code: 'B_POS_RBC', label: 'B+ Red Blood Cells (Packed)' },
      { code: 'AB_POS_RBC', label: 'AB+ Red Blood Cells (Packed)' },
      { code: 'O_NEG_RBC', label: 'O- Universal Donor RBC' },
      { code: 'SINGLE_DONOR_PLATELET', label: 'Single Donor Platelets (SDP)' },
    ],
    MEDICINES: [
      { code: 'INSULIN_GLARGINE', label: 'Insulin Glargine 100 IU/mL' },
      { code: 'CEFTRIAXONE_1G', label: 'Ceftriaxone Sodium Injection 1g' },
      { code: 'NOREPINEPHRINE_4MG', label: 'Norepinephrine Bitartrate 4mg/2mL' },
    ],
    VACCINES: [
      { code: 'RABIES_VACCINE_PVRV', label: 'Rabies PVRV Vaccine (2-8°C)' },
      { code: 'HEPATITIS_B_VACCINE', label: 'Hepatitis-B Recombinant Vaccine' },
      { code: 'TETANUS_TOXOID', label: 'Tetanus Toxoid Adsorbed' },
    ],
    MEDICAL_EQUIPMENT: [
      { code: 'PORTABLE_VENTILATOR_V1', label: 'Transport Ventilator (Calibrated)' },
      { code: 'INFUSION_PUMP_VOLUMETRIC', label: 'Volumetric Infusion Pump' },
      { code: 'BIPAP_NON_INVASIVE', label: 'BiPAP Non-Invasive Support Unit' },
    ],
    DIAGNOSTIC_SAMPLES: [
      { code: 'CEREBROSPINAL_FLUID_CSF', label: 'CSF Infectious Pathology Specimen' },
      { code: 'BIOPSY_FROZEN_SECTION', label: 'Urgent Frozen Section Biopsy' },
    ],
    EMERGENCY_SUPPLIES: [
      { code: 'TRAUMA_KIT_LEVEL1', label: 'Level-1 Tactical Trauma Kit' },
      { code: 'ANTI_VENOM_POLYVALENT', label: 'Polyvalent Snake Antivenom IP' },
      { code: 'BURN_DRESSING_HYDROGEL', label: 'Sterile Hydrogel Burn Dressing' },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedPreset = categoryPresets[category]?.find(p => p.code === resourceCode);
    const selectedFacility = facilities.find(f => f.id === facilityId);

    const payload: Partial<MedicalRequest> = {
      id: `req_${Date.now().toString(36)}`,
      requesting_facility_id: facilityId,
      requesting_facility_name: selectedFacility?.name || 'Local Hospital',
      category,
      resource_code: resourceCode,
      resource_name: selectedPreset?.label || resourceCode,
      quantity: Number(quantity),
      urgency,
      required_by: new Date(Date.now() + 3600000 * 2).toISOString(),
      clinical_note_redacted: clinicalNote.trim() || 'Urgent clinical replenishment request.',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      onSubmitRequest(payload);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/60 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">Initiate Emergency Requisition</h2>
              <p className="text-xs text-slate-400">5-Factor AI Matching Engine will score nearest eligible suppliers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Requesting Facility */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
              Requesting Facility
            </label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              required
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.facility_type})
                </option>
              ))}
            </select>
          </div>

          {/* Grid: Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                Resource Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ResourceCategory;
                  setCategory(newCat);
                  setResourceCode(categoryPresets[newCat][0]?.code || '');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="BLOOD_COMPONENTS">Blood Components (Matrix Check)</option>
                <option value="MEDICINES">Critical Medicines</option>
                <option value="VACCINES">Cold-Chain Vaccines (2-8°C)</option>
                <option value="MEDICAL_EQUIPMENT">Medical Equipment</option>
                <option value="DIAGNOSTIC_SAMPLES">Diagnostic Samples</option>
                <option value="EMERGENCY_SUPPLIES">Emergency Supplies & Trauma</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors font-medium"
              >
                <option value="CRITICAL" className="text-rose-400">CRITICAL (Immediate Dispatch, Weight 100)</option>
                <option value="URGENT" className="text-amber-400">URGENT (Weight 85)</option>
                <option value="STANDARD" className="text-slate-300">STANDARD (Weight 70)</option>
                <option value="LOW" className="text-slate-400">LOW (Weight 50)</option>
              </select>
            </div>
          </div>

          {/* Resource Code & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                Target Resource
              </label>
              <select
                value={resourceCode}
                onChange={(e) => setResourceCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                {categoryPresets[category]?.map((preset) => (
                  <option key={preset.code} value={preset.code}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                Required Units
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Clinical Note (PII-Redacted) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300">
                Redacted Clinical Justification
              </label>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> No Raw Patient PII Allowed
              </span>
            </div>
            <textarea
              rows={2}
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              placeholder="e.g., Trauma ICU emergency request. Patient stabilized. Compatibility pre-confirmed."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium text-sm rounded-lg shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating...' : 'Dispatch Allocation Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

