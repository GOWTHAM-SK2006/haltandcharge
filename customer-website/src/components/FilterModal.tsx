import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  X,
  Check,
  Car,
  Zap,
  BatteryCharging,
  CheckCircle2,
  MapPin,
  IndianRupee,
  Clock,
  ShieldCheck,
  Coffee,
  Star,
  RotateCcw,
  SlidersHorizontal,
  Wifi,
  Armchair,
  Utensils,
  Warehouse,
  Shield
} from 'lucide-react';
import { Station, Vehicle } from '../types';

export interface FilterCriteria {
  vehicleId: number | null;
  connectors: string[];
  powerRanges: string[]; // 'SLOW' | 'FAST' | 'RAPID' | 'ULTRA'
  acDc: 'ALL' | 'AC' | 'DC';
  availability: 'ALL' | 'AVAILABLE_ONLY';
  maxDistanceKm: number | null;
  maxTariff: number | null;
  openingHours: 'ALL' | '24_7';
  stationAccess: 'ALL' | 'PUBLIC';
  amenities: string[];
  minRating: number | null;
}

export const defaultFilterCriteria: FilterCriteria = {
  vehicleId: null,
  connectors: [],
  powerRanges: [],
  acDc: 'ALL',
  availability: 'ALL',
  maxDistanceKm: null,
  maxTariff: null,
  openingHours: 'ALL',
  stationAccess: 'ALL',
  amenities: [],
  minRating: null
};

export function matchesFilterCriteria(
  station: Station,
  criteria: FilterCriteria,
  vehicles: Vehicle[],
  userLocation: { lat: number; lng: number }
): boolean {
  // 1. My Vehicles: match connector or power
  if (criteria.vehicleId) {
    const veh = vehicles.find(v => v.id === criteria.vehicleId);
    if (veh) {
      const vConn = veh.connectorType.toUpperCase();
      const hasMatchingCharger = station.chargers?.some(c => {
        const cType = c.chargerType.toUpperCase();
        const cName = c.name.toUpperCase();
        if (vConn.includes('CCS') && (cType === 'DC' || cName.includes('CCS'))) return true;
        if (vConn.includes('TYPE 2') && (cType === 'AC' || cName.includes('TYPE 2'))) return true;
        if (vConn.includes('CHADEMO') && cName.includes('CHADEMO')) return true;
        if (vConn.includes('GB/T') && cName.includes('GB/T')) return true;
        return c.name.toUpperCase().includes(vConn);
      });
      if (!hasMatchingCharger) return false;
    }
  }

  // 2. Connectors
  if (criteria.connectors.length > 0) {
    const matchesAnyConnector = criteria.connectors.some(conn => {
      const cUpper = conn.toUpperCase();
      return station.chargers?.some(c => {
        if (cUpper === 'CCS2') return c.chargerType === 'DC' || c.name.toUpperCase().includes('CCS');
        if (cUpper === 'TYPE 2') return c.chargerType === 'AC' || c.name.toUpperCase().includes('TYPE 2');
        if (cUpper === 'CHADEMO') return c.name.toUpperCase().includes('CHADEMO');
        if (cUpper === 'GB/T') return c.name.toUpperCase().includes('GB/T');
        return c.name.toUpperCase().includes(cUpper);
      });
    });
    if (!matchesAnyConnector) return false;
  }

  // 3. Charger Power (kW)
  if (criteria.powerRanges.length > 0) {
    const matchesAnyPower = criteria.powerRanges.some(range => {
      return station.chargers?.some(c => {
        const kw = c.maxPowerKw || 0;
        if (range === 'SLOW') return kw < 22;
        if (range === 'FAST') return kw >= 22 && kw <= 50;
        if (range === 'RAPID') return kw > 50 && kw <= 120;
        if (range === 'ULTRA') return kw > 120;
        return false;
      });
    });
    if (!matchesAnyPower) return false;
  }

  // 4. AC / DC
  if (criteria.acDc === 'AC') {
    const hasAc = station.chargers?.some(c => c.chargerType === 'AC');
    if (!hasAc) return false;
  } else if (criteria.acDc === 'DC') {
    const hasDc = station.chargers?.some(c => c.chargerType === 'DC');
    if (!hasDc) return false;
  }

  // 5. Availability
  if (criteria.availability === 'AVAILABLE_ONLY') {
    const isAvail = (station.availableChargers ?? 0) > 0 || station.chargers?.some(c => c.status === 'AVAILABLE');
    if (!isAvail || !station.isActive) return false;
  }

  // 6. Distance
  if (criteria.maxDistanceKm !== null) {
    let dist = station.distanceKm;
    if (dist === undefined) {
      const R = 6371;
      const dLat = (station.latitude - userLocation.lat) * Math.PI / 180;
      const dLng = (station.longitude - userLocation.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(station.latitude * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    if (dist > criteria.maxDistanceKm) return false;
  }

  // 7. Tariff (₹/kWh)
  if (criteria.maxTariff !== null) {
    const hasAffordableCharger = station.chargers?.some(c => (c.tariffPerKwh || 0) <= criteria.maxTariff!);
    if (!hasAffordableCharger) return false;
  }

  // 8. Opening Hours
  if (criteria.openingHours === '24_7') {
    if (!station.operatingHours?.includes('24/7')) return false;
  }

  // 9. Station Access
  if (criteria.stationAccess === 'PUBLIC') {
    if (!station.isActive || station.status !== 'OPERATIONAL') return false;
  }

  // 10. Amenities
  if (criteria.amenities.length > 0) {
    const stationAmenities = (station.amenities || '').toLowerCase();
    const matchesAllAmenities = criteria.amenities.every(amenity =>
      stationAmenities.includes(amenity.toLowerCase())
    );
    if (!matchesAllAmenities) return false;
  }

  // 11. Ratings
  if (criteria.minRating !== null) {
    const rating = 4.6;
    if (rating < criteria.minRating) return false;
  }

  return true;
}

export function countActiveFilters(criteria: FilterCriteria): number {
  let count = 0;
  if (criteria.vehicleId) count++;
  count += criteria.connectors.length;
  count += criteria.powerRanges.length;
  if (criteria.acDc !== 'ALL') count++;
  if (criteria.availability !== 'ALL') count++;
  if (criteria.maxDistanceKm !== null) count++;
  if (criteria.maxTariff !== null) count++;
  if (criteria.openingHours !== 'ALL') count++;
  if (criteria.stationAccess !== 'ALL') count++;
  count += criteria.amenities.length;
  if (criteria.minRating !== null) count++;
  return count;
}

type CategoryKey =
  | 'vehicles'
  | 'connectors'
  | 'power'
  | 'acdc'
  | 'availability'
  | 'distance'
  | 'tariff'
  | 'hours'
  | 'access'
  | 'amenities'
  | 'ratings';

interface CategoryItem {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { key: 'vehicles', label: 'My Vehicles', icon: <Car size={16} /> },
  { key: 'connectors', label: 'Connectors', icon: <Zap size={16} /> },
  { key: 'power', label: 'Charger Power', icon: <BatteryCharging size={16} /> },
  { key: 'acdc', label: 'AC/DC', icon: <Zap size={16} /> },
  { key: 'availability', label: 'Availability', icon: <CheckCircle2 size={16} /> },
  { key: 'distance', label: 'Distance', icon: <MapPin size={16} /> },
  { key: 'tariff', label: 'Tariff (₹/kWh)', icon: <IndianRupee size={16} /> },
  { key: 'hours', label: 'Opening Hours', icon: <Clock size={16} /> },
  { key: 'access', label: 'Station Access', icon: <ShieldCheck size={16} /> },
  { key: 'amenities', label: 'Amenities', icon: <Coffee size={16} /> },
  { key: 'ratings', label: 'Ratings', icon: <Star size={16} /> }
];

interface FilterModalProps {
  stations: Station[];
  vehicles: Vehicle[];
  userLocation: { lat: number; lng: number };
  initialCriteria: FilterCriteria;
  onApply: (criteria: FilterCriteria) => void;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  stations,
  vehicles,
  userLocation,
  initialCriteria,
  onApply,
  onClose
}) => {
  const [criteria, setCriteria] = useState<FilterCriteria>(initialCriteria);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('vehicles');

  // Calculate live matching stations count
  const matchingCount = useMemo(() => {
    return stations.filter(s => matchesFilterCriteria(s, criteria, vehicles, userLocation)).length;
  }, [stations, criteria, vehicles, userLocation]);

  // Compute category active badge counts
  const categoryCounts = useMemo(() => {
    return {
      vehicles: criteria.vehicleId ? 1 : 0,
      connectors: criteria.connectors.length,
      power: criteria.powerRanges.length,
      acdc: criteria.acDc !== 'ALL' ? 1 : 0,
      availability: criteria.availability !== 'ALL' ? 1 : 0,
      distance: criteria.maxDistanceKm !== null ? 1 : 0,
      tariff: criteria.maxTariff !== null ? 1 : 0,
      hours: criteria.openingHours !== 'ALL' ? 1 : 0,
      access: criteria.stationAccess !== 'ALL' ? 1 : 0,
      amenities: criteria.amenities.length,
      ratings: criteria.minRating !== null ? 1 : 0
    };
  }, [criteria]);

  // Handle Clear All
  const handleClearAll = () => {
    setCriteria(defaultFilterCriteria);
  };

  // Toggle helpers
  const toggleConnector = (connector: string) => {
    setCriteria(prev => ({
      ...prev,
      connectors: prev.connectors.includes(connector)
        ? prev.connectors.filter(c => c !== connector)
        : [...prev.connectors, connector]
    }));
  };

  const togglePowerRange = (range: string) => {
    setCriteria(prev => ({
      ...prev,
      powerRanges: prev.powerRanges.includes(range)
        ? prev.powerRanges.filter(r => r !== range)
        : [...prev.powerRanges, range]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setCriteria(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '640px',
          margin: '0 auto',
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.22)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#cbd5e1',
            margin: '10px auto 4px'
          }}
        />

        {/* Panel Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 18px 12px',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          {/* Back button */}
          <button
            onClick={onClose}
            title="Back to Map"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              outline: 'none',
              transition: 'background-color 0.15s ease'
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>

          {/* Centered Title */}
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.2px',
              margin: 0
            }}
          >
            Filters
          </h2>

          {/* Clear All button */}
          <button
            onClick={handleClearAll}
            title="Reset All Filters"
            style={{
              background: 'none',
              border: 'none',
              color: '#059669',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            Clear All
          </button>
        </div>

        {/* Two-Column Layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Filter Categories */}
          <div
            style={{
              width: '148px',
              minWidth: '148px',
              backgroundColor: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              overflowY: 'auto',
              padding: '6px 0'
            }}
          >
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key;
              const count = categoryCounts[cat.key];

              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    background: isActive ? '#ffffff' : 'transparent',
                    borderLeft: isActive ? '3.5px solid #059669' : '3.5px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    outline: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ color: isActive ? '#059669' : '#64748b' }}>{cat.icon}</div>
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? '#059669' : '#334155',
                        lineHeight: 1.2
                      }}
                    >
                      {cat.label}
                    </span>
                  </div>

                  {count > 0 && (
                    <span
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        flexShrink: 0
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Category Options */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 18px 24px',
              backgroundColor: '#ffffff'
            }}
          >
            {/* 1. MY VEHICLES */}
            {activeCategory === 'vehicles' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  My Vehicles
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter stations with compatible connectors for your vehicle.
                </p>

                {vehicles.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {vehicles.map(v => {
                      const isSelected = criteria.vehicleId === v.id;
                      return (
                        <div
                          key={v.id}
                          onClick={() =>
                            setCriteria(prev => ({
                              ...prev,
                              vehicleId: isSelected ? null : v.id
                            }))
                          }
                          style={{
                            padding: '12px 14px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                            backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 4px 14px rgba(5, 150, 105, 0.12)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '12px',
                                backgroundColor: isSelected ? '#d1fae5' : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isSelected ? '#059669' : '#475569'
                              }}
                            >
                              <Car size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                                {v.brand} {v.model}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                {v.licensePlate} • <span style={{ fontWeight: 700, color: '#059669' }}>{v.connectorType}</span>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                              backgroundColor: isSelected ? '#059669' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff'
                            }}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setCriteria(prev => ({ ...prev, vehicleId: null }))}
                      style={{
                        padding: '10px',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px',
                        background: 'none',
                        color: '#64748b',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      Deselect Vehicle (Show All Stations)
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px 16px',
                      borderRadius: '16px',
                      backgroundColor: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      textAlign: 'center'
                    }}
                  >
                    <Car size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155' }}>
                      No Vehicles Added
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Add your EV in "My EVs" to quickly match compatible charging stations.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. CONNECTORS */}
            {activeCategory === 'connectors' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Connector Types
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Select the charging plug types supported by your EV.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'CCS2', name: 'CCS 2 (Combined DC)', desc: 'Standard DC Fast Charging (Tata, MG, Hyundai, Kia)' },
                    { key: 'Type 2', name: 'Type 2 (Mennekes AC)', desc: 'Standard AC Destination Charging up to 22 kW' },
                    { key: 'CHAdeMO', name: 'CHAdeMO (DC)', desc: 'Japanese DC Fast standard plug' },
                    { key: 'GB/T', name: 'GB/T (DC Fast)', desc: 'Commercial & Fleet Fast EV Standard' }
                  ].map(conn => {
                    const isSelected = criteria.connectors.includes(conn.key);
                    return (
                      <div
                        key={conn.key}
                        onClick={() => toggleConnector(conn.key)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {conn.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {conn.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. CHARGER POWER (kW) */}
            {activeCategory === 'power' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Charger Power Rating
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Select the minimum charging output speed.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'SLOW', title: 'Standard AC (< 22 kW)', desc: 'Ideal for overnight or relaxed destination charging' },
                    { key: 'FAST', title: 'Fast (22 kW - 50 kW)', desc: 'Commercial fast AC and city DC charging' },
                    { key: 'RAPID', title: 'Rapid DC (50 kW - 120 kW)', desc: 'Quick highway DC boost in 30-45 minutes' },
                    { key: 'ULTRA', title: 'Ultra-Fast DC (> 120 kW)', desc: 'HyperFast 150kW-180kW charging in 15-25 minutes' }
                  ].map(p => {
                    const isSelected = criteria.powerRanges.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePowerRange(p.key)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {p.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. AC / DC */}
            {activeCategory === 'acdc' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Current Type (AC / DC)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter between Alternating Current (AC) and Direct Current (DC).
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'ALL', label: 'All Chargers (AC + DC)', desc: 'Show stations with either AC or DC guns' },
                    { key: 'DC', label: 'DC Rapid Charging Only', desc: 'Direct fast charging directly to vehicle battery' },
                    { key: 'AC', label: 'AC Destination Only', desc: 'Mennekes AC chargers for steady charging' }
                  ].map(opt => {
                    const isSelected = criteria.acDc === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => setCriteria(prev => ({ ...prev, acDc: opt.key as any }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. AVAILABILITY */}
            {activeCategory === 'availability' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Charger Availability
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter only stations that have free charging guns right now.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'ALL', label: 'All Stations', desc: 'Show all operational stations regardless of current queue' },
                    { key: 'AVAILABLE_ONLY', label: 'Available Now Only', desc: 'Only show stations with at least 1 free charging gun ready' }
                  ].map(opt => {
                    const isSelected = criteria.availability === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => setCriteria(prev => ({ ...prev, availability: opt.key as any }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. DISTANCE */}
            {activeCategory === 'distance' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Maximum Distance
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Find chargers within your preferred driving radius.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: null, label: 'Any Distance', desc: 'No distance limitation' },
                    { value: 5, label: 'Within 5 km', desc: 'Closest stations in your immediate vicinity' },
                    { value: 10, label: 'Within 10 km', desc: 'City area charging stations' },
                    { value: 25, label: 'Within 25 km', desc: 'Extended metropolitan radius' },
                    { value: 50, label: 'Within 50 km', desc: 'Highways and regional outer hubs' }
                  ].map(opt => {
                    const isSelected = criteria.maxDistanceKm === opt.value;
                    return (
                      <div
                        key={String(opt.value)}
                        onClick={() => setCriteria(prev => ({ ...prev, maxDistanceKm: opt.value }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. TARIFF (₹/kWh) */}
            {activeCategory === 'tariff' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Maximum Tariff Price
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Set a price ceiling for electricity rate per unit.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: null, label: 'Any Tariff', desc: 'Show all pricing tiers' },
                    { value: 15.0, label: 'Up to ₹ 15.00 / kWh', desc: 'Economy & affordable night charging' },
                    { value: 18.5, label: 'Up to ₹ 18.50 / kWh', desc: 'Standard commercial DC charging' },
                    { value: 22.0, label: 'Up to ₹ 22.00 / kWh', desc: 'Premium Ultra-Fast DC Highway hubs' }
                  ].map(opt => {
                    const isSelected = criteria.maxTariff === opt.value;
                    return (
                      <div
                        key={String(opt.value)}
                        onClick={() => setCriteria(prev => ({ ...prev, maxTariff: opt.value }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 8. OPENING HOURS */}
            {activeCategory === 'hours' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Opening Hours
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter stations that are operational around the clock.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'ALL', label: 'All Operating Schedules', desc: 'Includes daytime hubs and 24/7 stations' },
                    { key: '24_7', label: 'Open 24/7 Only', desc: 'Guaranteed 24-hour non-stop accessibility' }
                  ].map(opt => {
                    const isSelected = criteria.openingHours === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => setCriteria(prev => ({ ...prev, openingHours: opt.key as any }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 9. STATION ACCESS */}
            {activeCategory === 'access' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  Station Access
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter by open public access status.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'ALL', label: 'All Stations', desc: 'Public and partner network hubs' },
                    { key: 'PUBLIC', label: 'Public Access Only', desc: 'Open to all EV drivers without private restrictions' }
                  ].map(opt => {
                    const isSelected = criteria.stationAccess === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => setCriteria(prev => ({ ...prev, stationAccess: opt.key as any }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 10. AMENITIES */}
            {activeCategory === 'amenities' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  On-Site Amenities
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Select convenience facilities you need while charging.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {[
                    { key: 'Restroom', label: 'Clean Restroom', icon: <Armchair size={17} /> },
                    { key: 'Cafe', label: 'Cafe & Refreshments', icon: <Coffee size={17} /> },
                    { key: 'Free WiFi', label: 'Free High-Speed WiFi', icon: <Wifi size={17} /> },
                    { key: 'Waiting Lounge', label: 'Air-Conditioned Lounge', icon: <Armchair size={17} /> },
                    { key: 'Food Court', label: 'Food Court / Dining', icon: <Utensils size={17} /> },
                    { key: 'Covered Parking', label: 'Covered Solar Canopy', icon: <Warehouse size={17} /> },
                    { key: '24/7 Security', label: '24/7 CCTV & Security', icon: <Shield size={17} /> }
                  ].map(amenity => {
                    const isSelected = criteria.amenities.includes(amenity.key);
                    return (
                      <div
                        key={amenity.key}
                        onClick={() => toggleAmenity(amenity.key)}
                        style={{
                          padding: '11px 14px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ color: isSelected ? '#059669' : '#64748b' }}>{amenity.icon}</div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {amenity.label}
                          </span>
                        </div>

                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 11. RATINGS */}
            {activeCategory === 'ratings' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  User Ratings
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Filter by driver feedback and community scores.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: null, label: 'All Ratings', desc: 'Show all stations' },
                    { value: 4.0, label: '4.0+ Stars ★★★★☆', desc: 'Highly rated by drivers' },
                    { value: 4.5, label: '4.5+ Stars ★★★★★', desc: 'Top-tier verified charging hubs' }
                  ].map(opt => {
                    const isSelected = criteria.minRating === opt.value;
                    return (
                      <div
                        key={String(opt.value)}
                        onClick={() => setCriteria(prev => ({ ...prev, minRating: opt.value }))}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid #059669' : '1.5px solid #e2e8f0',
                          backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {opt.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #059669' : '2px solid #cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Action Button */}
        <div
          style={{
            padding: '12px 20px 18px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.05)'
          }}
        >
          <button
            onClick={() => {
              onApply(criteria);
              onClose();
            }}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.4)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>Show {matchingCount} {matchingCount === 1 ? 'Station' : 'Stations'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

