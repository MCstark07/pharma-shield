import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { TelemetryRecord } from '../types';
import { Thermometer, AlertTriangle } from 'lucide-react';

interface ColdChainChartProps {
  telemetry: TelemetryRecord[];
  shipmentCode?: string;
}

export const ColdChainChart: React.FC<ColdChainChartProps> = ({
  telemetry,
  shipmentCode = 'ACTIVE_SHIPMENT',
}) => {
  const chartData = telemetry.slice().reverse().map((t, idx) => ({
    step: idx + 1,
    time: new Date(t.timestamp_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temperature: t.temperature_c,
    isExcursion: t.is_excursion,
  }));

  const latestTemp = telemetry[0]?.temperature_c ?? 4.0;
  const hasExcursion = telemetry.some((t) => t.is_excursion);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Cold-Chain Telemetry Monitor</h3>
            <p className="text-xs text-slate-400 font-mono">Shipment: {shipmentCode}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <div className="text-right">
            <div className="text-xs text-slate-400">Current Sensor</div>
            <div className={`text-xl font-bold ${hasExcursion ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {latestTemp.toFixed(1)}°C
            </div>
          </div>
          {hasExcursion && (
            <div className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/40 flex items-center space-x-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>EXCURSION</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-64">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Awaiting telemetry sensor ingestion...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 16]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} unit="°C" />
              
              {/* Safe zone highlight (2.0°C to 8.0°C) */}
              <ReferenceArea y1={2.0} y2={8.0} fill="#10b981" fillOpacity={0.08} />
              
              <ReferenceLine y={2.0} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Min 2.0°C', fill: '#06b6d4', fontSize: 10 }} />
              <ReferenceLine y={8.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Max 8.0°C', fill: '#f43f5e', fontSize: 10 }} />
              
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={hasExcursion ? '#f43f5e' : '#10b981'}
                strokeWidth={2.5}
                dot={{ stroke: '#06b6d4', strokeWidth: 2, r: 3, fill: '#0f172a' }}
                activeDot={{ r: 6, fill: '#f43f5e' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-emerald-500/20 border border-emerald-500 rounded-sm"></span>
          <span>Safe Zone (2.0°C – 8.0°C WHO Guidelines)</span>
        </div>
        <div>Continuous IoT Broadcast Active</div>
      </div>
    </div>
  );
};

