import React from 'react';
import { AdminStats, Station, Charger, ChargingSession } from '../types';
import { KpiCard } from '../components/KpiCard';
import { ChartCard } from '../components/ChartCard';
import { LeafletNetworkMap } from '../components/LeafletNetworkMap';
import { MapPin, Zap, Activity, DollarSign, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface DashboardViewProps {
  stats: AdminStats | null;
  stations: Station[];
  chargers: Charger[];
  sessions: ChargingSession[];
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  stations,
  chargers,
  sessions,
  onNavigateTab
}) => {
  if (!stats) return null;

  const totalChargers = stats.totalChargers || chargers.length || 1;
  const availPct = Math.round((stats.availableChargers / totalChargers) * 100);
  const chargingPct = Math.round((stats.chargingChargers / totalChargers) * 100);
  const faultedPct = Math.round((stats.faultedChargers / totalChargers) * 100);
  const offlinePct = Math.max(0, 100 - (availPct + chargingPct + faultedPct));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 5 Enterprise KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '18px'
      }}>
        <KpiCard
          title="Network Hub Stations"
          value={stats.totalStations}
          subtext="Operational nationwide"
          icon={MapPin}
          iconColor="#059669"
          iconBg="#ecfdf5"
          trend="+100% Uptime"
          trendPositive={true}
        />

        <KpiCard
          title="Chargers Fleet"
          value={stats.totalChargers}
          subtext={`${stats.availableChargers} Available • ${stats.chargingChargers} Active`}
          icon={Zap}
          iconColor="#0284c7"
          iconBg="#f0f9ff"
          trend={`${stats.availableChargers} Ready`}
          trendPositive={true}
        />

        <KpiCard
          title="Live Active Sessions"
          value={stats.activeSessions}
          subtext={`${stats.completedSessions} completed sessions`}
          icon={Activity}
          iconColor="#059669"
          iconBg="#ecfdf5"
          trend="Real-time Metering"
          trendPositive={true}
        />

        <KpiCard
          title="Simulated Energy"
          value={`${Number(stats.simulatedEnergyKwh).toFixed(2)} kWh`}
          subtext="Aggregated power delivered"
          icon={Zap}
          iconColor="#d97706"
          iconBg="#fffbeb"
          isSimulated={true}
        />

        <KpiCard
          title="Simulated Revenue"
          value={`₹${Number(stats.simulatedRevenue).toFixed(2)}`}
          subtext="Estimated billing charges"
          icon={DollarSign}
          iconColor="#059669"
          iconBg="#ecfdf5"
          isSimulated={true}
        />
      </div>

      {/* Row 2: Telemetry Activity Chart & Fleet Availability Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Telemetry Activity Chart */}
        <ChartCard
          activeSessionsCount={stats.activeSessions}
          totalEnergyKwh={Number(stats.simulatedEnergyKwh)}
        />

        {/* Fleet Availability Gauge & Distribution Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Fleet Availability</h3>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                {stats.totalChargers} Total Guns
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
              Real-time operational status distribution across DC & AC charging points
            </p>

            {/* Stacked Progress Bar */}
            <div style={{
              width: '100%',
              height: '14px',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              background: '#f1f5f9',
              marginBottom: '20px'
            }}>
              <div style={{ width: `${availPct}%`, background: '#059669', transition: 'width 0.3s' }} title={`Available: ${stats.availableChargers}`} />
              <div style={{ width: `${chargingPct}%`, background: '#10b981', transition: 'width 0.3s' }} title={`Charging: ${stats.chargingChargers}`} />
              <div style={{ width: `${faultedPct}%`, background: '#ef4444', transition: 'width 0.3s' }} title={`Faulted: ${stats.faultedChargers}`} />
              <div style={{ width: `${offlinePct}%`, background: '#94a3b8', transition: 'width 0.3s' }} title={`Offline: ${stats.offlineChargers}`} />
            </div>

            {/* Status Breakdown Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }}></span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>Available & Ready</span>
                </div>
                <strong style={{ color: '#0f172a' }}>{stats.availableChargers} ({availPct}%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981' }}></span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>Active Charging</span>
                </div>
                <strong style={{ color: '#0f172a' }}>{stats.chargingChargers} ({chargingPct}%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }}></span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>Hardware Faulted</span>
                </div>
                <strong style={{ color: '#ef4444' }}>{stats.faultedChargers} ({faultedPct}%)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#94a3b8' }}></span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>Offline / Standby</span>
                </div>
                <strong style={{ color: '#64748b' }}>{stats.offlineChargers} ({offlinePct}%)</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('simulator')}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #a7f3d0',
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Open Simulator Controls →
          </button>
        </div>
      </div>

      {/* Row 3: Geospatial Leaflet Map */}
      <LeafletNetworkMap
        stations={stations}
        onSelectStation={() => onNavigateTab('stations')}
      />

      {/* Row 4: Network Chargers Availability Table Preview */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Fleet Chargers Overview
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Quick view of deployed charging guns and their current real-time socket statuses
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('chargers')}
            style={{
              padding: '6px 14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#059669',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            View All Chargers →
          </button>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Identifier</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Name</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Capacity</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Tariff</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>Hardware Mode</th>
              </tr>
            </thead>
            <tbody>
              {chargers.slice(0, 6).map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {c.identifier}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155' }}>{c.name}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: c.chargerType === 'DC' ? '#ecfdf5' : '#f0f9ff',
                      color: c.chargerType === 'DC' ? '#059669' : '#0284c7',
                      fontWeight: 700,
                      fontSize: '11px'
                    }}>
                      {c.chargerType} FAST
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.maxPowerKw} kW</td>
                  <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 700 }}>₹{c.tariffPerKwh}/kWh</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: c.status === 'AVAILABLE' ? '#ecfdf5' :
                                  c.status === 'CHARGING' ? '#f0fdf4' :
                                  c.status === 'FAULTED' ? '#fef2f2' : '#f1f5f9',
                      color: c.status === 'AVAILABLE' ? '#059669' :
                             c.status === 'CHARGING' ? '#16a34a' :
                             c.status === 'FAULTED' ? '#dc2626' : '#475569',
                      border: c.status === 'AVAILABLE' ? '1px solid #a7f3d0' :
                              c.status === 'CHARGING' ? '1px solid #bbf7d0' :
                              c.status === 'FAULTED' ? '1px solid #fecaca' : '1px solid #cbd5e1'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {c.isSimulated ? (
                      <span style={{ color: '#059669', fontSize: '11px', fontWeight: 600 }}>● VIRTUAL SIMULATOR</span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>PHYSICAL</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

