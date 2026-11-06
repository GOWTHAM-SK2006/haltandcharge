import React, { useState, useEffect } from 'react';
import {
  Zap, MapPin, Navigation, Car, Heart, BatteryCharging,
  Search, Shield, CheckCircle2, ArrowRight, User, LogOut,
  SlidersHorizontal, Clock, Compass, AlertCircle, RefreshCw,
  QrCode, Play, StopCircle, Radio
} from 'lucide-react';
import { apiRequest } from './api';
import { Station, Charger, Vehicle, ChargingSession, UserProfile } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hc_customer_token'));
  const [activeTab, setActiveTab] = useState<'stations' | 'trip' | 'vehicles' | 'session' | 'profile'>('stations');

  // Auth states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('customer@haltcharge.com');
  const [authPassword, setAuthPassword] = useState('Password@123');
  const [authFullName, setAuthFullName] = useState('Arjun Sharma');
  const [authPhone, setAuthPhone] = useState('+91 9876543211');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App data states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favourites, setFavourites] = useState<Station[]>([]);
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ChargingSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DC' | 'AC'>('ALL');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // QR / Instant Charge Modal
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedChargerId, setSelectedChargerId] = useState<string>('HC-KOR-DC-01');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  // Add Vehicle Modal
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: 'Tata',
    model: 'Curvv EV',
    licensePlate: 'KA-04-EV-2025',
    batteryCapacityKwh: 55,
    connectorType: 'CCS2',
    maxChargingSpeedKw: 70,
    isDefault: true
  });

  // Trip planner states
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Mysuru');
  const [tripRouteCalculated, setTripRouteCalculated] = useState(false);

  // User coordinate (Bengaluru center default)
  const userLat = 12.9352;
  const userLng = 77.6245;

  // Login / Register handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await apiRequest<{ token: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        localStorage.setItem('hc_customer_token', res.token);
        setToken(res.token);
      } else {
        const res = await apiRequest<{ token: string }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            fullName: authFullName,
            phoneNumber: authPhone
          })
        });
        localStorage.setItem('hc_customer_token', res.token);
        setToken(res.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hc_customer_token');
    setToken(null);
    setProfile(null);
    setActiveSession(null);
  };

  // Fetch core data
  const fetchData = async () => {
    try {
      const [stList, prof, vehList, favs, actSes, sesHist] = await Promise.all([
        apiRequest<Station[]>(`/api/stations?lat=${userLat}&lng=${userLng}`).catch(() => []),
        token ? apiRequest<UserProfile>('/api/me').catch(() => null) : Promise.resolve(null),
        token ? apiRequest<Vehicle[]>('/api/vehicles').catch(() => []) : Promise.resolve([]),
        token ? apiRequest<Station[]>('/api/me/favourites').catch(() => []) : Promise.resolve([]),
        token ? apiRequest<ChargingSession>('/api/charging-sessions/active').catch(() => null) : Promise.resolve(null),
        token ? apiRequest<ChargingSession[]>('/api/charging-sessions').catch(() => []) : Promise.resolve([])
      ]);

      setStations(stList);
      if (prof) setProfile(prof);
      setVehicles(vehList);
      setFavourites(favs);
      setActiveSession(actSes);
      setSessionHistory(sesHist);

      if (vehList.length > 0 && !selectedVehicleId) {
        const def = vehList.find(v => v.isDefault) || vehList[0];
        setSelectedVehicleId(def.id);
      }
    } catch (err) {
      console.error('Failed to load user portal data', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling for live charger statuses and telemetry ticks
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [token]);

  // Start Charging session
  const handleStartCharging = async () => {
    if (!token) {
      alert('Please sign in to start a charging session');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiRequest<ChargingSession>('/api/charging-sessions', {
        method: 'POST',
        body: JSON.stringify({
          chargerIdentifier: selectedChargerId,
          vehicleId: selectedVehicleId
        })
      });
      setActiveSession(res);
      setShowChargeModal(false);
      setActiveTab('session');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  // Stop Charging session
  const handleStopCharging = async (sessionId: number) => {
    if (!confirm('Are you sure you want to stop this charging session?')) return;
    setActionLoading(true);
    try {
      await apiRequest(`/api/charging-sessions/${sessionId}/stop`, {
        method: 'POST'
      });
      setActiveSession(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to stop session');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Favourite
  const handleToggleFavourite = async (stationId: number) => {
    if (!token) {
      alert('Sign in to save favourite stations');
      return;
    }
    const isFav = favourites.some(f => f.id === stationId);
    try {
      if (isFav) {
        await apiRequest(`/api/me/favourites/${stationId}`, { method: 'DELETE' });
      } else {
        await apiRequest(`/api/me/favourites/${stationId}`, { method: 'POST' });
      }
      fetchData();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(newVehicle)
      });
      setShowAddVehicleModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add vehicle');
    }
  };

  // Filtered stations
  const filteredStations = stations.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.city.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'ALL') return true;
    return st.chargers?.some(c => c.chargerType === filterType);
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header style={{
        background: 'rgba(13, 18, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('stations')}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00FF88, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#052e16',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.35)'
          }}>
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              HALT <span style={{ color: 'var(--accent-neon)' }}>&</span> CHARGE
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Superfast EV Charging Network
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'stations', label: 'Find Chargers', icon: MapPin },
            { id: 'trip', label: 'Plan a Trip', icon: Navigation },
            { id: 'vehicles', label: 'My EVs', icon: Car },
            { id: 'session', label: 'Active Session', icon: BatteryCharging, badge: activeSession ? 'LIVE' : undefined },
            { id: 'profile', label: 'My Account', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: active ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                  color: active ? 'var(--accent-neon)' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: 'var(--accent-neon)',
                    color: '#052e16',
                    fontWeight: 800
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {token && profile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{profile.fullName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{profile.email}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '10px 20px',
                background: 'var(--accent-neon)',
                color: '#052e16',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

        {/* TAB 1: FIND CHARGERS / MAP LIST */}
        {activeTab === 'stations' && (
          <div>
            {/* Hero Banner / Quick Action */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.12), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '16px',
              padding: '28px 36px',
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(0, 255, 136, 0.2)',
                  color: 'var(--accent-neon)',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginBottom: '10px'
                }}>
                  <Radio size={14} className="spin" /> HIGH-SPEED CHARGING HUBS LIVE
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
                  Locate, Plug & Charge Seamlessly
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px' }}>
                  Explore 120kW+ UltraFast DC stations across your route. Powered by real-time virtual hardware telemetry.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowChargeModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #00FF88, #10b981)',
                    color: '#052e16',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0, 255, 136, 0.35)'
                  }}
                >
                  <QrCode size={18} />
                  Scan QR / Instant Charge
                </button>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '28px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 18px',
                flex: 1,
                minWidth: '280px'
              }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search stations by name, road or city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    outline: 'none',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['ALL', 'DC', 'AC'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: filterType === type ? 'var(--accent-neon)' : 'var(--bg-secondary)',
                      color: filterType === type ? '#052e16' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {type === 'ALL' ? 'All Types' : `${type} Rapid`}
                  </button>
                ))}
              </div>
            </div>

            {/* Stations Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px'
            }}>
              {filteredStations.map(station => {
                const isFav = favourites.some(f => f.id === station.id);
                return (
                  <div
                    key={station.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, border-color 0.2s',
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                            {station.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            <MapPin size={14} color="var(--accent-neon)" />
                            <span>{station.address}, {station.city}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleFavourite(station.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isFav ? 'var(--accent-red)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Heart size={20} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Distance & Availability Badges */}
                      <div style={{ display: 'flex', gap: '10px', margin: '14px 0', flexWrap: 'wrap' }}>
                        {station.distanceKm !== undefined && (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--accent-cyan)'
                          }}>
                            {station.distanceKm} km away
                          </span>
                        )}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: station.availableChargers && station.availableChargers > 0 ? 'rgba(0, 255, 136, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: station.availableChargers && station.availableChargers > 0 ? 'var(--accent-neon)' : 'var(--accent-red)',
                          fontSize: '12px',
                          fontWeight: 700
                        }}>
                          {station.availableChargers || 0} / {station.totalChargers || 0} Available
                        </span>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}>
                          {station.operatingHours}
                        </span>
                      </div>

                      {/* Connectors / Chargers List */}
                      <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          Available Charging Guns:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {station.chargers?.map(charger => (
                            <div
                              key={charger.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--bg-card)',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>{charger.identifier}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  {charger.chargerType} • {charger.maxPowerKw} kW • ₹{charger.tariffPerKwh}/kWh
                                </div>
                              </div>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: charger.status === 'AVAILABLE' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: charger.status === 'AVAILABLE' ? 'var(--accent-neon)' : 'var(--accent-red)'
                              }}>
                                {charger.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          const firstAvailable = station.chargers?.find(c => c.status === 'AVAILABLE');
                          if (firstAvailable) {
                            setSelectedChargerId(firstAvailable.identifier);
                          }
                          setShowChargeModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #00FF88, #10b981)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#052e16',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Start Charging Here
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PLAN A TRIP */}
        {activeTab === 'trip' && (
          <div>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Compass size={28} color="var(--accent-neon)" />
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>EV Route & Charging Trip Planner</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
                Plan highway journeys with automated charging stop recommendations based on your electric vehicle's battery capacity and consumption.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Origin
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Vehicle Profile
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.batteryCapacityKwh} kWh)</option>
                    ))}
                    {vehicles.length === 0 && <option value="">Tata Nexon EV Max (40.5 kWh)</option>}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setTripRouteCalculated(true)}
                style={{
                  padding: '12px 28px',
                  background: 'var(--accent-neon)',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Compute Optimal EV Route
              </button>
            </div>

            {/* Calculated Trip Results */}
            {tripRouteCalculated && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '32px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
                  Trip Overview: {origin} → {destination}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Distance</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>148 km</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Est. Driving Time</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>2 hrs 45 mins</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Energy Consumption</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-neon)' }}>~24.5 kWh</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Recommended Charging Stops</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-cyan)' }}>1 Stop</div>
                  </div>
                </div>

                {/* Recommended charging stop */}
                <div style={{
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  background: 'rgba(0, 255, 136, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-neon)', fontWeight: 700 }}>RECOMMENDED MIDWAY STOP</div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                      Halt & Charge - Electronic City Phase 1
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      180 kW UltraFast DC • Stop Duration: 18 mins • Battery Charge: 20% → 80%
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedChargerId('HC-EC-DC-01');
                      setShowChargeModal(true);
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--accent-neon)',
                      color: '#052e16',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reserve Charger Gun
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY EVS */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>My Electric Vehicles</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Manage your EV garage to optimize charging speed and power curve recommendations.
                </p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                style={{
                  padding: '12px 20px',
                  background: 'var(--accent-neon)',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + Add Electric Vehicle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {vehicles.map(v => (
                <div
                  key={v.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{v.brand} {v.model}</div>
                    {v.isDefault && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'rgba(0, 255, 136, 0.15)',
                        color: 'var(--accent-neon)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        PRIMARY
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div>License Plate: <strong style={{ color: '#fff' }}>{v.licensePlate}</strong></div>
                    <div>Battery Capacity: <strong style={{ color: '#fff' }}>{v.batteryCapacityKwh} kWh</strong></div>
                    <div>Connector: <strong style={{ color: '#fff' }}>{v.connectorType}</strong></div>
                    <div>Max DC Speed: <strong style={{ color: 'var(--accent-neon)' }}>{v.maxChargingSpeedKw} kW</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVE CHARGING SESSION & TELEMETRY */}
        {activeTab === 'session' && (
          <div>
            {activeSession && activeSession.status === 'IN_PROGRESS' ? (
              <div style={{
                background: 'radial-gradient(circle at top right, #0d2618, #0d121c 70%)',
                border: '1px solid rgba(0, 255, 136, 0.35)',
                borderRadius: '20px',
                padding: '40px',
                marginBottom: '32px',
                boxShadow: '0 20px 50px rgba(0, 255, 136, 0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'rgba(0, 255, 136, 0.2)',
                      color: 'var(--accent-neon)',
                      fontSize: '12px',
                      fontWeight: 800
                    }}>
                      <Radio size={14} className="spin" /> REAL-TIME CHARGING TELEMETRY
                    </span>
                    <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>
                      Session: {activeSession.sessionUid}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      Charger: <strong>{activeSession.chargerIdentifier}</strong> • Station: <strong>{activeSession.stationName}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => handleStopCharging(activeSession.id)}
                    disabled={actionLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '16px 28px',
                      background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <StopCircle size={20} />
                    {actionLoading ? 'Stopping...' : 'Stop Charging'}
                  </button>
                </div>

                {/* Telemetry Meters */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '32px' }}>
                  <div style={{ background: 'rgba(19, 27, 41, 0.7)', borderRadius: '14px', padding: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Energy Delivered</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-neon)', marginTop: '6px' }}>
                      {Number(activeSession.energyKwh).toFixed(3)} <span style={{ fontSize: '18px' }}>kWh</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(19, 27, 41, 0.7)', borderRadius: '14px', padding: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Instantaneous Power</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
                      {Number(activeSession.currentPowerKw).toFixed(1)} <span style={{ fontSize: '18px' }}>kW</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(19, 27, 41, 0.7)', borderRadius: '14px', padding: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Charging Duration</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '6px' }}>
                      {Math.floor(activeSession.durationSeconds / 60)}m {activeSession.durationSeconds % 60}s
                    </div>
                  </div>

                  <div style={{ background: 'rgba(19, 27, 41, 0.7)', borderRadius: '14px', padding: '24px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated Total</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '6px' }}>
                      ₹{Number(activeSession.estimatedCost).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Rate: ₹{activeSession.tariffSnapshotPerKwh}/kWh
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                  [SIMULATOR NOTE: Real-time telemetry is calculated by Virtual Charger Simulator in 2-second increments. No fake payments.]
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                marginBottom: '32px'
              }}>
                <BatteryCharging size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Active Charging Session</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                  Connect your EV to any Halt & Charge gun and tap Start Charging to monitor telemetry in real-time.
                </p>
                <button
                  onClick={() => setShowChargeModal(true)}
                  style={{
                    padding: '12px 28px',
                    background: 'var(--accent-neon)',
                    color: '#052e16',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Start Charging Now
                </button>
              </div>
            )}

            {/* Session History */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Session History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Session UID</th>
                    <th style={{ padding: '12px' }}>Station / Charger</th>
                    <th style={{ padding: '12px' }}>Energy</th>
                    <th style={{ padding: '12px' }}>Cost</th>
                    <th style={{ padding: '12px' }}>Duration</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{s.sessionUid}</td>
                      <td style={{ padding: '12px' }}>{s.stationName} ({s.chargerIdentifier})</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-neon)' }}>
                        {Number(s.energyKwh).toFixed(3)} kWh
                      </td>
                      <td style={{ padding: '12px' }}>₹{Number(s.estimatedCost).toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>{Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: s.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                          color: s.status === 'COMPLETED' ? 'var(--accent-emerald)' : 'var(--accent-neon)'
                        }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sessionHistory.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No past charging sessions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MY ACCOUNT / AUTH */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {token && profile ? (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '36px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    border: '2px solid var(--accent-neon)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-neon)'
                  }}>
                    <User size={28} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{profile.fullName}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{profile.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Phone</span>
                    <strong>{profile.phoneNumber || 'Not provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Account Role</span>
                    <strong style={{ color: 'var(--accent-neon)' }}>{profile.role}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Simulated Wallet Ledger</span>
                    <strong>₹{Number(profile.walletBalance).toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--accent-red)',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '36px'
              }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
                  {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                  Access real-time EV telemetry, save favourite hubs, and plan routes.
                </p>

                <form onSubmit={handleAuth}>
                  {authMode === 'register' && (
                    <>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={authFullName}
                          onChange={e => setAuthFullName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </div>

                  {authError && (
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid var(--accent-red)',
                      borderRadius: '8px',
                      color: '#fca5a5',
                      fontSize: '13px',
                      marginBottom: '16px'
                    }}>
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--accent-neon)',
                      color: '#052e16',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Register Account'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-neon)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {authMode === 'login' ? 'Register here' : 'Sign in here'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* START CHARGING MODAL */}
      {showChargeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
              Initiate Charging Session
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
              Select charger identifier and compatible vehicle to initiate virtual telemetry.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Charger Gun Identifier
              </label>
              <select
                value={selectedChargerId}
                onChange={e => setSelectedChargerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                {stations.flatMap(s => s.chargers || []).map(ch => (
                  <option key={ch.id} value={ch.identifier}>
                    {ch.identifier} ({ch.chargerType} {ch.maxPowerKw}kW - {ch.status})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.licensePlate})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowChargeModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartCharging}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--accent-neon)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#052e16',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {actionLoading ? 'Connecting...' : 'Plug & Charge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {showAddVehicleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '440px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>
              Add Electric Vehicle
            </h3>
            <form onSubmit={handleAddVehicle}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Brand</label>
                <input
                  type="text"
                  value={newVehicle.brand}
                  onChange={e => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Model</label>
                <input
                  type="text"
                  value={newVehicle.model}
                  onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>License Plate</label>
                <input
                  type="text"
                  value={newVehicle.licensePlate}
                  onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Battery (kWh)</label>
                  <input
                    type="number"
                    value={newVehicle.batteryCapacityKwh}
                    onChange={e => setNewVehicle({ ...newVehicle, batteryCapacityKwh: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Max Speed (kW)</label>
                  <input
                    type="number"
                    value={newVehicle.maxChargingSpeedKw}
                    onChange={e => setNewVehicle({ ...newVehicle, maxChargingSpeedKw: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'var(--accent-neon)', border: 'none', borderRadius: '8px', color: '#052e16', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save EV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

