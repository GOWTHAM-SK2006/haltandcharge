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
  distanceKm?: number;
  totalChargers?: number;
  availableChargers?: number;
  chargers?: Charger[];
}

export interface Vehicle {
  id: number;
  userId: number;
  brand: string;
  model: string;
  licensePlate: string;
  batteryCapacityKwh: number;
  connectorType: string;
  maxChargingSpeedKw: number;
  isDefault: boolean;
}

export interface ChargingSession {
  id: number;
  sessionUid: string;
  userId: number;
  stationId: number;
  stationName?: string;
  chargerId: number;
  chargerIdentifier?: string;
  vehicleId?: number;
  vehicleModel?: string;
  status: string; // IN_PROGRESS, COMPLETED, STOPPED_BY_USER
  isSimulated: boolean;
  tariffSnapshotPerKwh: number;
  energyKwh: number;
  currentPowerKw: number;
  estimatedCost: number;
  durationSeconds: number;
  socPercentage?: number;
  startedAt: string;
  endedAt?: string;
  stopReason?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  status: string;
  walletBalance: number;
}

