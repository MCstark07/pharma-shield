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
}

export const CommandMap: React.FC<CommandMapProps> = ({
  facilities,
  shipments,
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
    </div>
  );
};

