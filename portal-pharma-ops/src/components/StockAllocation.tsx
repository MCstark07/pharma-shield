import React, { useState } from 'react';
import {
  Boxes,
  Thermometer,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

export interface InventoryItem {
  id: string;
  facility_id: string;
  facility_name: string;
  category: string;
  resource_code: string;
  name: string;
  quantity: number;
  min_threshold: number;
  days_of_stock: number;
  storage_temp_celsius?: number;
  is_critical: boolean;
}

interface StockAllocationProps {
  inventory: InventoryItem[];
}

export const StockAllocation: React.FC<StockAllocationProps> = ({ inventory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = [
    'ALL',
    'BLOOD_COMPONENTS',
    'VACCINES',
    'MEDICINES',
    'EMERGENCY_SUPPLIES',
    'MEDICAL_EQUIPMENT',
    'DIAGNOSTIC_SAMPLES',
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.facility_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Depot Stock Allocation & DOS Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Days of Stock (DOS = Current / Daily Consumption) tracking across Bhagalpur medical supply network
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search resources, depots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Inventory Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const dosPercent = Math.min(100, (item.days_of_stock / 14.0) * 100);
          const isCritical = item.days_of_stock <= 2.0;
          const isWarning = item.days_of_stock > 2.0 && item.days_of_stock <= 5.0;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Item Top Line */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm leading-tight">{item.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">{item.resource_code}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] text-slate-400">{item.facility_name}</span>
                  </div>
                </div>

                {isCritical ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>CRITICAL DOS</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>OPTIMAL</span>
                  </span>
                )}
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Available</span>
                  <span className="font-mono text-base font-bold text-slate-100">{item.quantity}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Min Threshold</span>
                  <span className="font-mono text-base font-medium text-slate-400">{item.min_threshold}</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Days of Stock</span>
                  <span
                    className={`font-mono text-base font-bold ${
                      isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.days_of_stock.toFixed(1)}d
                  </span>
                </div>
              </div>

              {/* Progress Bar (DOS) */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Stock Buffer</span>
                  <span>{item.days_of_stock.toFixed(1)} Days Remaining</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${dosPercent}%` }}
                  />
                </div>
              </div>

              {/* Temperature Footer */}
              {item.storage_temp_celsius !== undefined && (
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/40">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cold Chain Storage</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold">{item.storage_temp_celsius}°C</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

