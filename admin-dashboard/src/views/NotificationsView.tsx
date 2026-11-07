import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Bell, Send, CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import { apiRequest } from '../api';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onOpenBroadcast: () => void;
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onOpenBroadcast,
  onRefresh
}) => {
  const columns: Column<NotificationItem>[] = [
    {
      header: 'ID',
      render: n => <span style={{ fontWeight: 700, color: '#64748b' }}>#{n.id}</span>,
      width: '60px'
    },
    {
      header: 'Announcement Title',
      render: n => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bell size={15} />
          </div>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{n.title}</span>
        </div>
      )
    },
    {
      header: 'Message Content',
      render: n => (
        <span style={{ color: '#475569', fontSize: '13px' }}>
          {n.body}
        </span>
      )
    },
    {
      header: 'Broadcast Type',
      render: n => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: n.type === 'ALERT' ? '#fef2f2' : n.type === 'PROMO' ? '#fffbeb' : '#ecfdf5',
          color: n.type === 'ALERT' ? '#dc2626' : n.type === 'PROMO' ? '#d97706' : '#059669',
          fontSize: '11px',
          fontWeight: 700
        }}>
          {n.type || 'ANNOUNCEMENT'}
        </span>
      )
    },
    {
      header: 'Recipient',
      render: n => (
        <span style={{ color: '#64748b', fontSize: '12px' }}>
          {n.user_email || 'Broadcast (All Active Users)'}
        </span>
      )
    },
    {
      header: 'Sent Timestamp',
      render: n => (
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {new Date(n.created_at).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={notifications}
        columns={columns}
        keyExtractor={n => n.id}
        searchPlaceholder="Search notifications by title or message..."
        searchFilter={(n, q) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          (n.user_email && n.user_email.toLowerCase().includes(q))
        }
        emptyTitle="No broadcast notifications sent yet"
        emptyDescription="Broadcast announcements, maintenance windows, or discount alerts to customer devices."
        emptyAction={
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
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Create First Broadcast
          </button>
        }
        headerRight={
          <button
            onClick={onOpenBroadcast}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Bell size={15} />
            New Broadcast
          </button>
        }
      />
    </div>
  );
};

