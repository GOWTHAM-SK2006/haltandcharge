import React from 'react';
import { Booking } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { CalendarCheck, Clock, MapPin } from 'lucide-react';

interface BookingsViewProps {
  bookings: Booking[];
}

export const BookingsView: React.FC<BookingsViewProps> = ({ bookings }) => {
  const columns: Column<Booking>[] = [
    {
      header: 'Booking Ref',
      render: b => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>#{b.id}</span>,
      width: '90px'
    },
    {
      header: 'Customer',
      render: b => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.user_name || 'Customer'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{b.user_email || `User #${b.user_id}`}</div>
        </div>
      )
    },
    {
      header: 'Station & Charger',
      render: b => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.station_name || `Station #${b.station_id}`}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{b.charger_identifier || `Charger #${b.charger_id}`}</div>
        </div>
      )
    },
    {
      header: 'Schedule Slot',
      render: b => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#0f172a', fontWeight: 600 }}>{new Date(b.start_time).toLocaleDateString()}</div>
          <div style={{ color: '#64748b' }}>
            {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
    {
      header: 'Estimated Total',
      render: b => (
        <span style={{ fontWeight: 700, color: '#059669' }}>
          ₹{Number(b.estimated_amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      render: b => {
        const isConf = b.status === 'CONFIRMED';
        const isComp = b.status === 'COMPLETED';
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: isConf ? '#ecfdf5' : isComp ? '#f0fdf4' : '#fef2f2',
            color: isConf ? '#059669' : isComp ? '#16a34a' : '#dc2626',
            border: isConf ? '1px solid #a7f3d0' : isComp ? '1px solid #bbf7d0' : '1px solid #fecaca'
          }}>
            {b.status}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <DataTable
        data={bookings}
        columns={columns}
        keyExtractor={b => b.id}
        searchPlaceholder="Search bookings by customer, station, or charger..."
        searchFilter={(b, q) =>
          (b.user_email && b.user_email.toLowerCase().includes(q)) ||
          (b.station_name && b.station_name.toLowerCase().includes(q)) ||
          (b.charger_identifier && b.charger_identifier.toLowerCase().includes(q))
        }
        filterOptions={[
          { label: 'All Bookings', value: 'ALL', filterFn: () => true },
          { label: 'Confirmed', value: 'CONF', filterFn: b => b.status === 'CONFIRMED' },
          { label: 'Completed', value: 'COMP', filterFn: b => b.status === 'COMPLETED' },
          { label: 'Cancelled', value: 'CANC', filterFn: b => b.status === 'CANCELLED' }
        ]}
        emptyTitle="No charging slot bookings found"
        emptyDescription="When customers reserve time slots at charging hubs, reservations will appear here."
      />
    </div>
  );
};
