<<<<<<< HEAD
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { FacilityBase, Shipment, ShortagePrediction, ShipmentStatus } from '../types';

interface CommandMapProps {
  facilities: FacilityBase[];
  shipments: Shipment[];
  forecasts: ShortagePrediction[];
  onSelectFacility?: (facility: FacilityBase) => void;
  onSelectShipment?: (shipment: Shipment) => void;
=======
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Facility, Shipment } from '../types';

interface CommandMapProps {
  facilities: Facility[];
  shipments: Shipment[];
  onSelectFacility?: (facility: Facility) => void;
  selectedFacilityId?: string | null;
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
}

export const CommandMap: React.FC<CommandMapProps> = ({
  facilities,
  shipments,
<<<<<<< HEAD
  forecasts,
  onSelectFacility,
  onSelectShipment,
}) => {
  // Bhagalpur center
  const centerPosition: [number, number] = [25.2460, 87.0120];

  const getFacilityAlert = (facId: string) => {
    return forecasts.find((f) => f.facility_id === facId && f.alert_level === 'CRITICAL');
  };

  const createFacilityIcon = (hasCriticalAlert: boolean, type: string) => {
    const bgColor = hasCriticalAlert ? 'bg-rose-600' : type === 'BLOOD_BANK' ? 'bg-amber-600' : 'bg-cyan-600';
    const pingColor = hasCriticalAlert ? 'bg-rose-400' : 'bg-cyan-400';

    return L.divIcon({
      className: 'custom-facility-marker',
      html: `
        <div class="relative flex items-center justify-center">
          ${hasCriticalAlert ? `<div class="absolute w-8 h-8 rounded-full ${pingColor} opacity-75 animate-ping"></div>` : ''}
          <div class="w-6 h-6 rounded-full ${bgColor} border-2 border-slate-900 flex items-center justify-center shadow-lg text-[10px] font-bold text-white z-10">
            ${type === 'BLOOD_BANK' ? '🩸' : '🏥'}
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createShipmentIcon = (status: ShipmentStatus) => {
    const isExcursion = status === ShipmentStatus.UNDER_REVIEW;
    return L.divIcon({
      className: 'custom-shipment-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full ${isExcursion ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 opacity-50 animate-pulse'}"></div>
          <div class="w-5 h-5 rounded-full ${isExcursion ? 'bg-rose-600' : 'bg-emerald-500'} border-2 border-slate-900 flex items-center justify-center shadow-lg text-[9px] font-bold text-slate-900 z-10">
            🚑
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="relative w-full h-[450px] lg:h-[550px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-lg text-xs font-mono space-y-1">
        <div className="font-bold text-slate-200">Bhagalpur Logistics Grid</div>
        <div className="flex items-center space-x-2 text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
          <span>Tertiary / Clinic</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Blood Depot</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>Shortage / Excursion</span>
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> Dark Matter'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Facility Markers */}
        {facilities.map((fac) => {
          const alert = getFacilityAlert(fac.id);
          const icon = createFacilityIcon(!!alert, fac.facility_type);

          return (
            <Marker
              key={fac.id}
              position={[fac.latitude, fac.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectFacility && onSelectFacility(fac),
              }}
            >
              <Popup className="custom-popup">
                <div className="text-slate-900 text-xs font-sans p-1">
                  <div className="font-bold text-sm text-slate-950">{fac.name}</div>
                  <div className="text-slate-600 font-mono mt-0.5">Type: {fac.facility_type}</div>
                  <div className="text-slate-600 font-mono">Reliability: {fac.is_active ? '94%' : 'OFFLINE'}</div>
                  {alert && (
                    <div className="mt-2 bg-rose-100 text-rose-800 p-1.5 rounded font-mono font-semibold border border-rose-300">
                      CRITICAL DOS ALERT: {alert.resource_name} ({alert.dos_days}d stock left)
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Shipments & Transit Routes */}
        {shipments.map((ship) => {
          if (!ship.latest_lat || !ship.latest_lng) return null;
          const orig = facilities.find((f) => f.id === ship.origin_facility_id);
          const dest = facilities.find((f) => f.id === ship.destination_facility_id);

          const routeCoords: [number, number][] = [];
          if (orig) routeCoords.push([orig.latitude, orig.longitude]);
          routeCoords.push([ship.latest_lat, ship.latest_lng]);
          if (dest) routeCoords.push([dest.latitude, dest.longitude]);

          const isUnderReview = ship.status === ShipmentStatus.UNDER_REVIEW;

          return (
            <React.Fragment key={ship.id}>
              {routeCoords.length > 1 && (
                <Polyline
                  positions={routeCoords}
                  color={isUnderReview ? '#f43f5e' : '#06b6d4'}
                  dashArray="4, 8"
                  weight={3}
                  opacity={0.7}
                />
              )}
              <Marker
                position={[ship.latest_lat, ship.latest_lng]}
                icon={createShipmentIcon(ship.status)}
                eventHandlers={{
                  click: () => onSelectShipment && onSelectShipment(ship),
                }}
              >
                <Popup>
                  <div className="text-slate-900 text-xs p-1">
                    <div className="font-bold text-sm">Shipment: {ship.id.slice(0, 12)}...</div>
                    <div className="font-mono mt-1">Status: <span className="font-bold uppercase">{ship.status}</span></div>
                    <div className="font-mono">Temp: <span className="font-bold">{ship.current_temp_c ?? 'N/A'}°C</span></div>
                    {isUnderReview && (
                      <div className="mt-1 text-rose-600 font-bold font-mono">
                        EXCURSION TRIGGERED: UNDER REVIEW
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
    </div>
  );
};

