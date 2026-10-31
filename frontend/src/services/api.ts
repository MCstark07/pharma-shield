import axios from 'axios';
import { Facility, InventoryItem, MedicalRequest, Shipment, AuditRecord } from '../types';
import { MOCK_FACILITIES, MOCK_INVENTORY, MOCK_REQUESTS, MOCK_SHIPMENTS, MOCK_AUDIT_RECORD } from '../mock/data';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2500,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Facilities
  getFacilities: async (): Promise<Facility[]> => {
    try {
      const res = await apiClient.get<Facility[]>('/inventory/facilities');
      return res.data;
    } catch {
      return MOCK_FACILITIES;
    }
  },

  // Inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    try {
      const res = await apiClient.get<InventoryItem[]>('/inventory');
      return res.data;
    } catch {
      return MOCK_INVENTORY;
    }
  },

  // Emergency Requests
  getRequests: async (): Promise<MedicalRequest[]> => {
    try {
      const res = await apiClient.get<MedicalRequest[]>('/requests');
      return res.data;
    } catch {
      return MOCK_REQUESTS;
    }
  },

  createRequest: async (payload: Partial<MedicalRequest>): Promise<MedicalRequest> => {
    try {
      const res = await apiClient.post<MedicalRequest>('/requests', payload);
      return res.data;
    } catch {
      // Mock return
      return {
        id: `req_${Date.now()}`,
        requesting_facility_id: payload.requesting_facility_id || 'fac_jlnmch',
        category: payload.category || 'BLOOD_COMPONENTS',
        resource_code: payload.resource_code || 'O_POS_RBC',
        resource_name: payload.resource_name || 'O+ Red Blood Cells',
        quantity: payload.quantity || 5,
        urgency: payload.urgency || 'CRITICAL',
        required_by: payload.required_by || new Date().toISOString(),
        clinical_note_redacted: payload.clinical_note_redacted,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
    }
  },

  // Active Shipments
  getShipments: async (): Promise<Shipment[]> => {
    try {
      const res = await apiClient.get<Shipment[]>('/shipments');
      return res.data;
    } catch {
      return MOCK_SHIPMENTS;
    }
  },

  // Cryptographic Ledger
  getAuditRecord: async (shipmentId: string): Promise<AuditRecord> => {
    try {
      const res = await apiClient.get<AuditRecord>(`/security/audit/${shipmentId}`);
      return res.data;
    } catch {
      return MOCK_AUDIT_RECORD;
    }
  },
};

