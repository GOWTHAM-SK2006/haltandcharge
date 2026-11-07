import React from 'react';
import { SupportTicket } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { LifeBuoy, CheckCircle2, Clock } from 'lucide-react';
import { apiRequest } from '../api';

interface SupportViewProps {
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ tickets, onRefresh }) => {
  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await apiRequest(`/api/admin/support-tickets/${ticketId}/status?status=${newStatus}`, { method: 'PUT' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket ID',
      render: t => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>#{t.id}</span>,
      width: '80px'
    },
    {
      header: 'Customer',
      render: t => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.user_name || 'Customer'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.user_email || `User #${t.user_id}`}</div>
        </div>
      )
    },
    {
      header: 'Subject & Details',
      render: t => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.subject}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', maxWidth: '380px' }}>
            {t.message}
          </div>
        </div>
      )
    },
    {
      header: 'Priority',
      render: t => {
        const isHigh = t.priority === 'HIGH' || t.priority === 'CRITICAL';
        const isMed = t.priority === 'MEDIUM';
        return (
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            background: isHigh ? '#fef2f2' : isMed ? '#fffbeb' : '#ecfdf5',
            color: isHigh ? '#dc2626' : isMed ? '#d97706' : '#059669',
            border: isHigh ? '1px solid #fecaca' : isMed ? '1px solid #fde68a' : '1px solid #a7f3d0'
          }}>
            {t.priority}
          </span>
        );
      }
    },
    {
      header: 'Status',
      render: t => {
        const isResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
        const isInProg = t.status === 'IN_PROGRESS';
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: isResolved ? '#ecfdf5' : isInProg ? '#f0f9ff' : '#fffbeb',
            color: isResolved ? '#059669' : isInProg ? '#0284c7' : '#d97706',
            border: isResolved ? '1px solid #a7f3d0' : isInProg ? '1px solid #bae6fd' : '1px solid #fde68a'
          }}>
            {t.status}
          </span>
        );
      }
    },
    {
      header: 'Date Logged',
      render: t => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(t.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Resolution Actions',
      align: 'right',
      render: t => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {t.status !== 'RESOLVED' && (
            <button
              onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                background: '#ecfdf5',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={12} />
              Resolve
            </button>
          )}
          {t.status === 'OPEN' && (
            <button
              onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
                background: '#f0f9ff',
                color: '#0284c7',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Clock size={12} />
              In Progress
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={tickets}
        columns={columns}
        keyExtractor={t => t.id}
        searchPlaceholder="Search support tickets by customer, subject, or message..."
        searchFilter={(t, q) =>
          t.subject.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q) ||
          (t.user_email && t.user_email.toLowerCase().includes(q))
        }
        filterOptions={[
          { label: 'All Tickets', value: 'ALL', filterFn: () => true },
          { label: 'Open', value: 'OPEN', filterFn: t => t.status === 'OPEN' },
          { label: 'In Progress', value: 'PROG', filterFn: t => t.status === 'IN_PROGRESS' },
          { label: 'Resolved', value: 'RES', filterFn: t => t.status === 'RESOLVED' }
        ]}
        emptyTitle="No support tickets pending"
        emptyDescription="Great job! There are currently no customer inquiries or issues awaiting resolution."
      />
    </div>
  );
};
