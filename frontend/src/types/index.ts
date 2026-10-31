<<<<<<< HEAD
export enum ResourceCategory {
  MEDICINES = "MEDICINES",
  BLOOD_COMPONENTS = "BLOOD_COMPONENTS",
  MEDICAL_EQUIPMENT = "MEDICAL_EQUIPMENT",
  VACCINES = "VACCINES",
  DIAGNOSTIC_SAMPLES = "DIAGNOSTIC_SAMPLES",
  EMERGENCY_SUPPLIES = "EMERGENCY_SUPPLIES"
}

export enum UrgencyLevel {
  LOW = "LOW",
  STANDARD = "STANDARD",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL"
}

export enum ShipmentStatus {
  PENDING = "PENDING",
  ALLOCATED = "ALLOCATED",
  DISPATCHED = "DISPATCHED",
  IN_TRANSIT = "IN_TRANSIT",
  UNDER_REVIEW = "UNDER_REVIEW",
  DELIVERED = "DELIVERED",
  REJECTED = "REJECTED"
}

export interface FacilityBase {
  id: string;
  name: string;
  organization_id: string;
  facility_type: string;
  latitude: floatNumber;
  longitude: floatNumber;
  city: string;
  is_active: boolean;
}

export type floatNumber = number;
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5

export interface InventoryItem {
  id: string;
  facility_id: string;
<<<<<<< HEAD
  category: ResourceCategory;
  resource_code: string;
  name: string;
  quantity: number;
  details: Record<string, any>;
  is_quarantined: boolean;
  quarantine_reason?: string | null;
  daily_consumption: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyRequestCreate {
  requesting_facility_id: string;
  category: ResourceCategory;
  resource_code: string;
  quantity: number;
  urgency: UrgencyLevel;
  required_by: string;
  clinical_note_redacted?: string | null;
}

export interface EmergencyRequestResponse {
  id: string;
  requesting_facility_id: string;
  category: ResourceCategory;
  resource_code: string;
  quantity: number;
  urgency: UrgencyLevel;
  required_by: string;
  clinical_note_redacted?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
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
<<<<<<< HEAD
  disqualification_reason?: string | null;
}

export interface MatchingResponse {
  request_id: string;
  resource_code: string;
  candidates: CandidateMatch[];
  best_match?: CandidateMatch | null;
}

export interface ShortagePrediction {
  facility_id: string;
  facility_name: string;
  resource_code: string;
  resource_name: string;
  current_stock: number;
  daily_consumption: number;
  dos_days: number;
  lead_time_days: number;
  status: string;
  predicted_exhaustion_date?: string | null;
  alert_level: "SAFE" | "WARNING" | "CRITICAL";
}

export interface TelemetryPayload {
  shipment_id: string;
  temperature_c: number;
  humidity_percent?: number;
  latitude: number;
  longitude: number;
  timestamp_utc: string;
  is_excursion: boolean;
  battery_level?: number;
}

export interface TelemetryRecord extends TelemetryPayload {
  id: string;
  created_at: string;
=======
  disqualification_reason?: string;
}

export interface SensorReading {
  timestamp: string;
  temperature_celsius: number;
  humidity_percent: number;
  location_lat: number;
  location_lng: number;
  is_excursion: boolean;
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
}

export interface Shipment {
  id: string;
<<<<<<< HEAD
  allocation_id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  carrier_actor_id: string;
  status: ShipmentStatus;
  requires_cold_chain: boolean;
  min_temp_c?: number | null;
  max_temp_c?: number | null;
  current_temp_c?: number | null;
  latest_lat?: number | null;
  latest_lng?: number | null;
  latest_telemetry_time?: string | null;
  created_at: string;
  updated_at: string;
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
}

export interface CanonicalEventPayload {
  shipment_id: string;
<<<<<<< HEAD
  event_type: string;
=======
  event_type: 'DISPATCHED' | 'CUSTODY_TRANSFERRED' | 'SENSOR_EXCURSION' | 'DELIVERED';
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
  actor_id: string;
  organization_id: string;
  timestamp_utc: string;
  previous_hash: string;
<<<<<<< HEAD
  payload: Record<string, any>;
}

export interface AuditRecordResponse {
  id?: string;
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
  event: CanonicalEventPayload;
  event_hash: string;
  signature_hex: string;
  public_key_hex: string;
  is_valid: boolean;
}

<<<<<<< HEAD
export interface TamperSimulationResponse {
  original_hash: string;
  tampered_hash: string;
  hashes_match: boolean;
  signature_verified: boolean;
  tamper_detected: boolean;
  diagnostic_message: string;
}

=======
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
