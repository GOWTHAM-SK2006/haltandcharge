import React from 'react';
import { Station } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { MapPin, Plus, Navigation } from 'lucide-react';

interface StationsViewProps {
  stations: Station[];
  onOpenAddStation: () => void;
}

export const StationsView: React.FC<StationsViewProps> = ({
  stations,
  onOpenAddStation
}) => {
  const columns: Column<Station>[] = [
    {
      header: 'Station Details',
      render: st => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{st.name}</div>
          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={13} color="#059669" />
            {st.address}, {st.city}
          </div>
        </div>
      )
    },
    {
      header: 'City / Region',
      accessor: 'city'
    },
    {
      header: 'GPS Coordinates',
      render: st => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          {Number(st.latitude).toFixed(4)}, {Number(st.longitude).toFixed(4)}
        </span>
      )
    },
    {
      header: 'Operating Hours',
      accessor: 'operatingHours'
    },
    {
      header: 'Amenities',
      render: st => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(st.amenities || 'WiFi,Restroom').split(',').map((am, i) => (
            <span key={i} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
              {am.trim()}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      render: st => {
        const isOp = st.isActive !== false && st.status !== 'DECOMMISSIONED';
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            background: isOp ? '#ecfdf5' : '#fef2f2',
            color: isOp ? '#059669' : '#dc2626',
            border: isOp ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {st.status || (isOp ? 'OPERATIONAL' : 'INACTIVE')}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <DataTable
        data={stations}
        columns={columns}
        keyExtractor={st => st.id}
        searchPlaceholder="Search stations by name, address, or city..."
        searchFilter={(st, q) =>
          st.name.toLowerCase().includes(q) ||
          st.address.toLowerCase().includes(q) ||
          st.city.toLowerCase().includes(q)
        }
        filterOptions={[
          { label: 'All Stations', value: 'ALL', filterFn: () => true },
          { label: 'Operational', value: 'OP', filterFn: st => st.isActive !== false && st.status !== 'DECOMMISSIONED' },
          { label: 'Maintenance', value: 'MAINT', filterFn: st => st.status === 'UNDER_MAINTENANCE' || st.isActive === false }
        ]}
        emptyTitle="No charging stations found"
        emptyDescription="Start expanding your network by adding your first EV charging hub station."
        emptyAction={
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
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Add First Station
          </button>
        }
        headerRight={
          <button
            onClick={onOpenAddStation}
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
            <Plus size={16} />
            Add Hub Station
          </button>
        }
      />
    </div>
  );
};

