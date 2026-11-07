import React from 'react';
import { RefreshCw, Plus, Activity, Bell } from 'lucide-react';

interface TopHeaderProps {
  activeTab: string;
  loading: boolean;
  onRefresh: () => void;
  onOpenAddStation?: () => void;
  onOpenAddCharger?: () => void;
  onOpenBroadcast?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  loading,
  onRefresh,
  onOpenAddStation,
  onOpenAddCharger,
  onOpenBroadcast
}) => {
  const titles: { [key: string]: { title: string; subtitle: string } } = {
    dashboard: {
      title: 'Enterprise Command Center',
      subtitle: 'Real-time telemetry, geographic station dispatch and charger fleet availability'
    },
    stations: {
      title: 'Charging Hub Stations',
      subtitle: 'Manage physical and simulated charging locations across target operational zones'
    },
    chargers: {
      title: 'Charger Fleet Inventory',
      subtitle: 'Monitor gun hardware statuses, power capacities and tariff settings'
    },
    simulator: {
      title: 'Virtual EV Hardware Simulator',
      subtitle: 'Inject faults, toggle grid connectivity and simulate live telemetry metrics'
    },
    sessions: {
      title: 'Live Metering & Session History',
      subtitle: 'Continuous energy consumption (kWh), duration tracking and financial deductions'
    },
    users: {
      title: 'Registered Customer Accounts',
      subtitle: 'Manage user profiles, mock wallet balances and account lifecycle'
    },
    vehicles: {
      title: 'Registered EV Fleet',
      subtitle: 'Customer vehicle battery specifications, connector standards and charging limits'
    },
    bookings: {
      title: 'Slot Reservations & Bookings',
      subtitle: 'Track advance time slots booked by customers at charging locations'
    },
    support: {
      title: 'Customer Support & Helpdesk',
      subtitle: 'Review customer inquiries, issues and technical trouble tickets'
    },
    tariffs: {
      title: 'Tariff & Energy Rate Matrix',
      subtitle: 'Configure per-kWh rates for DC ultra-fast and AC standard chargers'
    },
    transactions: {
      title: 'Financial Ledger & Deductions',
      subtitle: 'Simulated wallet transaction log and charging session payments'
    },
    notifications: {
      title: 'Broadcast Announcement Engine',
      subtitle: 'Send real-time alerts and promotional push notifications to active users'
    },
    reports: {
      title: 'Executive Network Analytics',
      subtitle: 'Energy delivered, hardware uptime benchmarks and capacity utilization'
    },
    audit: {
      title: 'Security & Compliance Audit Trail',
      subtitle: 'Immutable record of administrator operations and state changes'
    },
    settings: {
      title: 'System & Platform Settings',
      subtitle: 'Simulator frequency, network defaults and administrator security credentials'
    }
  };

  const current = titles[activeTab] || {
    title: activeTab.toUpperCase(),
    subtitle: 'Manage and monitor EV charging infrastructure'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {current.title}
          </h2>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
            ONLINE
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>
          {current.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 15px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9px',
            color: '#334155',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} color="#059669" />
          Refresh Data
        </button>

        {/* Dynamic Context Buttons */}
        {activeTab === 'stations' && onOpenAddStation && (
          <button
            onClick={onOpenAddStation}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Plus size={16} />
            Add Hub Station
          </button>
        )}

        {activeTab === 'chargers' && onOpenAddCharger && (
          <button
            onClick={onOpenAddCharger}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Plus size={16} />
            Deploy Charger
          </button>
        )}

        {activeTab === 'notifications' && onOpenBroadcast && (
          <button
            onClick={onOpenBroadcast}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Bell size={16} />
            New Broadcast
          </button>
        )}
      </div>
    </div>
  );
};

