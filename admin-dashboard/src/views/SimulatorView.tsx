import React from 'react';
import { Charger, SimulatorEvent } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Sliders, AlertTriangle, PowerOff, CheckCircle2, Zap } from 'lucide-react';

interface SimulatorViewProps {
  chargers: Charger[];
  events: SimulatorEvent[];
  onTriggerFault: (id: number) => void;
  onTriggerOffline: (id: number) => void;
  onTriggerRestore: (id: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  chargers,
  events,
  onTriggerFault,
  onTriggerOffline,
  onTriggerRestore
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
        const isRestore = ev.event_type.includes('RESTORE') || ev.event_type.includes('START');
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
            Since physical charging stations are initially simulated, this engine reproduces continuous
            hardware telemetry, dynamic SOC curves, power dispatch, ground fault simulations and automatic billing deductions.
            All telemetry is tagged <code style={{ background: '#d1fae5', color: '#065f46' }}>[SIMULATED]</code> in the database.
          </p>
        </div>
      </div>

      {/* Simulator Controls Grid */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Hardware Interactive Testing Rack
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {chargers.map(c => (
            <div key={c.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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

                <div style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #f1f5f9' }}>
                  Speed: <strong>{c.maxPowerKw} kW ({c.chargerType})</strong> • Tariff: <strong>₹{c.tariffPerKwh}/kWh</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onTriggerFault(c.id)}
                  disabled={c.status === 'FAULTED'}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '7px',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: c.status === 'FAULTED' ? 'not-allowed' : 'pointer',
                    opacity: c.status === 'FAULTED' ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <AlertTriangle size={13} />
                  Fault
                </button>

                <button
                  onClick={() => onTriggerOffline(c.id)}
                  disabled={c.status === 'OFFLINE'}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '7px',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: c.status === 'OFFLINE' ? 'not-allowed' : 'pointer',
                    opacity: c.status === 'OFFLINE' ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <PowerOff size={13} />
                  Offline
                </button>

                <button
                  onClick={() => onTriggerRestore(c.id)}
                  disabled={c.status === 'AVAILABLE'}
                  style={{
                    flex: 1.2,
                    padding: '7px 10px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '7px',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: c.status === 'AVAILABLE' ? 'not-allowed' : 'pointer',
                    opacity: c.status === 'AVAILABLE' ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={13} />
                  Restore
                </button>
              </div>
            </div>
          ))}
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
