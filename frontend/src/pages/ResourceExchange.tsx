import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InventoryItem, ResourceCategory, FacilityBase, EmergencyRequestCreate } from '../types';
import { Search, Filter, AlertTriangle, ShieldCheck, ShieldAlert, Package, RefreshCw } from 'lucide-react';
import { EmergencyModal } from '../components/EmergencyModal';

export const ResourceExchange: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityBase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facs, inv] = await Promise.all([
        api.getFacilities(),
        api.getInventory(
          selectedCategory === 'ALL' ? undefined : selectedCategory,
          search || undefined
        ),
      ]);
      setFacilities(facs);
      setItems(inv);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, search]);

  const handleQuarantine = async (itemId: string, currentQuarantined: boolean) => {
    try {
      await api.quarantineBatch(itemId, 'Quality Assurance Safety Hold', !currentQuarantined);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle quarantine:', err);
    }
  };

  const getFacilityName = (facId: string) => {
    return facilities.find((f) => f.id === facId)?.name || facId;
  };

  const categories = ['ALL', ...Object.values(ResourceCategory)];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Medical Resource Exchange</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              6 Categories
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Distributed stock lookup, cold chain specifications, and immediate requisition
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition"
        >
          <Package className="w-4 h-4" />
          <span>Request Allocation</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or medicine..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">Resource / Code</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Facility</th>
                <th className="px-5 py-3">Stock Units</th>
                <th className="px-5 py-3">Safety Details</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    {loading ? 'Fetching medical resources...' : 'No medical resources match the selected criteria.'}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.quantity <= 5;
                  const details = item.details || {};

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm font-sans">{item.name}</div>
                        <div className="text-[11px] text-cyan-400">{item.resource_code}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {getFacilityName(item.facility_id)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-base font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">units</span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-slate-400 max-w-xs truncate">
                        {details.blood_group && <span>Group: {details.blood_group} | </span>}
                        {details.batch_id && <span>Batch: {details.batch_id} | </span>}
                        {details.storage_temp_c && <span>Temp: {details.storage_temp_c}°C</span>}
                        {details.min_temp_c && <span>Range: {details.min_temp_c}-{details.max_temp_c}°C</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.is_quarantined ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center space-x-1 w-max">
                            <ShieldAlert className="w-3 h-3" />
                            <span>QUARANTINED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1 w-max">
                            <ShieldCheck className="w-3 h-3" />
                            <span>CERTIFIED</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleQuarantine(item.id, item.is_quarantined)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition ${
                            item.is_quarantined
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {item.is_quarantined ? 'Release Hold' : 'Quarantine'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmergencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilities={facilities}
        onSubmit={async (payload: EmergencyRequestCreate) => {
          await api.createEmergencyRequest(payload);
          await loadData();
        }}
      />
    </div>
  );
};

