import React from 'react';
import { Charger, SimulatorEvent, ChargingSession } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Sliders, AlertTriangle, PowerOff, CheckCircle2, Zap, Power, Square, QrCode } from 'lucide-react';

interface SimulatorViewProps {
  chargers: Charger[];
  events: SimulatorEvent[];
  sessions: ChargingSession[];
  onTriggerFault: (id: number) => void;
  onTriggerOffline: (id: number) => void;
  onTriggerRestore: (id: number) => void;
  onTurnOn: (id: number) => void;
  onTurnOff: (id: number) => void;
  onOpenQrModal: (charger: Charger) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  chargers,
  events,
  sessions,
  onTriggerFault,
  onTriggerOffline,
  onTriggerRestore,
  onTurnOn,
  onTurnOff,
  onOpenQrModal
}) => {
  const eventColumns: Column<SimulatorEvent>[] = [
    {
      header: 'Hardware Target',
      render: ev => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
          {ev.charger_identifier || `Charger #${ev.charger_id}`}
        </span>
      )
    },
    {
      header: 'Event Trigger',
      render: ev => {
        const isFault = ev.event_type.includes('FAULT');
        const isOffline = ev.event_type.includes('OFFLINE');
        const isRestore = ev.event_type.includes('RESTORE') || ev.event_type.includes('START') || ev.event_type.includes('ON');
        return (
          <span style={{
            fontWeight: 700,
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: isFault ? '#fef2f2' : isOffline ? '#f1f5f9' : isRestore ? '#ecfdf5' : '#f0f9ff',
            color: isFault ? '#dc2626' : isOffline ? '#475569' : isRestore ? '#059669' : '#0284c7'
          }}>
            {ev.event_type}
          </span>
        );
      }
    },
    {
      header: 'Telemetry Details',
      render: ev => (
        <span style={{ color: '#475569', fontSize: '13px' }}>
          {ev.details}
        </span>
      )
    },
    {
      header: 'Timestamp',
      render: ev => (
        <span style={{ color: '#64748b', fontSize: '12px' }}>
          {new Date(ev.created_at).toLocaleTimeString()}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Simulator Engine Banner */}
      <div style={{
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#059669',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sliders size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#065f46' }}>
              Virtual EV Charger Hardware Simulator Engine
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#ffffff',
              color: '#059669',
              border: '1px solid #a7f3d0'
            }}>
              LIVE ENGINE ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#047857', lineHeight: '1.5' }}>
            Software-only Virtual Charger Simulator reproduced with continuous 2-second telemetry ticks,
            realistic power curves, ground fault injection, and QR dispenser verification.
            All readings are labeled <code style={{ background: '#d1fae5', color: '#065f46' }}>[SIMULATED]</code> in database records.
          </p>
        </div>
      </div>

      {/* Simulator Controls Grid */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Hardware Interactive Testing Rack & Charger ON/OFF
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '18px'
        }}>
          {chargers.map(c => {
            const isCharging = c.status === 'CHARGING';
            const isAvailable = c.status === 'AVAILABLE';
            const isOffline = c.status === 'OFFLINE';
            // Only genuine customer sessions, never admin
            const activeSession = sessions.find(s => s.chargerId === c.id && s.status === 'IN_PROGRESS' && s.userEmail !== 'admin@haltcharge.com');

            return (
              <div key={c.id} style={{
                background: '#ffffff',
                border: isCharging ? '2px solid #a7f3d0' : '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: isCharging ? '0 4px 14px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', fontFamily: 'monospace' }}>
                        {c.identifier}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onOpenQrModal(c)}
                        title="View Station QR Placard"
                        style={{
                          padding: '3px 6px',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#059669',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        <QrCode size={13} />
                        <span>QR</span>
                      </button>
                      <span style={{
                        padding: '3px 8px',
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
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #f1f5f9' }}>
                    Speed: <strong>{c.maxPowerKw} kW ({c.chargerType})</strong> • Tariff: <strong>₹{c.tariffPerKwh}/kWh</strong>
                  </div>

                  {/* Connected Customer & Live Metrics: Only shown when a real customer scans QR and charges */}
                  {activeSession ? (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#065f46' }}>
                          CONNECTED CUSTOMER:
                        </span>
                        <span style={{ fontSize: '10px', background: '#d1fae5', color: '#047857', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                          CHARGING ACTIVE
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                        {activeSession.userEmail || `Customer #${activeSession.userId}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#047857', fontFamily: 'monospace', marginTop: '2px' }}>
                        {activeSession.sessionUid}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px', fontSize: '11px' }}>
                        <div>Energy: <strong>{activeSession.energyKwh?.toFixed(2) || '0.00'} kWh</strong></div>
                        <div>Power: <strong>{activeSession.currentPowerKw?.toFixed(1) || '0.0'} kW</strong></div>
                        <div>Cost: <strong>₹{activeSession.estimatedCost?.toFixed(2) || '0.00'}</strong></div>
                        <div>Duration: <strong>{Math.floor((activeSession.durationSeconds || 0) / 60)}m {((activeSession.durationSeconds || 0) % 60)}s</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginBottom: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {c.status === 'AVAILABLE'
                        ? '● Powered ON • Waiting for customer to scan QR & start charging'
                        : c.status === 'OFFLINE'
                        ? '● Powered OFF • Click TURN ON to make available for customer QR scanning'
                        : 'No customer connected (Idle)'}
                    </div>
                  )}
                </div>

                {/* Simulator Action Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Primary ON / OFF Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onTurnOn(c.id)}
                      disabled={isAvailable || isCharging}
                      title={isAvailable ? "Charger is already ON & Available" : "Turn Charger ON (Make Available for QR scan)"}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: isAvailable || isCharging ? '#f1f5f9' : '#10b981',
                        border: 'none',
                        borderRadius: '8px',
                        color: isAvailable || isCharging ? '#94a3b8' : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isAvailable || isCharging ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: isAvailable || isCharging ? 'none' : '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Power size={14} />
                      <span>TURN ON</span>
                    </button>

                    <button
                      onClick={() => onTurnOff(c.id)}
                      disabled={isOffline}
                      title={isOffline ? "Charger is already OFF" : "Turn Charger OFF (Power down dispenser)"}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: isOffline ? '#f1f5f9' : '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        color: isOffline ? '#94a3b8' : '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isOffline ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: isOffline ? 'none' : '0 2px 6px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <Square size={14} />
                      <span>TURN OFF</span>
                    </button>
                  </div>

                  {/* Fault / Offline / Restore Testing Controls */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => onTriggerFault(c.id)}
                      disabled={c.status === 'FAULTED'}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: c.status === 'FAULTED' ? 'not-allowed' : 'pointer',
                        opacity: c.status === 'FAULTED' ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={12} />
                      Fault
                    </button>

                    <button
                      onClick={() => onTriggerOffline(c.id)}
                      disabled={c.status === 'OFFLINE'}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: c.status === 'OFFLINE' ? 'not-allowed' : 'pointer',
                        opacity: c.status === 'OFFLINE' ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <PowerOff size={12} />
                      Offline
                    </button>

                    <button
                      onClick={() => onTriggerRestore(c.id)}
                      disabled={c.status === 'AVAILABLE'}
                      style={{
                        flex: 1.2,
                        padding: '6px 8px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: c.status === 'AVAILABLE' ? 'not-allowed' : 'pointer',
                        opacity: c.status === 'AVAILABLE' ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Event Stream */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Real-time Simulator Event Stream
        </h3>
        <DataTable
          data={events}
          columns={eventColumns}
          keyExtractor={ev => ev.id}
          searchPlaceholder="Search event stream by charger or details..."
          searchFilter={(ev, q) =>
            (ev.charger_identifier && ev.charger_identifier.toLowerCase().includes(q)) ||
            ev.event_type.toLowerCase().includes(q) ||
            ev.details.toLowerCase().includes(q)
          }
          emptyTitle="No simulator events"
          emptyDescription="Event stream will populate as chargers connect and sessions tick."
        />
      </div>
    </div>
  );
};
