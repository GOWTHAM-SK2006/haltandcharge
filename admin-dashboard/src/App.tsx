import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MapPin, Zap, Users, Activity, Sliders, ShieldAlert, 
  DollarSign, FileText, Settings, RefreshCw, LogOut, CheckCircle2, 
  AlertTriangle, XCircle, PowerOff, Play, Shield, Trash2
} from 'lucide-react';
import { apiRequest } from './api';
import { AdminStats, Station, Charger, ChargingSession, User, SimulatorEvent, AuditLog } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hc_admin_token'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Login form state
  const [email, setEmail] = useState('admin@haltcharge.com');
  const [password, setPassword] = useState('Password@123');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<SimulatorEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Station modal / form
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '', address: '', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001',
    latitude: 12.9716, longitude: 77.5946, operatingHours: '24/7', amenities: 'Restroom,Cafe,WiFi'
  });

  // Charger form
  const [showAddCharger, setShowAddCharger] = useState(false);
  const [newCharger, setNewCharger] = useState({
    stationId: 1, identifier: 'HC-NEW-DC-01', name: 'UltraFast DC 120kW',
    chargerType: 'DC', maxPowerKw: 120, tariffPerKwh: 18.5, isSimulated: true
  });

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');
    try {
      const res = await apiRequest<{ token: string; role: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      localStorage.setItem('hc_admin_token', res.token);
      setToken(res.token);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hc_admin_token');
    setToken(null);
  };

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sData, stData, chData, sesData, uData, evData, logData] = await Promise.all([
        apiRequest<AdminStats>('/api/admin/stats').catch(() => null),
        apiRequest<Station[]>('/api/admin/stations').catch(() => []),
        apiRequest<Charger[]>('/api/admin/chargers').catch(() => []),
        apiRequest<ChargingSession[]>('/api/admin/sessions').catch(() => []),
        apiRequest<User[]>('/api/admin/users').catch(() => []),
        apiRequest<SimulatorEvent[]>('/api/admin/simulator/events?limit=30').catch(() => []),
        apiRequest<AuditLog[]>('/api/admin/audit-logs').catch(() => [])
      ]);
      if (sData) setStats(sData);
      setStations(stData);
      setChargers(chData);
      setSessions(sesData);
      setUsers(uData);
      setEvents(evData);
      setAuditLogs(logData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
      const interval = setInterval(fetchData, 4000); // 4-second real-time poll
      return () => clearInterval(interval);
    }
  }, [token]);

  // Simulator actions
  const triggerSimulatorFault = async (id: number) => {
    try {
      await apiRequest(`/api/admin/simulator/chargers/${id}/fault?reason=Connector+Ground+Fault`, { method: 'POST' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const triggerSimulatorOffline = async (id: number) => {
    try {
      await apiRequest(`/api/admin/simulator/chargers/${id}/offline`, { method: 'POST' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const triggerSimulatorRestore = async (id: number) => {
    try {
      await apiRequest(`/api/admin/simulator/chargers/${id}/restore`, { method: 'POST' });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  // Add Station
  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/stations', {
        method: 'POST',
        body: JSON.stringify(newStation)
      });
      setShowAddStation(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  // Add Charger
  const handleCreateCharger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/chargers', {
        method: 'POST',
        body: JSON.stringify(newCharger)
      });
      setShowAddCharger(false);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteUser = async (userId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?\n\nThis will permanently delete all their vehicles, charging history, and account data.`)) {
      return;
    }
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== userId));
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  // Render Login View if unauthenticated
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top right, #102319, #0a0d14 70%)',
        padding: '24px'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00FF88, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)'
            }}>
              <Zap size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                HALT <span style={{ color: 'var(--accent-neon)' }}>&</span> CHARGE
              </h1>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Enterprise EV Charging Management</p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {authError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--accent-red)',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '18px'
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #00FF88, #10b981)',
                border: 'none',
                borderRadius: '8px',
                color: '#052e16',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
              }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Demo Account: <strong>admin@haltcharge.com</strong> / <strong>Password@123</strong>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 10
      }}>
        {/* Brand Header */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00FF88, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000'
          }}>
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>
              HALT <span style={{ color: 'var(--accent-neon)' }}>&</span> CHARGE
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Command Center
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'stations', label: 'Stations', icon: MapPin },
            { id: 'chargers', label: 'Chargers', icon: Zap },
            { id: 'simulator', label: 'Hardware Simulator', icon: Sliders, badge: 'Live' },
            { id: 'sessions', label: 'Charging Sessions', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: active ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                  color: active ? 'var(--accent-neon)' : 'var(--text-secondary)',
                  border: active ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: 'var(--accent-neon)',
                    color: '#052e16',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Admin Console</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ROLE_ADMIN</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, textTransform: 'capitalize' }}>
              {activeTab === 'simulator' ? 'Virtual EV Charger Simulator' : activeTab}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Real-time monitoring and management of Halt & Charge charging network.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchData}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </button>
            {activeTab === 'stations' && (
              <button
                onClick={() => setShowAddStation(true)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent-neon)',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Add Station
              </button>
            )}
            {activeTab === 'chargers' && (
              <button
                onClick={() => setShowAddCharger(true)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent-neon)',
                  color: '#052e16',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Add Charger
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* KPI Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Total Stations</span>
                  <MapPin size={18} color="var(--accent-neon)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalStations}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Operational nationwide</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Chargers Fleet</span>
                  <Zap size={18} color="#38bdf8" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalChargers}</div>
                <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {stats.availableChargers} Available • {stats.chargingChargers} Active
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Active Sessions</span>
                  <Activity size={18} color="var(--accent-amber)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-neon)' }}>{stats.activeSessions}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{stats.completedSessions} completed total</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Simulated Energy (kWh)</span>
                  <Zap size={18} color="var(--accent-neon)" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{Number(stats.simulatedEnergyKwh).toFixed(2)}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-amber)', marginTop: '4px', fontWeight: 600 }}>
                  [SIMULATED DATA ONLY]
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                  <span>Simulated Revenue</span>
                  <DollarSign size={18} color="#a855f7" />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>₹{Number(stats.simulatedRevenue).toFixed(2)}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-amber)', marginTop: '4px', fontWeight: 600 }}>
                  [ESTIMATE - NO FAKE PAYMENTS]
                </div>
              </div>
            </div>

            {/* Live Chargers Status Table */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Network Chargers Availability</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Identifier</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Type</th>
                    <th style={{ padding: '12px' }}>Power</th>
                    <th style={{ padding: '12px' }}>Tariff</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Simulator Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {chargers.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{c.identifier}</td>
                      <td style={{ padding: '12px' }}>{c.name}</td>
                      <td style={{ padding: '12px' }}>{c.chargerType}</td>
                      <td style={{ padding: '12px' }}>{c.maxPowerKw} kW</td>
                      <td style={{ padding: '12px' }}>₹{c.tariffPerKwh}/kWh</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: c.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.2)' :
                                      c.status === 'CHARGING' ? 'rgba(0, 255, 136, 0.2)' :
                                      c.status === 'FAULTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                          color: c.status === 'AVAILABLE' ? 'var(--accent-emerald)' :
                                 c.status === 'CHARGING' ? 'var(--accent-neon)' :
                                 c.status === 'FAULTED' ? 'var(--accent-red)' : 'var(--text-secondary)'
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {c.isSimulated ? (
                          <span style={{ color: 'var(--accent-neon)', fontSize: '11px', fontWeight: 600 }}>● VIRTUAL SIMULATOR</span>
                        ) : 'PHYSICAL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Hardware Simulator Controls */}
        {activeTab === 'simulator' && (
          <div>
            <div style={{
              background: 'rgba(0, 255, 136, 0.08)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: '12px',
              padding: '18px 24px',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontSize: '15px', color: 'var(--accent-neon)', fontWeight: 700, marginBottom: '6px' }}>
                Virtual EV Charger Hardware Simulator Engine
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Since physical EV chargers are not initially available, this simulator reproduces real hardware telemetry,
                power curves, continuous energy (kWh) increments, socket states and hardware fault injections.
                All data generated is tagged <code>[SIMULATED]</code> in the database.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {chargers.map(c => (
                <div key={c.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{c.identifier}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.name}</div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: c.status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.2)' :
                                  c.status === 'CHARGING' ? 'rgba(0, 255, 136, 0.2)' :
                                  c.status === 'FAULTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                      color: c.status === 'AVAILABLE' ? 'var(--accent-emerald)' :
                             c.status === 'CHARGING' ? 'var(--accent-neon)' :
                             c.status === 'FAULTED' ? 'var(--accent-red)' : 'var(--text-secondary)'
                    }}>
                      {c.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Type: <strong>{c.chargerType}</strong> • Max Speed: <strong>{c.maxPowerKw} kW</strong> • Rate: <strong>₹{c.tariffPerKwh}/kWh</strong>
                  </div>

                  {/* Simulator action buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => triggerSimulatorFault(c.id)}
                      disabled={c.status === 'FAULTED'}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid var(--accent-red)',
                        borderRadius: '6px',
                        color: '#fca5a5',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Simulate Fault
                    </button>
                    <button
                      onClick={() => triggerSimulatorOffline(c.id)}
                      disabled={c.status === 'OFFLINE'}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(148, 163, 184, 0.15)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Simulate Offline
                    </button>
                    <button
                      onClick={() => triggerSimulatorRestore(c.id)}
                      disabled={c.status === 'AVAILABLE'}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(0, 255, 136, 0.15)',
                        border: '1px solid var(--accent-neon)',
                        borderRadius: '6px',
                        color: 'var(--accent-neon)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Restore Available
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Event history */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Simulator Event Stream</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '10px' }}>Charger</th>
                    <th style={{ padding: '10px' }}>Event</th>
                    <th style={{ padding: '10px' }}>Details</th>
                    <th style={{ padding: '10px' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace' }}>{ev.charger_identifier || `Charger #${ev.charger_id}`}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{ev.event_type}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{ev.details}</td>
                      <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(ev.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Stations Management */}
        {activeTab === 'stations' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Network Hub Stations</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Address</th>
                  <th style={{ padding: '12px' }}>City</th>
                  <th style={{ padding: '12px' }}>Coordinates</th>
                  <th style={{ padding: '12px' }}>Hours</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stations.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{st.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{st.address}</td>
                    <td style={{ padding: '12px' }}>{st.city}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>{st.latitude}, {st.longitude}</td>
                    <td style={{ padding: '12px' }}>{st.operatingHours}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: st.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: st.isActive ? 'var(--accent-emerald)' : 'var(--accent-red)'
                      }}>
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Charging Sessions */}
        {activeTab === 'sessions' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Session History & Live Metering</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px' }}>Session UID</th>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Station / Charger</th>
                  <th style={{ padding: '12px' }}>Energy (kWh)</th>
                  <th style={{ padding: '12px' }}>Current Power</th>
                  <th style={{ padding: '12px' }}>Est. Cost</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 600 }}>{s.sessionUid}</td>
                    <td style={{ padding: '12px' }}>{s.userEmail || `User #${s.userId}`}</td>
                    <td style={{ padding: '12px' }}>{s.stationName} ({s.chargerIdentifier})</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-neon)' }}>
                      {Number(s.energyKwh).toFixed(3)}
                    </td>
                    <td style={{ padding: '12px' }}>{Number(s.currentPowerKw).toFixed(1)} kW</td>
                    <td style={{ padding: '12px' }}>₹{Number(s.estimatedCost).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>{Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: s.status === 'IN_PROGRESS' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: s.status === 'IN_PROGRESS' ? 'var(--accent-neon)' : 'var(--text-secondary)'
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Users */}
        {activeTab === 'users' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Registered Customers</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Full Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Simulated Wallet</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== 'ROLE_ADMIN' && u.email !== 'admin@haltcharge.com').length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No registered customers found.
                    </td>
                  </tr>
                ) : (
                  users.filter(u => u.role !== 'ROLE_ADMIN' && u.email !== 'admin@haltcharge.com').map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px' }}>#{u.id}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.fullName}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}><code>{u.role}</code></td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: u.status === 'ACTIVE' ? 'var(--accent-emerald)' : 'var(--accent-red)'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>₹{Number(u.walletBalance).toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullName || u.email)}
                          title="Permanently Delete User"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#ef4444',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: Audit Logs */}
        {activeTab === 'audit' && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Security & Audit Trail</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>User</th>
                  <th style={{ padding: '10px' }}>Action</th>
                  <th style={{ padding: '10px' }}>Resource</th>
                  <th style={{ padding: '10px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l: any) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(l.created_at).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>{l.user_email || `User #${l.user_id}`}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: 'var(--accent-neon)' }}>{l.action}</td>
                    <td style={{ padding: '10px' }}>{l.resource_type} ({l.resource_id})</td>
                    <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

