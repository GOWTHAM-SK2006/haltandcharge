import React, { useState } from 'react';
import { Charger, Station, ChargingSession } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { Zap, Plus, Edit2, Check, X, QrCode, Power, Square, AlertCircle, Play } from 'lucide-react';
import { apiRequest } from '../api';

interface ChargersViewProps {
  chargers: Charger[];
  stations: Station[];
  sessions: ChargingSession[];
  onOpenAddCharger: () => void;
  onRefresh: () => void;
  onOpenQrModal: (charger: Charger) => void;
}

export const ChargersView: React.FC<ChargersViewProps> = ({
  chargers,
  stations,
  sessions,
  onOpenAddCharger,
  onRefresh,
  onOpenQrModal
}) => {
  const [editingChargerId, setEditingChargerId] = useState<number | null>(null);
  const [editTariffValue, setEditTariffValue] = useState<number>(18.5);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveTariff = async (chargerId: number) => {
    try {
      await apiRequest(`/api/admin/tariffs/chargers/${chargerId}?tariff=${editTariffValue}`, { method: 'PUT' });
      setEditingChargerId(null);
      showToast('Tariff updated successfully');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update tariff', 'error');
    }
  };

  // Turn ON Charger (Start Simulator)
  const handleTurnOn = async (chargerId: number) => {
    setActionLoadingId(chargerId);
    try {
      const res = await apiRequest<{ message: string; success: boolean }>(`/api/admin/simulator/chargers/${chargerId}/turn-on`, {
        method: 'POST'
      });
      showToast(res.message || 'Charger turned ON successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to turn charger ON', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Turn OFF Charger (Stop Simulator safely)
  const handleTurnOff = async (chargerId: number) => {
    setActionLoadingId(chargerId);
    try {
      const res = await apiRequest<{ message: string; success: boolean }>(`/api/admin/simulator/chargers/${chargerId}/turn-off`, {
        method: 'POST'
      });
      showToast(res.message || 'Charger turned OFF successfully', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to turn charger OFF', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns: Column<Charger>[] = [
    {
      header: 'Identifier',
      render: c => {
        const station = stations.find(s => s.id === c.stationId);
        return (
          <div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
              {c.identifier}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {station?.name || `Station #${c.stationId}`}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Hardware Model',
      accessor: 'name'
    },
    {
      header: 'Connector & Power',
      render: c => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{
            display: 'inline-block',
            width: 'fit-content',
            padding: '2px 8px',
            borderRadius: '4px',
            background: c.chargerType === 'DC' ? '#ecfdf5' : '#f0f9ff',
            color: c.chargerType === 'DC' ? '#059669' : '#0284c7',
            fontWeight: 700,
            fontSize: '11px'
          }}>
            {c.chargerType} FAST {c.chargerType === 'DC' ? '(CCS2)' : '(Type 2)'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
            {c.maxPowerKw} kW max
          </span>
        </div>
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
      header: 'Connected Customer / Session',
      render: c => {
        const activeSession = sessions.find(s => s.chargerId === c.id && s.status === 'IN_PROGRESS');
        if (!activeSession) {
          return (
            <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
              No customer connected (Idle)
            </span>
          );
        }
        return (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>
              {activeSession.userEmail || `User #${activeSession.userId}`}
            </div>
            <div style={{ fontFamily: 'monospace', color: '#059669', fontSize: '10px' }}>
              {activeSession.sessionUid}
            </div>
            <div style={{ color: '#475569', marginTop: '2px' }}>
              <strong>{activeSession.energyKwh?.toFixed(2) || '0.00'} kWh</strong> • {activeSession.currentPowerKw?.toFixed(1) || '0.0'} kW
              <span style={{ marginLeft: '4px', color: '#059669', fontWeight: 600 }}>₹{activeSession.estimatedCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
              [SIMULATED TELEMETRY]
            </div>
          </div>
        );
      }
    },
    {
      header: 'Controls & QR',
      render: c => {
        const isCharging = c.status === 'CHARGING';
        const isLoading = actionLoadingId === c.id;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* START/ON Control */}
            <button
              onClick={() => handleTurnOn(c.id)}
              disabled={isCharging || isLoading}
              title={isCharging ? "Charger is already running" : "Turn Charger ON (Start Simulator)"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #a7f3d0',
                background: isCharging ? '#f1f5f9' : '#ecfdf5',
                color: isCharging ? '#94a3b8' : '#059669',
                fontSize: '11px',
                fontWeight: 700,
                cursor: isCharging || isLoading ? 'not-allowed' : 'pointer',
                opacity: isCharging ? 0.6 : 1
              }}
            >
              <Power size={13} />
              <span>ON</span>
            </button>

            {/* STOP/OFF Control */}
            <button
              onClick={() => handleTurnOff(c.id)}
              disabled={!isCharging || isLoading}
              title={!isCharging ? "Charger is already idle" : "Turn Charger OFF (Safely Stop Simulator)"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #fecaca',
                background: !isCharging ? '#f1f5f9' : '#fef2f2',
                color: !isCharging ? '#94a3b8' : '#dc2626',
                fontSize: '11px',
                fontWeight: 700,
                cursor: !isCharging || isLoading ? 'not-allowed' : 'pointer',
                opacity: !isCharging ? 0.6 : 1
              }}
            >
              <Square size={13} />
              <span>OFF</span>
            </button>

            {/* QR Code Action Button */}
            <button
              onClick={() => onOpenQrModal(c)}
              title="Preview, Download & Print QR Code"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <QrCode size={13} color="#059669" />
              <span>QR</span>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 110,
          background: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 700
        }}>
          {toastMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

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
          { label: 'Charging (Active)', value: 'CHG', filterFn: c => c.status === 'CHARGING' },
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
