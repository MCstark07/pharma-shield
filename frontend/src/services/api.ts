import axios from 'axios';
import {
  EmergencyRequestCreate,
  EmergencyRequestResponse,
  MatchingResponse,
  ShortagePrediction,
  InventoryItem,
  Shipment,
  TelemetryRecord,
  AuditRecordResponse,
  TamperSimulationResponse,
  FacilityBase,
  ResourceCategory
} from '../types';

const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Facilities & Inventory
  getFacilities: async (): Promise<FacilityBase[]> => {
    const res = await apiClient.get<FacilityBase[]>('/inventory/facilities');
    return res.data;
  },

  getInventory: async (category?: ResourceCategory, search?: string): Promise<InventoryItem[]> => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (search) params.search = search;
    const res = await apiClient.get<InventoryItem[]>('/inventory/items', { params });
    return res.data;
  },

  quarantineBatch: async (batchOrItemId: string, reason: string, quarantine: boolean = true) => {
    const res = await apiClient.post('/inventory/quarantine', {
      batch_or_item_id: batchOrItemId,
      reason,
      quarantine,
    });
    return res.data;
  },

  // Emergency Requests & AI Matching
  createEmergencyRequest: async (payload: EmergencyRequestCreate): Promise<EmergencyRequestResponse> => {
    const res = await apiClient.post<EmergencyRequestResponse>('/requests/', payload);
    return res.data;
  },

  getEmergencyRequests: async (status?: string): Promise<EmergencyRequestResponse[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<EmergencyRequestResponse[]>('/requests/', { params });
    return res.data;
  },

  getMatches: async (requestId: string): Promise<MatchingResponse> => {
    const res = await apiClient.post<MatchingResponse>(`/ai/match/${requestId}`);
    return res.data;
  },

  allocateResource: async (requestId: string, fulfillingFacilityId: string, quantity: number, coldChain: boolean = false) => {
    const res = await apiClient.post('/requests/allocate', {
      request_id: requestId,
      fulfilling_facility_id: fulfillingFacilityId,
      allocated_quantity: quantity,
      transport_mode: 'EMERGENCY_AMBULANCE',
      cold_chain_required: coldChain,
    });
    return res.data;
  },

  // AI Shortage Predictions (DOS)
  getForecasts: async (): Promise<ShortagePrediction[]> => {
    const res = await apiClient.get<ShortagePrediction[]>('/ai/forecasts');
    return res.data;
  },

  // Shipments & Telemetry
  getShipments: async (): Promise<Shipment[]> => {
    const res = await apiClient.get<Shipment[]>('/shipments/');
    return res.data;
  },

  getShipmentTelemetry: async (shipmentId: string): Promise<TelemetryRecord[]> => {
    const res = await apiClient.get<TelemetryRecord[]>(`/shipments/${shipmentId}/telemetry`);
    return res.data;
  },

  // Security & Audit Ledger
  getAuditLedger: async (shipmentId?: string): Promise<AuditRecordResponse[]> => {
    const params = shipmentId ? { shipment_id: shipmentId } : {};
    const res = await apiClient.get<AuditRecordResponse[]>('/security/ledger', { params });
    return res.data;
  },

  simulateTampering: async (auditRecordId: string, fieldToModify: string, tamperedValue: any): Promise<TamperSimulationResponse> => {
    const res = await apiClient.post<TamperSimulationResponse>('/security/simulate-tampering', {
      audit_record_id: auditRecordId,
      field_to_modify: fieldToModify,
      tampered_value: tamperedValue,
    });
    return res.data;
  },
};

