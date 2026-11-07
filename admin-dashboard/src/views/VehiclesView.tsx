import React from 'react';
import { Vehicle } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Car, BatteryCharging } from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles }) => {
  const columns: Column<Vehicle>[] = [
    {
      header: 'ID',
      render: v => <span style={{ fontWeight: 700, color: '#64748b' }}>#{v.id}</span>,
      width: '60px'
    },
    {
      header: 'Vehicle Model',
      render: v => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Car size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{v.brand} {v.model}</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{v.license_plate}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Registered Owner',
      render: v => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.user_name || 'Customer'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{v.user_email || `User #${v.user_id}`}</div>
        </div>
      )
    },
    {
      header: 'Battery Pack',
      render: v => (
        <span style={{ fontWeight: 600, color: '#059669' }}>
          {v.battery_capacity_kwh} kWh
        </span>
      )
    },
    {
      header: 'Connector Standard',
      render: v => (
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: '#f1f5f9',
          color: '#334155',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {v.connector_type || 'CCS2'}
        </span>
      )
    },
    {
      header: 'Max Speed (kW)',
      render: v => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {v.max_charging_speed_kw} kW
        </span>
      )
    },
    {
      header: 'Default Flag',
      render: v => (
        v.is_default ? (
          <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', fontSize: '10px', fontWeight: 700 }}>
            PRIMARY
          </span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Secondary</span>
        )
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={vehicles}
        columns={columns}
        keyExtractor={v => v.id}
        searchPlaceholder="Search vehicles by brand, model, license plate, or owner..."
        searchFilter={(v, q) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.license_plate.toLowerCase().includes(q) ||
          (v.user_email && v.user_email.toLowerCase().includes(q))
        }
        emptyTitle="No customer vehicles found"
        emptyDescription="Customer EV profiles registered via the customer website will appear here."
      />
    </div>
  );
};

