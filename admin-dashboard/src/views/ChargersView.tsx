import React, { useState } from 'react';
import { Charger } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Zap, Plus, Edit2, Check, X } from 'lucide-react';
import { apiRequest } from '../api';

interface ChargersViewProps {
  chargers: Charger[];
  onOpenAddCharger: () => void;
  onRefresh: () => void;
}

export const ChargersView: React.FC<ChargersViewProps> = ({
  chargers,
  onOpenAddCharger,
  onRefresh
}) => {
  const [editingChargerId, setEditingChargerId] = useState<number | null>(null);
  const [editTariffValue, setEditTariffValue] = useState<number>(18.5);

  const handleSaveTariff = async (chargerId: number) => {
    try {
      await apiRequest(`/api/admin/tariffs/chargers/${chargerId}?tariff=${editTariffValue}`, { method: 'PUT' });
      setEditingChargerId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update tariff');
    }
  };

  const columns: Column<Charger>[] = [
    {
      header: 'Identifier',
      render: c => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
          {c.identifier}
        </span>
      )
    },
    {
      header: 'Hardware Name',
      accessor: 'name'
    },
    {
      header: 'Charging Type',
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
      render: c => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {c.maxPowerKw} kW
        </span>
      )
    },
    {
      header: 'Tariff Rate',
      render: c => {
        if (editingChargerId === c.id) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>₹</span>
              <input
                type="number"
                step="0.1"
                value={editTariffValue}
                onChange={e => setEditTariffValue(parseFloat(e.target.value))}
                style={{ width: '65px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #10b981', fontSize: '12px' }}
              />
              <button
                onClick={() => handleSaveTariff(c.id)}
                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                title="Save"
              >
                <Check size={13} />
              </button>
              <button
                onClick={() => setEditingChargerId(null)}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}
                title="Cancel"
              >
                <X size={13} />
              </button>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>₹{c.tariffPerKwh}/kWh</span>
            <button
              onClick={() => { setEditingChargerId(c.id); setEditTariffValue(c.tariffPerKwh); }}
              title="Edit Tariff"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <Edit2 size={12} />
            </button>
          </div>
        );
      }
    },
    {
      header: 'Socket Status',
      render: c => (
        <span style={{
          padding: '4px 10px',
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
      )
    },
    {
      header: 'Simulator Engine',
      render: c => (
        c.isSimulated ? (
          <span style={{ color: '#059669', fontSize: '11px', fontWeight: 600 }}>● VIRTUAL SIMULATOR</span>
        ) : (
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>PHYSICAL</span>
        )
      )
    }
  ];

  return (
    <div>
      <DataTable
        data={chargers}
        columns={columns}
        keyExtractor={c => c.id}
        searchPlaceholder="Search chargers by identifier, model, or type..."
        searchFilter={(c, q) =>
          c.identifier.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.chargerType.toLowerCase().includes(q)
        }
        filterOptions={[
          { label: 'All Chargers', value: 'ALL', filterFn: () => true },
          { label: 'Available', value: 'AVAIL', filterFn: c => c.status === 'AVAILABLE' },
          { label: 'Charging', value: 'CHG', filterFn: c => c.status === 'CHARGING' },
          { label: 'Faulted', value: 'FLT', filterFn: c => c.status === 'FAULTED' },
          { label: 'DC Fast', value: 'DC', filterFn: c => c.chargerType === 'DC' }
        ]}
        emptyTitle="No EV chargers deployed"
        emptyDescription="Your fleet does not have any active chargers. Deploy a charger to enable customer charging."
        emptyAction={
          <button
            onClick={onOpenAddCharger}
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
            Deploy First Charger
          </button>
        }
        headerRight={
          <button
            onClick={onOpenAddCharger}
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
            Deploy Charger
          </button>
        }
      />
    </div>
  );
};
