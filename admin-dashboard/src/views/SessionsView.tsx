import React from 'react';
import { ChargingSession } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Activity, Clock, Zap } from 'lucide-react';

interface SessionsViewProps {
  sessions: ChargingSession[];
}

export const SessionsView: React.FC<SessionsViewProps> = ({ sessions }) => {
  const columns: Column<ChargingSession>[] = [
    {
      header: 'Session Reference',
      render: s => (
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
            {s.sessionUid}
          </span>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Started: {new Date(s.startedAt).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      render: s => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.userEmail || `User #${s.userId}`}</div>
          {s.userName && <div style={{ fontSize: '11px', color: '#64748b' }}>{s.userName}</div>}
        </div>
      )
    },
    {
      header: 'Station & Gun',
      render: s => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.stationName || `Station #${s.stationId}`}</div>
          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{s.chargerIdentifier || `Gun #${s.chargerId}`}</div>
        </div>
      )
    },
    {
      header: 'Energy (kWh)',
      render: s => (
        <span style={{ fontWeight: 700, color: '#059669', fontSize: '14px' }}>
          {Number(s.energyKwh).toFixed(3)}
        </span>
      )
    },
    {
      header: 'Power Speed',
      render: s => (
        <span style={{ color: '#334155', fontWeight: 600 }}>
          {Number(s.currentPowerKw).toFixed(1)} kW
        </span>
      )
    },
    {
      header: 'Billed Cost',
      render: s => (
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          ₹{Number(s.estimatedCost).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Duration',
      render: s => (
        <span style={{ color: '#475569', fontSize: '12px' }}>
          {Math.floor(s.durationSeconds / 60)}m {s.durationSeconds % 60}s
        </span>
      )
    },
    {
      header: 'Status',
      render: s => {
        const isProg = s.status === 'IN_PROGRESS';
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: isProg ? '#ecfdf5' : '#f1f5f9',
            color: isProg ? '#059669' : '#475569',
            border: isProg ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
          }}>
            {s.status}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <DataTable
        data={sessions}
        columns={columns}
        keyExtractor={s => s.id}
        searchPlaceholder="Search sessions by UID, customer email, or station..."
        searchFilter={(s, q) =>
          s.sessionUid.toLowerCase().includes(q) ||
          (s.userEmail && s.userEmail.toLowerCase().includes(q)) ||
          (s.stationName && s.stationName.toLowerCase().includes(q)) ||
          (s.chargerIdentifier && s.chargerIdentifier.toLowerCase().includes(q))
        }
        filterOptions={[
          { label: 'All Sessions', value: 'ALL', filterFn: () => true },
          { label: 'In Progress', value: 'PROG', filterFn: s => s.status === 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMP', filterFn: s => s.status === 'COMPLETED' }
        ]}
        emptyTitle="No charging sessions recorded"
        emptyDescription="Sessions appear here when customers connect vehicles and initiate charging sessions."
      />
    </div>
  );
};
