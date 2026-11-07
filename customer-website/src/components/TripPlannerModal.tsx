import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Navigation,
  BatteryCharging,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Car,
  MapPin,
  Crosshair,
  Shield,
  Sliders,
  Share2,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Station, Vehicle, TripRoutePlan, TripWaypoint, RecommendedChargingStop, Charger } from '../types';

interface TripPlannerModalProps {
  stations: Station[];
  vehicles: Vehicle[];
  userLocation: { lat: number; lng: number };
  activeRoute?: TripRoutePlan | null;
  onApplyRoute: (routePlan: TripRoutePlan) => void;
  onClearRoute: () => void;
  onSelectStation: (station: Station) => void;
  onClose: () => void;
  onStartChargeOnCharger?: (charger: Charger) => void;
}

// Popular predefined destination and waypoint hubs with precise coordinates
const POPULAR_HUBS = [
  { name: 'Bengaluru (City Center)', lat: 12.9716, lng: 77.5946, region: 'Karnataka' },
  { name: 'Mysuru', lat: 12.2958, lng: 76.6394, region: 'Karnataka' },
  { name: 'Hosur', lat: 12.7409, lng: 77.8253, region: 'Tamil Nadu' },
  { name: 'Electronic City, Bengaluru', lat: 12.8452, lng: 77.6602, region: 'Karnataka' },
  { name: 'Whitefield, Bengaluru', lat: 12.9866, lng: 77.7376, region: 'Karnataka' },
  { name: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245, region: 'Karnataka' },
  { name: 'Indiranagar, Bengaluru', lat: 12.9719, lng: 77.6412, region: 'Karnataka' },
  { name: 'Kempegowda Int. Airport (BLR)', lat: 13.1986, lng: 77.7066, region: 'Karnataka' },
  { name: 'Tumakuru', lat: 13.3379, lng: 77.1173, region: 'Karnataka' },
  { name: 'Kolar', lat: 13.1367, lng: 78.1292, region: 'Karnataka' },
  { name: 'Mandya', lat: 12.5222, lng: 76.8974, region: 'Karnataka' },
  { name: 'Ramanagara', lat: 12.7209, lng: 77.2799, region: 'Karnataka' },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, region: 'Tamil Nadu' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu' },
  { name: 'Hassan', lat: 13.0033, lng: 76.1004, region: 'Karnataka' }
];

// Fallback EV profiles if user has no registered vehicle
const DEFAULT_EV_PROFILES = [
  { id: -1, name: 'Tata Nexon EV Max', capacity: 40.5, speed: 50, connector: 'CCS2' },
  { id: -2, name: 'Tata Punch EV Long Range', capacity: 35.0, speed: 45, connector: 'CCS2' },
  { id: -3, name: 'MG ZS EV', capacity: 50.3, speed: 50, connector: 'CCS2' },
  { id: -4, name: 'Mahindra XUV400', capacity: 39.4, speed: 50, connector: 'CCS2' },
  { id: -5, name: 'Hyundai Ioniq 5', capacity: 72.6, speed: 150, connector: 'CCS2' },
  { id: -6, name: 'BYD Atto 3', capacity: 60.5, speed: 80, connector: 'CCS2' }
];

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  stations,
  vehicles,
  userLocation,
  activeRoute,
  onApplyRoute,
  onClearRoute,
  onSelectStation,
  onClose,
  onStartChargeOnCharger
}) => {
  // Navigation / Tab state
  const [activeTab, setActiveTab] = useState<'plan' | 'saved'>('plan');

  // Input states (initialized to Bengaluru -> Mysuru as in reference screenshot)
  const [origin, setOrigin] = useState('Bengaluru');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>({
    lat: userLocation?.lat || 12.9716,
    lng: userLocation?.lng || 77.5946
  });

  const [destination, setDestination] = useState('Mysuru');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.2958,
    lng: 76.6394
  });

  // Autocomplete suggestions
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Vehicle selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(
    vehicles.length > 0 ? vehicles[0].id : -1
  );

  // Battery settings
  const [batterySoc, setBatterySoc] = useState(75); // 75% as in reference screenshot
  const [reserveSoc, setReserveSoc] = useState(15); // 15% safe reserve buffer

  // Route & Charger Preferences
  const [routePreference, setRoutePreference] = useState<'fastest' | 'shortest'>('fastest');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [preferAvailable, setPreferAvailable] = useState(true);
  const [preferFastChargers, setPreferFastChargers] = useState(true);

  // Advanced settings expanded
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Calculated Results
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedPlan, setCalculatedPlan] = useState<TripRoutePlan | null>(activeRoute || null);

  // Saved Trips state
  const [savedTrips, setSavedTrips] = useState<TripRoutePlan[]>(() => {
    try {
      const stored = localStorage.getItem('hc_saved_trips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSaved, setIsSaved] = useState(false);

  // Autocomplete Debounce for Nominatim OpenStreetMap
  const originSearchTimerRef = useRef<any>(null);
  const destSearchTimerRef = useRef<any>(null);

  // Search origin autocomplete
  const handleOriginChange = (val: string) => {
    setOrigin(val);
    if (!val.trim()) {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
      return;
    }

    // 1. Instant local filter
    const localMatches = POPULAR_HUBS.filter(h =>
      h.name.toLowerCase().includes(val.toLowerCase()) || h.region.toLowerCase().includes(val.toLowerCase())
    );
    setOriginSuggestions(localMatches);
    setShowOriginSuggestions(true);

    // 2. Debounced OSM Nominatim lookup
    clearTimeout(originSearchTimerRef.current);
    if (val.length >= 3) {
      originSearchTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=4`, {
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            const osmItems = data.map((d: any) => ({
              name: d.display_name.split(',')[0],
              fullName: d.display_name,
              lat: parseFloat(d.lat),
              lng: parseFloat(d.lon),
              region: 'OpenStreetMap'
            }));
            setOriginSuggestions(prev => [...localMatches, ...osmItems]);
          }
        } catch (e) {
          // ignore network failure, local fallback remains
        }
      }, 350);
    }
  };

  // Search destination autocomplete
  const handleDestChange = (val: string) => {
    setDestination(val);
    if (!val.trim()) {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
      return;
    }

    // 1. Instant local filter
    const localMatches = POPULAR_HUBS.filter(h =>
      h.name.toLowerCase().includes(val.toLowerCase()) || h.region.toLowerCase().includes(val.toLowerCase())
    );
    // Also include matching stations from backend
    const stationMatches = stations.filter(s =>
      s.name.toLowerCase().includes(val.toLowerCase()) || s.city.toLowerCase().includes(val.toLowerCase())
    ).map(s => ({
      name: s.name,
      lat: s.latitude,
      lng: s.longitude,
      region: `${s.city} (Station)`
    }));

    setDestSuggestions([...localMatches, ...stationMatches]);
    setShowDestSuggestions(true);

    // 2. Debounced OSM Nominatim lookup
    clearTimeout(destSearchTimerRef.current);
    if (val.length >= 3) {
      destSearchTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=4`, {
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            const osmItems = data.map((d: any) => ({
              name: d.display_name.split(',')[0],
              fullName: d.display_name,
              lat: parseFloat(d.lat),
              lng: parseFloat(d.lon),
              region: 'OpenStreetMap'
            }));
            setDestSuggestions(prev => [...localMatches, ...stationMatches, ...osmItems]);
          }
        } catch (e) {
          // ignore
        }
      }, 350);
    }
  };

  // Select origin from suggestion
  const handleSelectOrigin = (item: any) => {
    setOrigin(item.name);
    setOriginCoords({ lat: item.lat, lng: item.lng });
    setShowOriginSuggestions(false);
  };

  // Select destination from suggestion
  const handleSelectDestination = (item: any) => {
    setDestination(item.name);
    setDestinationCoords({ lat: item.lat, lng: item.lng });
    setShowDestSuggestions(false);
  };

  // Use current GPS location for origin
  const handleUseCurrentLocation = () => {
    setOrigin('My Current Location (GPS)');
    setOriginCoords({ lat: userLocation.lat, lng: userLocation.lng });
    setShowOriginSuggestions(false);
  };

  // Helper: Haversine distance in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculate Route & Optimal Charging Stops
  const handleCalculateRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    setIsSaved(false);

    // 1. Resolve coordinates
    let startLat = originCoords?.lat || userLocation.lat;
    let startLng = originCoords?.lng || userLocation.lng;
    let endLat = destinationCoords?.lat || 12.2958;
    let endLng = destinationCoords?.lng || 76.6394;

    // Check if origin matches a popular hub if coords not explicit
    if (!originCoords) {
      const match = POPULAR_HUBS.find(h => h.name.toLowerCase() === origin.toLowerCase());
      if (match) {
        startLat = match.lat;
        startLng = match.lng;
      }
    }
    if (!destinationCoords) {
      const match = POPULAR_HUBS.find(h => h.name.toLowerCase() === destination.toLowerCase());
      if (match) {
        endLat = match.lat;
        endLng = match.lng;
      }
    }

    // 2. Resolve Vehicle Specs
    let vehicleName = 'Tata Nexon EV Max';
    let batteryCapacityKwh = 40.5;
    let maxChargingSpeedKw = 50.0;
    let vehicleConnector = 'CCS2';

    if (selectedVehicleId > 0) {
      const v = vehicles.find(veh => veh.id === selectedVehicleId);
      if (v) {
        vehicleName = `${v.brand} ${v.model} (${v.licensePlate})`;
        batteryCapacityKwh = v.batteryCapacityKwh || 40.5;
        maxChargingSpeedKw = v.maxChargingSpeedKw || 50.0;
        vehicleConnector = v.connectorType || 'CCS2';
      }
    } else {
      const def = DEFAULT_EV_PROFILES.find(p => p.id === selectedVehicleId) || DEFAULT_EV_PROFILES[0];
      vehicleName = def.name;
      batteryCapacityKwh = def.capacity;
      maxChargingSpeedKw = def.speed;
      vehicleConnector = def.connector;
    }

    // 3. Fetch Real Driving Route via OSRM (or robust mathematical highway interpolation fallback)
    let totalDistKm = 0;
    let totalDriveMinutes = 0;
    let polylineCoords: [number, number][] = [];

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        if (json.code === 'Ok' && json.routes && json.routes.length > 0) {
          const r = json.routes[0];
          totalDistKm = Math.round((r.distance / 1000) * 10) / 10;
          totalDriveMinutes = Math.round(r.duration / 60);

          // OSRM coordinates are [lng, lat] -> map to [lat, lng] for Leaflet
          if (r.geometry && r.geometry.coordinates) {
            polylineCoords = r.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          }
        }
      }
    } catch (err) {
      console.warn('OSRM routing service fallback to curvature model', err);
    }

    // Fallback if OSRM was unreachable or empty
    if (polylineCoords.length === 0 || totalDistKm === 0) {
      const directKm = getDistanceKm(startLat, startLng, endLat, endLng);
      // Realistic road winding factor (1.26x direct distance)
      totalDistKm = Math.round(directKm * 1.26 * 10) / 10;
      // Average 60 km/h speed
      totalDriveMinutes = Math.round((totalDistKm / 58) * 60);

      // Generate 12 intermediate highway points
      const steps = 12;
      polylineCoords = [];
      for (let i = 0; i <= steps; i++) {
        const factor = i / steps;
        const wave = Math.sin(factor * Math.PI) * 0.04;
        const lat = startLat + (endLat - startLat) * factor + wave;
        const lng = startLng + (endLng - startLng) * factor;
        polylineCoords.push([lat, lng]);
      }
    }

    // 4. EV Energy Consumption Model
    const consumptionRate = routePreference === 'fastest' ? 0.165 : 0.145;
    const totalEnergyUsedKwh = Math.round(totalDistKm * consumptionRate * 10) / 10;

    const startEnergyKwh = batteryCapacityKwh * (batterySoc / 100);
    const reserveEnergyKwh = batteryCapacityKwh * (reserveSoc / 100);

    // Energy at destination without any charging stop
    const remainingAtDestKwh = startEnergyKwh - totalEnergyUsedKwh;
    const arrivalSocWithoutStop = Math.round((remainingAtDestKwh / batteryCapacityKwh) * 100);

    // Check if charging stop is required (arrival SoC < reserveSoc)
    const needsChargingHalt = arrivalSocWithoutStop < reserveSoc;

    // 5. Evaluate Real Stations along the Route Corridor
    interface StationCandidate {
      station: Station;
      matchedCharger: Charger;
      detourKm: number;
      atKm: number;
      isAvailable: boolean;
      isFast: boolean;
    }

    const candidates: StationCandidate[] = [];

    stations.forEach(st => {
      // Find distance from route start & destination
      const distFromStart = getDistanceKm(startLat, startLng, st.latitude, st.longitude);
      const distToEnd = getDistanceKm(st.latitude, st.longitude, endLat, endLng);

      // Combined distance detour: (distFromStart + distToEnd) - totalDistKm
      const detourKm = Math.round(Math.max(0, (distFromStart + distToEnd) - totalDistKm) * 10) / 10;

      // Filter: Station must lie within a realistic corridor detour (< 25 km) and between start and end
      if (detourKm <= 25 && distFromStart <= totalDistKm * 1.15) {
        // Find best charger at station
        const chargers = st.chargers || [];
        const dcChargers = chargers.filter(c => c.chargerType === 'DC');
        const bestCharger = (preferFastChargers && dcChargers.length > 0)
          ? dcChargers.sort((a, b) => b.maxPowerKw - a.maxPowerKw)[0]
          : (chargers.length > 0 ? chargers[0] : null);

        if (bestCharger) {
          const isAvail = (st.availableChargers ?? 0) > 0 || bestCharger.status === 'AVAILABLE';
          const isFast = bestCharger.maxPowerKw >= 50;

          candidates.push({
            station: st,
            matchedCharger: bestCharger,
            detourKm,
            atKm: Math.round(distFromStart * 10) / 10,
            isAvailable: isAvail,
            isFast
          });
        }
      }
    });

    // Sort candidates:
    // First by preference (available, fast), then by optimal distance along route
    candidates.sort((a, b) => {
      if (preferAvailable && a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      if (preferFastChargers && a.isFast !== b.isFast) return a.isFast ? -1 : 1;
      return a.detourKm - b.detourKm;
    });

    // 6. Formulate Recommended Charging Stop(s)
    const recommendedStops: RecommendedChargingStop[] = [];
    const alternativeStops: Station[] = [];

    if (candidates.length > 0) {
      // Pick the best candidate along the route
      const top = candidates[0];

      // Battery level at arrival to this stop:
      const energyUsedToStop = top.atKm * consumptionRate;
      const energyAtStop = Math.max(0, startEnergyKwh - energyUsedToStop);
      const arrivalSocAtStop = Math.round((energyAtStop / batteryCapacityKwh) * 100);

      // Target charge to 80% SoC
      const targetSoc = 80;
      const energyNeededKwh = Math.max(
        0,
        Math.round((batteryCapacityKwh * (targetSoc - arrivalSocAtStop) / 100) * 10) / 10
      );

      // Effective charging speed = Math.min(charger speed, vehicle max speed)
      const effectiveChargeKw = Math.min(top.matchedCharger.maxPowerKw, maxChargingSpeedKw);
      const chargingMinutes = Math.round((energyNeededKwh / effectiveChargeKw) * 60) + 5; // +5 mins buffer

      // Estimated cost = kWh * tariff
      const estimatedCost = Math.round(energyNeededKwh * top.matchedCharger.tariffPerKwh);

      recommendedStops.push({
        station: top.station,
        matchedCharger: top.matchedCharger,
        atKm: top.atKm,
        detourKm: top.detourKm,
        arrivalBatteryPercent: arrivalSocAtStop,
        chargeToBatteryPercent: targetSoc,
        energyNeededKwh,
        estimatedChargingMinutes: chargingMinutes,
        estimatedCost,
        isCompatible: true,
        isAvailable: top.isAvailable,
        status: top.matchedCharger.status
      });

      // Remaining candidates become alternative stops
      candidates.slice(1, 4).forEach(c => {
        alternativeStops.push(c.station);
      });
    }

    // 7. Calculate Final Arrival Battery at Destination
    let finalArrivalBatteryPercent = arrivalSocWithoutStop;
    let totalChargingMinutes = 0;

    if (recommendedStops.length > 0) {
      totalChargingMinutes = recommendedStops[0].estimatedChargingMinutes;
      // Started remaining trip from 80% SoC
      const remainingDistance = Math.max(0, totalDistKm - recommendedStops[0].atKm);
      const remainingEnergyUsed = remainingDistance * consumptionRate;
      const finalEnergy = (batteryCapacityKwh * 0.80) - remainingEnergyUsed;
      finalArrivalBatteryPercent = Math.max(0, Math.round((finalEnergy / batteryCapacityKwh) * 100));
    }

    const plan: TripRoutePlan = {
      id: `TRIP-${Date.now()}`,
      origin: { name: origin, lat: startLat, lng: startLng },
      destination: { name: destination, lat: endLat, lng: endLng },
      vehicleName,
      batteryCapacityKwh,
      startSoc: batterySoc,
      reserveSoc,
      routePreference,
      avoidTolls,
      preferAvailable,
      preferFastChargers,
      totalDistanceKm: totalDistKm,
      totalDriveDurationMinutes: totalDriveMinutes,
      totalChargingDurationMinutes: totalChargingMinutes,
      totalEnergyUsedKwh,
      arrivalBatteryPercent: finalArrivalBatteryPercent,
      needsChargingHalt,
      recommendedStops,
      alternativeStops,
      geometryCoordinates: polylineCoords,
      createdAt: new Date().toISOString()
    };

    setCalculatedPlan(plan);
    setIsCalculating(false);

    // Apply route directly to Leaflet Map
    onApplyRoute(plan);
  };

  // Save Trip to localStorage
  const handleSaveTrip = () => {
    if (!calculatedPlan) return;
    const existing = savedTrips.filter(t => t.id !== calculatedPlan.id);
    const updated = [calculatedPlan, ...existing];
    setSavedTrips(updated);
    try {
      localStorage.setItem('hc_saved_trips', JSON.stringify(updated));
    } catch {}
    setIsSaved(true);
  };

  // Load a Saved Trip
  const handleLoadSavedTrip = (saved: TripRoutePlan) => {
    setOrigin(saved.origin.name);
    setOriginCoords({ lat: saved.origin.lat, lng: saved.origin.lng });
    setDestination(saved.destination.name);
    setDestinationCoords({ lat: saved.destination.lat, lng: saved.destination.lng });
    setBatterySoc(saved.startSoc);
    setReserveSoc(saved.reserveSoc);
    setRoutePreference(saved.routePreference);
    setCalculatedPlan(saved);
    onApplyRoute(saved);
    setActiveTab('plan');
  };

  // Delete a Saved Trip
  const handleDeleteSavedTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTrips.filter(t => t.id !== id);
    setSavedTrips(updated);
    try {
      localStorage.setItem('hc_saved_trips', JSON.stringify(updated));
    } catch {}
  };

  // Launch Turn-by-Turn GPS Navigation with Waypoint
  const handleStartNavigation = () => {
    if (!calculatedPlan) return;
    const orig = `${calculatedPlan.origin.lat},${calculatedPlan.origin.lng}`;
    const dest = `${calculatedPlan.destination.lat},${calculatedPlan.destination.lng}`;

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(orig)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;

    if (calculatedPlan.recommendedStops && calculatedPlan.recommendedStops.length > 0) {
      const waypoint = `${calculatedPlan.recommendedStops[0].station.latitude},${calculatedPlan.recommendedStops[0].station.longitude}`;
      url += `&waypoints=${encodeURIComponent(waypoint)}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header (Exact UI reference styling) */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--hc-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <Navigation size={20} style={{ transform: 'rotate(45deg)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                EV Trip Planner
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '1px' }}>
                Find optimal charging stops along your route
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* View Mode Toggle */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'plan' ? 'saved' : 'plan')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Bookmark size={13} color="#059669" />
              <span>{activeTab === 'plan' ? `Saved (${savedTrips.length})` : 'Planner'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--hc-surface-subtle)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--hc-text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: SAVED TRIPS LIST */}
          {activeTab === 'saved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  Your Saved EV Trips
                </h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {savedTrips.length} saved route(s)
                </span>
              </div>

              {savedTrips.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <Navigation size={32} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>No saved trips yet</p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Plan a route and click "Save Trip" to access it quickly here.
                  </p>
                </div>
              ) : (
                savedTrips.map(st => (
                  <div
                    key={st.id}
                    onClick={() => handleLoadSavedTrip(st)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                            {st.origin.name} → {st.destination.name}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                          {st.totalDistanceKm} km • ~{Math.floor(st.totalDriveDurationMinutes / 60)}h {st.totalDriveDurationMinutes % 60}m
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          Vehicle: {st.vehicleName} • Start Battery: {st.startSoc}%
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedTrip(st.id, e)}
                        title="Remove Trip"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TRIP PLANNER INPUTS & CALCULATOR */}
          {activeTab === 'plan' && (
            <form onSubmit={handleCalculateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* 1. Origin & Destination Input Box (Exact visual match to attached reference screenshot) */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '18px',
                padding: '14px 16px',
                border: '1.5px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}>
                {/* Starting Location Row */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
                      flexShrink: 0
                    }} />

                    <input
                      type="text"
                      value={origin}
                      onChange={e => handleOriginChange(e.target.value)}
                      onFocus={() => originSuggestions.length > 0 && setShowOriginSuggestions(true)}
                      placeholder="Starting point (e.g. Bengaluru)"
                      required
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />

                    {/* GPS Locate Me Button */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      title="Use My Current GPS Location"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #a7f3d0',
                        background: '#ecfdf5',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Crosshair size={13} />
                      <span>GPS</span>
                    </button>
                  </div>

                  {/* Origin Autocomplete Dropdown */}
                  {showOriginSuggestions && originSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '24px',
                      right: 0,
                      zIndex: 30,
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      maxHeight: '180px',
                      overflowY: 'auto'
                    }}>
                      {originSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectOrigin(item)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: idx === originSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {item.name}
                          </div>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{item.region}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtle Divider */}
                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '0 4px 0 24px' }} />

                {/* Destination Row */}
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      backgroundColor: '#ef4444',
                      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)',
                      flexShrink: 0
                    }} />

                    <input
                      type="text"
                      value={destination}
                      onChange={e => handleDestChange(e.target.value)}
                      onFocus={() => destSuggestions.length > 0 && setShowDestSuggestions(true)}
                      placeholder="Destination (e.g. Mysuru)"
                      required
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                  </div>

                  {/* Destination Autocomplete Dropdown */}
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '24px',
                      right: 0,
                      zIndex: 30,
                      marginTop: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {destSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectDestination(item)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: idx === destSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {item.name}
                          </div>
                          <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>{item.region}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Destination Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, alignSelf: 'center' }}>Popular:</span>
                {['Mysuru', 'Hosur', 'Whitefield', 'Electronic City', 'Airport'].map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const match = POPULAR_HUBS.find(h => h.name.includes(chip));
                      if (match) {
                        setDestination(match.name);
                        setDestinationCoords({ lat: match.lat, lng: match.lng });
                      } else {
                        setDestination(chip);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: destination.includes(chip) ? '#ecfdf5' : '#ffffff',
                      color: destination.includes(chip) ? '#059669' : '#475569',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* 2. Vehicle Selector (From My EVs) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={16} color="#059669" />
                    Select EV Vehicle:
                  </label>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                    {vehicles.length > 0 ? `${vehicles.length} Saved in My EVs` : 'Preset Profiles'}
                  </span>
                </div>

                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none'
                  }}
                >
                  {vehicles.length > 0 && (
                    <optgroup label="My Registered EVs">
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.licensePlate}) • {v.batteryCapacityKwh} kWh
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Standard EV Profiles">
                    {DEFAULT_EV_PROFILES.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} • {p.capacity} kWh ({p.connector})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 3. Current Battery Level Slider (Exact match to reference screenshot) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BatteryCharging size={17} color="#059669" />
                    Current Battery Charge:
                  </label>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: batterySoc >= 50 ? '#059669' : batterySoc >= 25 ? '#d97706' : '#dc2626'
                  }}>
                    {batterySoc}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={batterySoc}
                  onChange={e => setBatterySoc(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    accentColor: '#059669',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* 4. Minimum Safe Reserve Buffer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="#059669" />
                    Minimum Arrival Battery Reserve:
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>
                    {reserveSoc}% buffer
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {[10, 15, 20, 25].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setReserveSoc(pct)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: reserveSoc === pct ? '1.5px solid #059669' : '1px solid #cbd5e1',
                        background: reserveSoc === pct ? '#ecfdf5' : '#ffffff',
                        color: reserveSoc === pct ? '#059669' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {pct}% {pct === 15 ? '★' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Route & Charger Preferences Accordion */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={15} color="#059669" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                      Route Preferences & Filters
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    color="#64748b"
                    style={{ transform: showAdvancedSettings ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>

                {showAdvancedSettings && (
                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff' }}>
                    {/* Fastest vs Shortest */}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                        Optimization Goal
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setRoutePreference('fastest')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: routePreference === 'fastest' ? '2px solid #059669' : '1px solid #cbd5e1',
                            background: routePreference === 'fastest' ? '#ecfdf5' : '#ffffff',
                            color: routePreference === 'fastest' ? '#059669' : '#475569',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Fastest Route
                        </button>

                        <button
                          type="button"
                          onClick={() => setRoutePreference('shortest')}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            border: routePreference === 'shortest' ? '2px solid #059669' : '1px solid #cbd5e1',
                            background: routePreference === 'shortest' ? '#ecfdf5' : '#ffffff',
                            color: routePreference === 'shortest' ? '#059669' : '#475569',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          📏 Shortest Distance
                        </button>
                      </div>
                    </div>

                    {/* Checkbox Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={avoidTolls}
                          onChange={e => setAvoidTolls(e.target.checked)}
                          style={{ accentColor: '#059669' }}
                        />
                        <span style={{ color: '#334155', fontWeight: 600 }}>Avoid Toll Roads</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={preferAvailable}
                          onChange={e => setPreferAvailable(e.target.checked)}
                          style={{ accentColor: '#059669' }}
                        />
                        <span style={{ color: '#334155', fontWeight: 600 }}>Prefer Currently Available Chargers</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={preferFastChargers}
                          onChange={e => setPreferFastChargers(e.target.checked)}
                          style={{ accentColor: '#059669' }}
                        />
                        <span style={{ color: '#334155', fontWeight: 600 }}>Prefer DC Fast Chargers (≥50 kW)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Primary Action: Calculate Route & Stops Button (Exact styling from screenshot) */}
              <button
                type="submit"
                disabled={isCalculating}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: isCalculating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                  transition: 'background-color 0.2s'
                }}
              >
                {isCalculating ? (
                  <>
                    <RotateCcw size={16} className="animate-spin" />
                    <span>Calculating Smart Route...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate Route & Stops</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* RESULTS CARD & RECOMMENDED CHARGING STOPS */}
          {calculatedPlan && activeTab === 'plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>

              {/* Route Summary Overview Card */}
              <div style={{
                padding: '16px 18px',
                borderRadius: '16px',
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>
                    Total Distance & Time
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                    {calculatedPlan.totalDistanceKm} km
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                    ~{Math.floor(calculatedPlan.totalDriveDurationMinutes / 60)}h {calculatedPlan.totalDriveDurationMinutes % 60}m driving
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>
                    Energy & Battery
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                    {calculatedPlan.totalEnergyUsedKwh} kWh
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                    Arrival Battery: ~{calculatedPlan.arrivalBatteryPercent}%
                  </div>
                </div>
              </div>

              {/* Recommended Charging Halt */}
              {calculatedPlan.recommendedStops.length > 0 ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recommended Charging Halt
                    </h4>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                      Optimal Station
                    </span>
                  </div>

                  {calculatedPlan.recommendedStops.map((stop, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '2px solid #a7f3d0',
                        borderRadius: '18px',
                        padding: '16px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            backgroundColor: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#059669',
                            flexShrink: 0
                          }}>
                            <Zap size={22} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                              {stop.station.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                              At Km {stop.atKm} • Stop for ~{stop.estimatedChargingMinutes} mins to charge from {stop.arrivalBatteryPercent}% to {stop.chargeToBatteryPercent}%
                            </div>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: stop.isAvailable ? '#ecfdf5' : '#fef2f2',
                          color: stop.isAvailable ? '#059669' : '#dc2626',
                          border: stop.isAvailable ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          flexShrink: 0
                        }}>
                          {stop.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>

                      {/* Station Specs Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        background: '#f8fafc',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        marginTop: '12px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Connector:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>{stop.matchedCharger.chargerType} ({stop.matchedCharger.maxPowerKw} kW)</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Tariff:</span>{' '}
                          <strong style={{ color: '#059669' }}>₹{stop.matchedCharger.tariffPerKwh}/kWh</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Energy Need:</span>{' '}
                          <strong style={{ color: '#0f172a' }}>~{stop.energyNeededKwh} kWh</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Est. Cost:</span>{' '}
                          <strong style={{ color: '#059669' }}>₹{stop.estimatedCost}</strong>
                        </div>
                      </div>

                      {/* Stop Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStation(stop.station);
                            onClose();
                          }}
                          style={{
                            flex: 1,
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <MapPin size={13} color="#059669" />
                          <span>View Station on Map</span>
                        </button>

                        {onStartChargeOnCharger && (
                          <button
                            type="button"
                            onClick={() => {
                              onStartChargeOnCharger(stop.matchedCharger);
                              onClose();
                            }}
                            style={{
                              flex: 1,
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: '#059669',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <Zap size={14} />
                            <span>Start Charging</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#065f46' }}>
                    <strong>Direct Trip Feasible!</strong> Your battery allows completing this journey with ~{calculatedPlan.arrivalBatteryPercent}% remaining (above your {calculatedPlan.reserveSoc}% safety reserve).
                  </div>
                </div>
              )}

              {/* Alternative Charging Stations Along Corridor */}
              {calculatedPlan.alternativeStops.length > 0 && (
                <div>
                  <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Alternative Charging Stops Along Route
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {calculatedPlan.alternativeStops.map(alt => (
                      <div
                        key={alt.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{alt.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{alt.address || alt.city} • {alt.availableChargers || 1} available</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectStation(alt);
                            onClose();
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#059669',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          View Map
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Start Navigation & Save Trip */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleSaveTrip}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '12px',
                    border: '1.5px solid #a7f3d0',
                    backgroundColor: isSaved ? '#ecfdf5' : '#ffffff',
                    color: '#059669',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  <span>{isSaved ? 'Trip Saved!' : 'Save Trip'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartNavigation}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'linear-gradient(135deg, #10b981, #059669)',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <Navigation size={15} />
                  <span>Start Navigation</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              {/* View Full Route on Map */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Close & View Full Route on Leaflet Map →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};