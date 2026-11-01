import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Clock,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  X,
  Truck,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BarChart3,
  DollarSign,
  Package,
} from 'lucide-react';

interface UniversalFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOffer?: (offer: any) => void;
}

export const UniversalMedicineFinderModal: React.FC<UniversalFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectOffer,
}) => {
  const [query, setQuery] = useState('INSULIN_GLARGINE');
  const [selectedCity, setSelectedCity] = useState('Siliguri');
  const [selectedState, setSelectedState] = useState('West Bengal');
  const [selectedCategory, setSelectedCategory] = useState<string>('MEDICINES');
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [priceReport, setPriceReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'AVAILABILITY' | 'PRICE_INTELLIGENCE'>('AVAILABILITY');
  const [requestedSuccessId, setRequestedSuccessId] = useState<string | null>(null);

  const cityCoordinates: Record<string, { lat: number; lng: number; state: string }> = {
    Siliguri: { lat: 26.7271, lng: 88.3953, state: 'West Bengal' },
    Bhagalpur: { lat: 25.2445, lng: 87.0125, state: 'Bihar' },
    Kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
    Patna: { lat: 25.56, lng: 85.045, state: 'Bihar' },
    Ranchi: { lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedState(cityCoordinates[city].state);
  };

  const executeSearch = async () => {
    setLoading(true);
    try {
      const coords = cityCoordinates[selectedCity] || cityCoordinates['Siliguri'];
      const params = new URLSearchParams({
        query: query,
        city: selectedCity,
        state: coords.state,
        lat: coords.lat.toString(),
        lng: coords.lng.toString(),
      });
      if (selectedCategory && selectedCategory !== 'ALL') {
        params.append('category', selectedCategory);
      }

      // Fetch availability & landed cost ranking
      const res = await fetch(`/api/v1/medicines/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResponse(data);
      }

      // Fetch cross-state price intelligence
      const priceRes = await fetch(`/api/v1/prices/intelligence?resource_code=${encodeURIComponent(query)}`);
      if (priceRes.ok) {
        const pData = await priceRes.json();
        setPriceReport(pData);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      executeSearch();
    }
  }, [isOpen, selectedCity, query, selectedCategory]);

  const handleOrderOffer = async (offer: any) => {
    try {
      const res = await fetch('/api/v1/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesting_facility_id: 'FAC-JLNMCH-01',
          category: offer.category || 'MEDICINES',
          resource_code: offer.resource_code,
          quantity: 1,
          urgency: 'URGENT',
          clinical_note: `Dispatched from ${offer.facility_name} (${offer.search_scope}). Landed cost: ₹${offer.cost_breakdown.total_landed_cost_inr}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequestedSuccessId(offer.facility_id);
        if (onSelectOffer) onSelectOffer(offer);
        setTimeout(() => setRequestedSuccessId(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create emergency request:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Search className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Universal Medicine Availability & Landed Cost Finder
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                  PROBLEM 3 & 4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Searches Local → District → Inter-State suppliers. Ranks by Total Landed Cost (Base + Shipping + Cold-Chain + GST).
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

        {/* Search Controls & Filters */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/80 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Query Input */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Medicine, Resource Code or Brand (e.g. INSULIN_GLARGINE, REMDESIVIR)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* User Location Selector */}
            <div className="md:col-span-3 flex items-center space-x-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="Siliguri">Siliguri (Darjeeling, WB)</option>
                <option value="Bhagalpur">Bhagalpur (Bihar)</option>
                <option value="Kolkata">Kolkata (West Bengal)</option>
                <option value="Patna">Patna (Bihar)</option>
                <option value="Ranchi">Ranchi (Jharkhand)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="ALL">All Categories</option>
                <option value="MEDICINES">Medicines</option>
                <option value="BLOOD_COMPONENTS">Blood Components</option>
                <option value="VACCINES">Vaccines (Cold-Chain)</option>
                <option value="EMERGENCY_SUPPLIES">Emergency Supplies</option>
              </select>
            </div>
          </div>

          {/* Preset Quick Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-mono">Quick Cases:</span>
            {[
              { label: 'Insulin Glargine (Siliguri Out-of-Stock Demo)', code: 'INSULIN_GLARGINE' },
              { label: 'Remdesivir 100mg', code: 'REMDESIVIR_100MG' },
              { label: 'Human Albumin 20%', code: 'ALBUMIN_20_PERCENT' },
              { label: 'O+ Packed RBC', code: 'O_POS_RBC' },
              { label: 'Covaxin Vaccine', code: 'COVAXIN_VACCINE' },
            ].map((chip) => (
              <button
                key={chip.code}
                onClick={() => setQuery(chip.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  query === chip.code
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setActiveTab('AVAILABILITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'AVAILABILITY'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Ranked Availability & Landed Costs</span>
            </button>
            <button
              onClick={() => setActiveTab('PRICE_INTELLIGENCE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'PRICE_INTELLIGENCE'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Inter-State Price Intelligence</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-mono text-sm animate-pulse">
              Querying multi-tier pharmacy and distributor network across Indian states...
            </div>
          ) : activeTab === 'AVAILABILITY' ? (
            <div>
              {/* Local Out-of-Stock Alert Banner (if applicable) */}
              {searchResponse && !searchResponse.local_stock_available && (
                <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500/60 text-amber-200 flex items-start space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                      Local Pharmacy Unavailable in {selectedCity}
                    </h4>
                    <p className="text-xs text-amber-200/90 mt-0.5">
                      PharmaShield expanded the search geographically across nearby district depots and inter-state providers. 
                      Showing lowest total landed-cost alternatives below.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommended Top Choice Card */}
              {searchResponse?.recommended_offer && (
                <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border-2 border-cyan-500/70 shadow-lg shadow-cyan-950/50 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>AI RECOMMENDED: LOWEST TOTAL LANDED COST</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Scope: <strong className="text-cyan-300">{searchResponse.recommended_offer.search_scope}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {searchResponse.recommended_offer.facility_name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                        <span>{searchResponse.recommended_offer.city}, {searchResponse.recommended_offer.state}</span>
                        <span>•</span>
                        <span>{searchResponse.recommended_offer.distance_km} km away</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                          {searchResponse.recommended_offer.units_available} units available
                        </span>
                        {searchResponse.recommended_offer.cold_chain_required && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono flex items-center space-x-1">
                            <Thermometer className="w-2.5 h-2.5" />
                            <span>Cold Chain (2-8°C)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Base Price:</span>
                        <span>₹{searchResponse.recommended_offer.cost_breakdown.base_price_inr}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Shipping ({searchResponse.recommended_offer.distance_km}km):</span>
                        <span>₹{searchResponse.recommended_offer.cost_breakdown.shipping_cost_inr}</span>
                      </div>
                      {searchResponse.recommended_offer.cost_breakdown.cold_chain_surcharge_inr > 0 && (
                        <div className="flex justify-between text-blue-300">
                          <span>Cold-Chain Fee:</span>
                          <span>₹{searchResponse.recommended_offer.cost_breakdown.cold_chain_surcharge_inr}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>GST (5%):</span>
                        <span>₹{searchResponse.recommended_offer.cost_breakdown.applicable_taxes_inr}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                        <span>Total Landed:</span>
                        <span className="text-cyan-400">
                          ₹{searchResponse.recommended_offer.cost_breakdown.total_landed_cost_inr}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right text-xs font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ETA: ~{searchResponse.recommended_offer.estimated_transit_hours} hrs</span>
                      </div>
                      <button
                        onClick={() => handleOrderOffer(searchResponse.recommended_offer)}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1.5"
                      >
                        {requestedSuccessId === searchResponse.recommended_offer.facility_id ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                            <span>Requisition Created!</span>
                          </>
                        ) : (
                          <>
                            <span>Request Immediate Allocation</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* All Candidate Providers Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  All Evaluated Providers ({searchResponse?.all_offers?.length || 0})
                </h4>

                <div className="space-y-2.5">
                  {searchResponse?.all_offers?.map((offer: any) => {
                    const isOutOfStock = offer.units_available === 0;
                    return (
                      <div
                        key={offer.facility_id + offer.resource_code}
                        className={`p-4 rounded-xl border transition-all ${
                          isOutOfStock
                            ? 'bg-slate-950/40 border-slate-800 opacity-60'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-white">{offer.facility_name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  offer.search_scope === 'LOCAL'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : offer.search_scope === 'DISTRICT'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                }`}
                              >
                                {offer.search_scope}
                              </span>
                              {offer.is_lowest_cost && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                                  LOWEST COST
                                </span>
                              )}
                              {offer.is_fastest_delivery && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                                  FASTEST ETA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              {offer.city}, {offer.state} • {offer.distance_km} km away • ETA ~{offer.estimated_transit_hours}h
                            </p>
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              {isOutOfStock ? (
                                <span className="text-xs text-rose-400 font-mono font-bold">
                                  OUT OF STOCK
                                </span>
                              ) : (
                                <div>
                                  <div className="text-base font-bold text-white font-mono">
                                    ₹{offer.cost_breakdown.total_landed_cost_inr}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    (Base ₹{offer.cost_breakdown.base_price_inr} + Ship ₹{offer.cost_breakdown.shipping_cost_inr})
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              disabled={isOutOfStock}
                              onClick={() => handleOrderOffer(offer)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isOutOfStock
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50'
                              }`}
                            >
                              {requestedSuccessId === offer.facility_id ? 'Requested' : 'Allocate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Problem 4: Inter-State Price Intelligence Report */
            <div className="space-y-5">
              {priceReport ? (
                <div>
                  {/* Anomaly Callout */}
                  {priceReport.price_anomaly_detected && (
                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 flex items-start space-x-3 mb-5">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-300">
                          🚨 Price Disparity Anomaly Detected
                        </h4>
                        <p className="text-xs text-rose-200/90 mt-1">
                          {priceReport.price_anomaly_details}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">National Median</span>
                      <div className="text-xl font-bold text-white font-mono mt-1">
                        ₹{priceReport.national_median_price_inr}
                      </div>
                      <span className="text-[10px] text-slate-500">Across reporting authorized depots</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60">
                      <span className="text-[11px] font-mono text-emerald-400 uppercase">Lowest Cost State</span>
                      <div className="text-xl font-bold text-emerald-300 font-mono mt-1">
                        {priceReport.lowest_cost_state}
                      </div>
                      <span className="text-[10px] text-emerald-500/80">Optimal source for bulk transfer</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/60">
                      <span className="text-[11px] font-mono text-amber-400 uppercase">Highest Cost State</span>
                      <div className="text-xl font-bold text-amber-300 font-mono mt-1">
                        {priceReport.highest_cost_state}
                      </div>
                      <span className="text-[10px] text-amber-500/80">Subject to freight & local tariffs</span>
                    </div>
                  </div>

                  {/* State-by-State Comparison Table */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">State / Jurisdiction</th>
                          <th className="p-3">Average Listed Price</th>
                          <th className="p-3">Min Price</th>
                          <th className="p-3">Max Price</th>
                          <th className="p-3">Available Units</th>
                          <th className="p-3">Reporting Depots</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {priceReport.state_breakdown.map((row: any) => (
                          <tr key={row.state} className="hover:bg-slate-900/50">
                            <td className="p-3 font-bold text-white">{row.state}</td>
                            <td className="p-3 text-cyan-400 font-bold">₹{row.average_price_inr}</td>
                            <td className="p-3 text-emerald-400">₹{row.min_price_inr}</td>
                            <td className="p-3 text-slate-300">₹{row.max_price_inr}</td>
                            <td className="p-3">{row.total_units_in_state}</td>
                            <td className="p-3">{row.facilities_reporting}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  No pricing data collected for this item yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Data fresh as of {new Date().toLocaleTimeString()} • Verified against State Medical Supplies</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

