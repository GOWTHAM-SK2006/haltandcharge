import React, { useState } from 'react';
import { Charger } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Percent, Zap, Check, Edit2, ShieldAlert } from 'lucide-react';
import { apiRequest } from '../api';

interface TariffsViewProps {
  chargers: Charger[];
  onRefresh: () => void;
}

export const TariffsView: React.FC<TariffsViewProps> = ({ chargers, onRefresh }) => {
  const [editingChargerId, setEditingChargerId] = useState<number | null>(null);
  const [newTariffValue, setNewTariffValue] = useState<number>(18.5);

  const handleUpdate = async (id: number) => {
    try {
      await apiRequest(`/api/admin/tariffs/chargers/${id}?tariff=${newTariffValue}`, { method: 'PUT' });
      setEditingChargerId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update tariff');
    }
  };

  const columns: Column<Charger>[] = [
    {
      header: 'Identifier',
      render: c => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{c.identifier}</span>
    },
    {
      header: 'Hardware Name',
      accessor: 'name'
    },
    {
      header: 'Charging Standard',
      render: c => (
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
      )
    },
    {
      header: 'Power Capacity',
      render: c => <span style={{ fontWeight: 600 }}>{c.maxPowerKw} kW</span>
    },
    {
      header: 'Rate per kWh',
      render: c => {
        if (editingChargerId === c.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>₹</span>
              <input
                type="number"
                step="0.5"
                value={newTariffValue}
                onChange={e => setNewTariffValue(parseFloat(e.target.value))}
                style={{ width: '70px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #10b981', fontSize: '13px' }}
              />
              <button
                onClick={() => handleUpdate(c.id)}
                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingChargerId(null)}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}
              >
                Cancel
              </button>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>₹{c.tariffPerKwh}/kWh</span>
            <button
              onClick={() => { setEditingChargerId(c.id); setNewTariffValue(c.tariffPerKwh); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              <Edit2 size={11} />
              Adjust
            </button>
          </div>
        );
      }
    },
    {
      header: 'Tariff Policy',
      render: c => (
        <span style={{ color: '#64748b', fontSize: '12px' }}>
          {c.chargerType === 'DC' ? 'Peak High-Speed Grid Rate' : 'Standard Fleet Slow Rate'}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tariff Policy Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '18px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <span>DC Ultra-Fast Rate</span>
            <Zap size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>₹18.50 / kWh</div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>Active baseline rate</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <span>AC Standard Rate</span>
            <Zap size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>₹14.00 / kWh</div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>Standard overnight / destination</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>
            <span>GST & Tax Inclusion</span>
            <Percent size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>18% GST Included</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Standard EV charging power levy</div>
        </div>
      </div>

      {/* Chargers Tariff Table */}
      <DataTable
        data={chargers}
        columns={columns}
        keyExtractor={c => c.id}
        searchPlaceholder="Search chargers to adjust tariff..."
        searchFilter={(c, q) =>
          c.identifier.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.chargerType.toLowerCase().includes(q)
        }
        emptyTitle="No chargers available for tariff configuration"
        emptyDescription="Deploy chargers in your network fleet to configure per-kWh charging rates."
      />
    </div>
  );
};
