import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Facility, Shipment } from '../types';

interface CommandMapProps {
  facilities: Facility[];
  shipments: Shipment[];
  onSelectFacility?: (facility: Facility) => void;
  selectedFacilityId?: string | null;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  facilities,
  shipments,
  onSelectFacility,
  selectedFacilityId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Center Bhagalpur Coordinates
  const BHAGALPUR_CENTER: [number, number] = [25.2490, 87.0125];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BHAGALPUR_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter tile layer for high-contrast dark operations aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    // Clear previous dynamic layers
    layers.clearLayers();

    // 1. Render Facility Markers
    facilities.forEach((facility) => {
      const isCritical = facility.stock_status === 'CRITICAL_SHORTAGE';
      const isLow = facility.stock_status === 'LOW';
      const isSelected = facility.id === selectedFacilityId;

      const markerColor = isCritical ? '#f43f5e' : isLow ? '#f59e0b' : '#10b981';
      const pulseClass = isCritical ? 'pulse-critical' : '';

      const customIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <div class="${pulseClass}" style="
              width: 28px;
              height: 28px;
              background-color: ${markerColor}22;
              border: 2px solid ${markerColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${markerColor}88;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background-color: ${markerColor};
                border-radius: 50%;
              "></div>
            </div>
            ${isCritical ? `
              <span style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #f43f5e;
                color: #fff;
                font-size: 9px;
                font-weight: 700;
                padding: 1px 4px;
                border-radius: 9999px;
                border: 1px solid #090d16;
              ">!</span>` : ''
            }
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([facility.latitude, facility.longitude], { icon: customIcon });

      const popupContent = `
        <div style="
          background: #0f172a;
          color: #f8fafc;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #334155;
          font-family: inherit;
          min-width: 220px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="
              font-size: 10px;
              text-transform: uppercase;
              font-family: monospace;
              letter-spacing: 0.05em;
              color: ${markerColor};
              font-weight: 700;
            ">${facility.facility_type}</span>
            <span style="
              font-size: 10px;
              background: ${markerColor}22;
              color: ${markerColor};
              border: 1px solid ${markerColor}44;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: 600;
            ">${facility.stock_status || 'NOMINAL'}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; line-height: 1.3; margin-bottom: 6px;">
            ${facility.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            Days of Stock (DOS): <b style="color: #f1f5f9;">${facility.dos_days ? facility.dos_days.toFixed(1) + ' days' : 'N/A'}</b>
          </div>
          ${facility.critical_shortage_items && facility.critical_shortage_items.length > 0 ? `
            <div style="
              margin-top: 6px;
              padding: 6px 8px;
              background: #f43f5e15;
              border-left: 3px solid #f43f5e;
              border-radius: 4px;
              font-size: 11px;
              color: #fca5a5;
            ">
              <b>Alert:</b> ${facility.critical_shortage_items.join(', ')}
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-dark-popup',
        closeButton: true,
      });

      marker.on('click', () => {
        if (onSelectFacility) {
          onSelectFacility(facility);
        }
      });

      layers.addLayer(marker);
    });

    // 2. Render Active Shipment Routes (Polylines + Midpoint Temperature Badges)
    shipments.forEach((shipment) => {
      const source = facilities.find(f => f.id === shipment.source_facility_id);
      const dest = facilities.find(f => f.id === shipment.destination_facility_id);

      if (source && dest) {
        const latlngs: [number, number][] = [
          [source.latitude, source.longitude],
          [dest.latitude, dest.longitude],
        ];

        // Animated dashed polyline
        const routeLine = L.polyline(latlngs, {
          color: '#06b6d4',
          weight: 3,
          opacity: 0.8,
          dashArray: '8, 8',
        });
        layers.addLayer(routeLine);

        // Calculate midpoint for vehicle & live sensor badge
        const midLat = (source.latitude + dest.latitude) / 2;
        const midLng = (source.longitude + dest.longitude) / 2;

        const isExcursion = shipment.current_temp < shipment.min_temp_threshold || shipment.current_temp > shipment.max_temp_threshold;
        const tempBadgeColor = isExcursion ? '#f43f5e' : '#10b981';

        const transitIcon = L.divIcon({
          className: 'custom-transit-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              background: #0f172a;
              border: 1px solid ${tempBadgeColor};
              border-radius: 9999px;
              padding: 3px 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
              font-family: monospace;
              font-size: 11px;
              font-weight: 600;
              color: #f8fafc;
              white-space: nowrap;
            ">
              <span style="
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: ${tempBadgeColor};
                display: inline-block;
              "></span>
              <span style="color: ${tempBadgeColor}; font-weight: 700;">${shipment.current_temp.toFixed(1)}°C</span>
              <span style="color: #64748b;">|</span>
              <span style="color: #38bdf8;">ETA ${shipment.eta_minutes}m</span>
            </div>
          `,
          iconSize: [120, 26],
          iconAnchor: [60, 13],
        });

        const transitMarker = L.marker([midLat, midLng], { icon: transitIcon });
        transitMarker.bindPopup(`
          <div style="background: #0f172a; color: #f8fafc; padding: 10px; border-radius: 6px; font-family: inherit; font-size: 12px; min-width: 220px;">
            <div style="color: #06b6d4; font-weight: 700; margin-bottom: 4px;">Active Transit: ${shipment.id}</div>
            <div style="color: #94a3b8;">Payload: <b style="color: #fff;">${shipment.resource_name}</b> (${shipment.quantity} units)</div>
            <div style="color: #94a3b8;">Vehicle: ${shipment.vehicle_id}</div>
            <div style="color: #94a3b8;">Safe Window: <b>${shipment.min_temp_threshold}°C – ${shipment.max_temp_threshold}°C</b></div>
            <div style="color: ${tempBadgeColor}; font-weight: 700; margin-top: 4px;">
              Live Temp: ${shipment.current_temp}°C (${isExcursion ? 'EXCURSION DETECTED' : 'NOMINAL'})
            </div>
          </div>
        `);
        layers.addLayer(transitMarker);
      }
    });

  }, [facilities, shipments, selectedFacilityId]);

  return (
    <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Top Map HUD overlay */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
          Bhagalpur Healthcare Mesh (Live GIS)
        </span>
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg p-2.5 shadow-lg text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">Nominal Stock</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">Low Stock (DOS &lt; 2d)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-300">Critical Shortage</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="w-3 h-0.5 border-t border-dashed border-cyan-400"></span>
          <span className="text-cyan-400">Cold-Chain Route</span>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

