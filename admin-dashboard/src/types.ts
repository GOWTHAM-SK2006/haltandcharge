export interface AdminStats {
  totalUsers: number;
  totalStations: number;
  totalChargers: number;
  availableChargers: number;
  chargingChargers: number;
  offlineChargers: number;
  faultedChargers: number;
  activeSessions: number;
  completedSessions: number;
  simulatedEnergyKwh: number;
  simulatedRevenue: number;
}

export interface Station {
  id: number;
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  operatingHours: string;
  amenities: string;
  status: string;
  isActive: boolean;
  totalChargers?: number;
  availableChargers?: number;
}

export interface Charger {
  id: number;
  stationId: number;
  identifier: string;
  name: string;
  chargerType: string;
  maxPowerKw: number;
  status: string; // AVAILABLE, CHARGING, FAULTED, OFFLINE
  tariffPerKwh: number;
  isSimulated: boolean;
  isActive: boolean;
}

export interface ChargingSession {
  id: number;
  sessionUid: string;
  userId: number;
  userEmail?: string;
  stationId: number;
  stationName?: string;
  chargerId: number;
  chargerIdentifier?: string;
  vehicleModel?: string;
  status: string;
  isSimulated: boolean;
  tariffSnapshotPerKwh: number;
  energyKwh: number;
  currentPowerKw: number;
  estimatedCost: number;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  stopReason?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  status: string;
  walletBalance: number;
  createdAt: string;
}

export interface SimulatorEvent {
  id: number;
  charger_id: number;
  charger_identifier?: string;
  charger_name?: string;
  event_type: string;
  details: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

