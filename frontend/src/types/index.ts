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

export interface InventoryItem {
  id: string;
  facility_id: string;
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
}

export interface Shipment {
  id: string;
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
}

export interface CanonicalEventPayload {
  shipment_id: string;
  event_type: string;
  actor_id: string;
  organization_id: string;
  timestamp_utc: string;
  previous_hash: string;
  payload: Record<string, any>;
}

export interface AuditRecordResponse {
  id?: string;
  event: CanonicalEventPayload;
  event_hash: string;
  signature_hex: string;
  public_key_hex: string;
  is_valid: boolean;
}

export interface TamperSimulationResponse {
  original_hash: string;
  tampered_hash: string;
  hashes_match: boolean;
  signature_verified: boolean;
  tamper_detected: boolean;
  diagnostic_message: string;
}

