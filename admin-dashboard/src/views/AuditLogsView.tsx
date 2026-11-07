import React from 'react';
import { AuditLog } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { ShieldCheck, Lock } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      render: l => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(l.created_at).toLocaleString()}
        </span>
      ),
      width: '180px'
    },
    {
      header: 'Actor / User',
      render: l => (
        <div style={{ fontWeight: 600, color: '#0f172a' }}>
          {l.user_email || `User #${l.user_id}`}
        </div>
      )
    },
    {
      header: 'Action Taken',
      render: l => (
        <span style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0'
        }}>
          {l.action}
        </span>
      )
    },
    {
      header: 'Resource Target',
      render: l => (
        <span style={{ color: '#475569', fontSize: '12px' }}>
          {l.resource_type} {l.resource_id ? `(#${l.resource_id})` : ''}
        </span>
      )
    },
    {
      header: 'Audit Description',
      render: l => (
        <span style={{ color: '#475569', fontSize: '12px' }}>
          {l.details || 'System operation executed'}
        </span>
      )
    },
    {
      header: 'IP Address',
      render: l => (
        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
          {l.ip_address || '127.0.0.1'}
        </span>
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={l => l.id}
        searchPlaceholder="Search audit trails by action, user, or resource..."
        searchFilter={(l, q) =>
          l.action.toLowerCase().includes(q) ||
          (l.user_email && l.user_email.toLowerCase().includes(q)) ||
          l.resource_type.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q))
        }
        emptyTitle="No audit logs recorded"
        emptyDescription="Administrative operations and security actions will be recorded here automatically."
      />
    </div>
  );
};

