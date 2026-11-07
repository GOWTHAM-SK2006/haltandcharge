import React, { useState, useEffect } from 'react';
import { Zap, X, Bell, CheckCircle2 } from 'lucide-react';
import { apiRequest } from './api';
import { 
  AdminStats, Station, Charger, ChargingSession, User, 
  Vehicle, Booking, SupportTicket, NotificationItem, 
  TransactionItem, SimulatorEvent, AuditLog 
} from './types';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';

import { DashboardView } from './views/DashboardView';
import { StationsView } from './views/StationsView';
import { ChargersView } from './views/ChargersView';
import { SimulatorView } from './views/SimulatorView';
import { SessionsView } from './views/SessionsView';
import { UsersView } from './views/UsersView';
import { VehiclesView } from './views/VehiclesView';
import { BookingsView } from './views/BookingsView';
import { SupportView } from './views/SupportView';
import { TariffsView } from './views/TariffsView';
import { TransactionsView } from './views/TransactionsView';
import { NotificationsView } from './views/NotificationsView';
import { ReportsView } from './views/ReportsView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';
import { ChargerQrModal } from './components/ChargerQrModal';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hc_admin_token'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedQrCharger, setSelectedQrCharger] = useState<Charger | null>(null);
  
  // Login form state
  const [email, setEmail] = useState('admin@haltcharge.com');
  const [password, setPassword] = useState('Password@123');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core Datasets
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [events, setEvents] = useState<SimulatorEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '', address: '', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001',
    latitude: 12.9716, longitude: 77.5946, operatingHours: '24/7', amenities: 'Restroom,Cafe,WiFi'
  });

  const [showAddCharger, setShowAddCharger] = useState(false);
  const [newCharger, setNewCharger] = useState({
    stationId: 0, identifier: 'HC-BLR-DC-01', name: 'UltraFast DC 120kW',
    chargerType: 'DC', maxPowerKw: 120, tariffPerKwh: 18.5, isSimulated: true
  });

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '', body: '', type: 'ANNOUNCEMENT'
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
      localStorage.removeItem('hc_customer_token');
      setToken(res.token);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hc_admin_token');
    localStorage.removeItem('hc_customer_token');
    setToken(null);
  };

  // Fetch all enterprise data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [
        sData, stData, chData, sesData, uData, 
        vData, bData, supData, notifData, txData, 
        evData, logData
      ] = await Promise.all([
        apiRequest<AdminStats>('/api/admin/stats').catch(() => null),
        apiRequest<Station[]>('/api/admin/stations').catch(() => []),
        apiRequest<Charger[]>('/api/admin/chargers').catch(() => []),
        apiRequest<ChargingSession[]>('/api/admin/sessions').catch(() => []),
        apiRequest<User[]>('/api/admin/users').catch(() => []),
        apiRequest<Vehicle[]>('/api/admin/vehicles').catch(() => []),
        apiRequest<Booking[]>('/api/admin/bookings').catch(() => []),
        apiRequest<SupportTicket[]>('/api/admin/support-tickets').catch(() => []),
        apiRequest<NotificationItem[]>('/api/admin/notifications').catch(() => []),
        apiRequest<TransactionItem[]>('/api/admin/transactions').catch(() => []),
        apiRequest<SimulatorEvent[]>('/api/admin/simulator/events?limit=40').catch(() => []),
        apiRequest<AuditLog[]>('/api/admin/audit-logs').catch(() => [])
      ]);

      if (sData) setStats(sData);
      setStations(stData);
      setChargers(chData);
      setSessions(sesData);
      setUsers(uData);
      setVehicles(vData);
      setBookings(bData);
      setSupportTickets(supData);
      setNotifications(notifData);
      setTransactions(txData);
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
      const interval = setInterval(fetchData, 4000); // 4-second real-time telemetry polling
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (stations.length > 0) {
      if (!newCharger.stationId || !stations.some(s => s.id === newCharger.stationId)) {
        setNewCharger(prev => ({ ...prev, stationId: stations[0].id }));
      }
    }
  }, [stations]);

  const openAddCharger = () => {
    if (stations.length === 0) {
      alert('Please add a charging hub station first before deploying chargers.');
      setShowAddStation(true);
      return;
    }
    const targetStationId = stations.some(s => s.id === newCharger.stationId && newCharger.stationId > 0)
      ? newCharger.stationId
      : stations[0].id;

    const prefix = stations.find(s => s.id === targetStationId)?.city?.slice(0, 3).toUpperCase() || 'BLR';
    setNewCharger(prev => ({
      ...prev,
      stationId: targetStationId,
      identifier: `HC-${prefix}-DC-0${chargers.length + 1}`
    }));
    setShowAddCharger(true);
  };

  // Simulator controls
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

  const handleTurnOnCharger = async (id: number) => {
    try {
      const res = await apiRequest<{ message: string }>(`/api/admin/simulator/chargers/${id}/turn-on`, { method: 'POST' });
      alert(res.message || 'Charger turned ON successfully');
      fetchData();
    } catch (err: any) { alert(err.message || 'Failed to turn charger ON'); }
  };

  const handleTurnOffCharger = async (id: number) => {
    try {
      const res = await apiRequest<{ message: string }>(`/api/admin/simulator/chargers/${id}/turn-off`, { method: 'POST' });
      alert(res.message || 'Charger turned OFF successfully');
      fetchData();
    } catch (err: any) { alert(err.message || 'Failed to turn charger OFF'); }
  };

  // Add Station action
  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/stations', {
        method: 'POST',
        body: JSON.stringify(newStation)
      });
      setShowAddStation(false);
      fetchData();
    } catch (err: any) { alert(err.message || 'Failed to create station'); }
  };

  // Add Charger action - Automatically generates and previews unique QR code
  const handleCreateCharger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const targetStationId = (stations.some(s => s.id === newCharger.stationId && newCharger.stationId > 0))
        ? newCharger.stationId
        : (stations[0]?.id || 0);

      if (!targetStationId) {
        alert('Please create a charging hub station first.');
        setShowAddCharger(false);
        setShowAddStation(true);
        return;
      }

      const created = await apiRequest<Charger>('/api/admin/chargers', {
        method: 'POST',
        body: JSON.stringify({ ...newCharger, stationId: targetStationId })
      });
      setShowAddCharger(false);
      // Automatically preview generated QR Code!
      setSelectedQrCharger(created);
      fetchData();
    } catch (err: any) { alert(err.message || 'Failed to create charger'); }
  };

  // Broadcast Notification action
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(broadcastForm)
      });
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', body: '', type: 'ANNOUNCEMENT' });
      fetchData();
    } catch (err: any) { alert(err.message || 'Failed to broadcast notification'); }
  };

  // Permanent Delete User cascade
  const handleDeleteUser = async (userId: number, name: string) => {
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
        background: 'radial-gradient(circle at top right, #ecfdf5 0%, #f8fafc 100%)',
        padding: '24px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}>
              <Zap size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
                HALT <span style={{ color: '#059669' }}>&</span> CHARGE
              </h1>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Enterprise EV Charging Management</p>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
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
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
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
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {authError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
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
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Command Center'}
            </button>
          </form>

          <div style={{ 
            marginTop: '24px', 
            padding: '12px', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px', 
            fontSize: '12px', 
            color: '#475569', 
            textAlign: 'center' 
          }}>
            Default Credentials: <strong>admin@haltcharge.com</strong> / <strong>Password@123</strong>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Command Center Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Modern White & Emerald Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Command Center Canvas */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', minWidth: 0 }}>
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          loading={loading}
          onRefresh={fetchData}
          onOpenAddStation={() => setShowAddStation(true)}
          onOpenAddCharger={openAddCharger}
          onOpenBroadcast={() => setShowBroadcastModal(true)}
        />

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            stations={stations}
            chargers={chargers}
            sessions={sessions}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'stations' && (
          <StationsView
            stations={stations}
            onOpenAddStation={() => setShowAddStation(true)}
          />
        )}

        {activeTab === 'chargers' && (
          <ChargersView
            chargers={chargers}
            stations={stations}
            sessions={sessions}
            onOpenAddCharger={openAddCharger}
            onRefresh={fetchData}
            onOpenQrModal={c => setSelectedQrCharger(c)}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView
            chargers={chargers}
            events={events}
            sessions={sessions}
            onTriggerFault={triggerSimulatorFault}
            onTriggerOffline={triggerSimulatorOffline}
            onTriggerRestore={triggerSimulatorRestore}
            onTurnOn={handleTurnOnCharger}
            onTurnOff={handleTurnOffCharger}
            onOpenQrModal={c => setSelectedQrCharger(c)}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsView
            sessions={sessions}
          />
        )}

        {activeTab === 'users' && (
          <UsersView
            users={users}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsView
            bookings={bookings}
          />
        )}

        {activeTab === 'support' && (
          <SupportView
            tickets={supportTickets}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'tariffs' && (
          <TariffsView
            chargers={chargers}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onOpenBroadcast={() => setShowBroadcastModal(true)}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            stats={stats}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsView
            logs={auditLogs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}

        {/* Modal: Add Station */}
        {showAddStation && (
          <div className="modal-overlay">
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Add Charging Hub Station</h3>
                <button 
                  onClick={() => setShowAddStation(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStation}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Station Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Indiranagar EV Fast Hub"
                      value={newStation.name}
                      onChange={e => setNewStation({ ...newStation, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100 Feet Rd, HAL 2nd Stage"
                      value={newStation.address}
                      onChange={e => setNewStation({ ...newStation, address: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>City</label>
                    <input
                      type="text"
                      value={newStation.city}
                      onChange={e => setNewStation({ ...newStation, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Postal Code</label>
                    <input
                      type="text"
                      value={newStation.postalCode}
                      onChange={e => setNewStation({ ...newStation, postalCode: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newStation.latitude}
                      onChange={e => setNewStation({ ...newStation, latitude: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newStation.longitude}
                      onChange={e => setNewStation({ ...newStation, longitude: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStation(false)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}
                  >
                    Create Station
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Charger */}
        {showAddCharger && (
          <div className="modal-overlay">
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Deploy Charger Gun</h3>
                <button 
                  onClick={() => setShowAddCharger(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateCharger}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Assign Station</label>
                    <select
                      value={stations.some(s => s.id === newCharger.stationId) ? newCharger.stationId : (stations[0]?.id || '')}
                      onChange={e => setNewCharger({ ...newCharger, stationId: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>{st.name} ({st.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Charger Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HC-BLR-DC-04"
                      value={newCharger.identifier}
                      onChange={e => setNewCharger({ ...newCharger, identifier: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Hardware Model Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CCS2 UltraFast Gun 120kW"
                      value={newCharger.name}
                      onChange={e => setNewCharger({ ...newCharger, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Capacity (kW)</label>
                      <input
                        type="number"
                        value={newCharger.maxPowerKw}
                        onChange={e => setNewCharger({ ...newCharger, maxPowerKw: parseFloat(e.target.value) })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Tariff (₹/kWh)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newCharger.tariffPerKwh}
                        onChange={e => setNewCharger({ ...newCharger, tariffPerKwh: parseFloat(e.target.value) })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddCharger(false)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}
                  >
                    Deploy Charger
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Broadcast Notification */}
        {showBroadcastModal && (
          <div className="modal-overlay">
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Send Broadcast Announcement</h3>
                <button 
                  onClick={() => setShowBroadcastModal(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendBroadcast}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Announcement Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scheduled Night Maintenance on Whitefield Hub"
                      value={broadcastForm.title}
                      onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Alert Type</label>
                    <select
                      value={broadcastForm.type}
                      onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="ANNOUNCEMENT">General Announcement</option>
                      <option value="ALERT">Critical Hardware Alert</option>
                      <option value="PROMO">Promotional / Discount Offer</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Message Body</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Enter the full announcement text dispatched to customer apps..."
                      value={broadcastForm.body}
                      onChange={e => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}
                  >
                    Broadcast to Network
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal: Charger QR Placard */}
        {selectedQrCharger && (
          <ChargerQrModal
            charger={selectedQrCharger}
            station={stations.find(s => s.id === selectedQrCharger.stationId)}
            onClose={() => setSelectedQrCharger(null)}
          />
        )}
      </main>
    </div>
  );
}
