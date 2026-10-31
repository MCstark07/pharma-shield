// PharmaShield TypeScript Contracts — 1:1 Mirror of Backend Pydantic v2 Schemas

export type ResourceCategory = 
  | 'MEDICINES'
  | 'BLOOD_COMPONENTS'
  | 'MEDICAL_EQUIPMENT'
  | 'VACCINES'
  | 'DIAGNOSTIC_SAMPLES'
  | 'EMERGENCY_SUPPLIES';

export type UrgencyLevel = 'LOW' | 'STANDARD' | 'URGENT' | 'CRITICAL';

export type ShipmentStatus = 
  | 'PENDING'
  | 'ALLOCATED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'UNDER_REVIEW'
  | 'DELIVERED'
  | 'REJECTED';

export type FacilityType = 'HOSPITAL' | 'BLOOD_BANK' | 'WAREHOUSE' | 'LAB' | 'CLINIC';

export interface Facility {
  id: string;
  name: string;
  organization_id: string;
  facility_type: FacilityType;
  latitude: float;
  longitude: float;
  city: string;
  is_active: boolean;
  stock_status?: 'NORMAL' | 'LOW' | 'CRITICAL_SHORTAGE';
  critical_shortage_items?: string[];
  dos_days?: number; // Days of Stock
}

type float = number;

export interface InventoryItem {
  id: string;
  facility_id: string;
  facility_name?: string;
  category: ResourceCategory;
  resource_code: string;
  resource_name: string;
  quantity: number;
  batch_number: string;
  expiry_date: string;
  storage_temp_min: number;
  storage_temp_max: number;
  is_quarantined: boolean;
  recall_status: boolean;
  daily_consumption_units: number;
  dos_days: number;
}

export interface MedicalRequest {
  id: string;
  requesting_facility_id: string;
  requesting_facility_name?: string;
  category: ResourceCategory;
  resource_code: string;
  resource_name?: string;
  quantity: number;
  urgency: UrgencyLevel;
  required_by: string;
  clinical_note_redacted?: string;
  status: 'PENDING' | 'MATCHED' | 'ALLOCATED' | 'FULFILLED' | 'CANCELLED';
  created_at: string;
  allocated_facility_id?: string;
}

export interface CandidateMatch {
  facility_id: string;
  facility_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  available_units: number;
  score: number;
  rank: number;
  score_breakdown: {
    urgency: number;
    availability: number;
    transport: number;
    safety: number;
    reliability: number;
  };
  is_eligible: boolean;
  disqualification_reason?: string;
}

export interface SensorReading {
  timestamp: string;
  temperature_celsius: number;
  humidity_percent: number;
  location_lat: number;
  location_lng: number;
  is_excursion: boolean;
}

export interface Shipment {
  id: string;
  request_id: string;
  source_facility_id: string;
  source_facility_name: string;
  destination_facility_id: string;
  destination_facility_name: string;
  category: ResourceCategory;
  resource_code: string;
  resource_name: string;
  quantity: number;
  status: ShipmentStatus;
  dispatched_at: string;
  eta_minutes: number;
  current_temp: number;
  min_temp_threshold: number;
  max_temp_threshold: number;
  temperature_logs: SensorReading[];
  vehicle_id: string;
  courier_name: string;
}

export interface CanonicalEventPayload {
  shipment_id: string;
  event_type: 'DISPATCHED' | 'CUSTODY_TRANSFERRED' | 'SENSOR_EXCURSION' | 'DELIVERED';
  actor_id: string;
  organization_id: string;
  timestamp_utc: string;
  previous_hash: string;
  payload: {
    resource_code: string;
    quantity: number;
    temperature_celsius?: number;
    from_facility_id: string;
    to_facility_id: string;
    action_note: string;
  };
}

export interface AuditRecord {
  event: CanonicalEventPayload;
  event_hash: string;
  signature_hex: string;
  public_key_hex: string;
  is_valid: boolean;
}

