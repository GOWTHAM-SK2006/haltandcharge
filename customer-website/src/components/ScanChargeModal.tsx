import React, { useState } from 'react';
import { X, QrCode, Zap, Car, Shield, CheckCircle2 } from 'lucide-react';
import { Station, Charger, Vehicle } from '../types';

interface ScanChargeModalProps {
  stations: Station[];
  vehicles: Vehicle[];
  selectedChargerId?: string;
  onStartCharging: (chargerIdentifier: string, vehicleId?: number) => Promise<void>;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const ScanChargeModal: React.FC<ScanChargeModalProps> = ({
  stations,
  vehicles,
  selectedChargerId,
  onStartCharging,
  onClose,
  isAuthenticated,
  onOpenAuth
}) => {
  // Collect all available chargers from stations
  const allChargers: { charger: Charger; station: Station }[] = [];
  stations.forEach(st => {
    st.chargers?.forEach(ch => {
      allChargers.push({ charger: ch, station: st });
    });
  });

  const defaultCharger = selectedChargerId || (allChargers[0]?.charger.identifier ?? 'HC-KOR-DC-01');
  const [chargerId, setChargerId] = useState(defaultCharger);
  const [vehicleId, setVehicleId] = useState<number | undefined>(vehicles[0]?.id);
  const [isStarting, setIsStarting] = useState(false);

  const selectedChargerObj = allChargers.find(c => c.charger.identifier === chargerId);

  const handleStart = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setIsStarting(true);
    try {
      await onStartCharging(chargerId, vehicleId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to start charging session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: 'var(--hc-shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hc-border)', position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--hc-border-dark)',
            margin: '0 auto 12px'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--hc-green-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--hc-green-primary)'
              }}>
                <QrCode size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Scan & Charge</h3>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Scan QR code or enter charger identifier</p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--hc-surface-subtle)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--hc-text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder Simulator */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            height: '160px',
            backgroundColor: '#0f172a',
            borderRadius: '18px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
          }}>
            {/* Viewfinder Corner Brackets */}
            <div style={{
              width: '110px',
              height: '110px',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QrCode size={48} color="rgba(255, 255, 255, 0.6)" />
              {/* Animated laser line */}
              <div
                className="scanner-laser"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b981, 0 0 20px #10b981'
                }}
              />
            </div>

            <span style={{
              position: 'absolute',
              bottom: '10px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: '0.3px'
            }}>
              Align Halt & Charge QR code within frame
            </span>
          </div>

          {/* Charger Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-secondary)', marginBottom: '6px', display: 'block' }}>
              Select Charger / Port:
            </label>
            <select
              value={chargerId}
              onChange={e => setChargerId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--hc-border)',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--hc-text-primary)',
                outline: 'none'
              }}
            >
              {allChargers.map(({ charger, station }) => (
                <option key={charger.identifier} value={charger.identifier}>
                  {charger.identifier} • {station.name} ({charger.maxPowerKw} kW {charger.chargerType})
                </option>
              ))}
            </select>
          </div>

          {/* Charger Info Card */}
          {selectedChargerObj && (
            <div style={{
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Location</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>
                  {selectedChargerObj.station.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Tariff</span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-green-primary)' }}>
                  ₹{selectedChargerObj.charger.tariffPerKwh.toFixed(2)} / kWh
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Selector */}
          {isAuthenticated && vehicles.length > 0 && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-secondary)', marginBottom: '6px', display: 'block' }}>
                Charging Vehicle:
              </label>
              <select
                value={vehicleId}
                onChange={e => setVehicleId(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--hc-border)',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--hc-text-primary)',
                  outline: 'none'
                }}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.licensePlate})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unauthenticated notice */}
          {!isAuthenticated && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <span>Sign in required to initiate charging.</span>
              <button
                onClick={onOpenAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--hc-border)', backgroundColor: '#ffffff' }}>
          <button
            onClick={handleStart}
            disabled={isStarting}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: 'var(--hc-green-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: 'var(--hc-shadow-md)',
              opacity: isStarting ? 0.75 : 1
            }}
          >
            <Zap size={20} fill="#ffffff" />
            <span>{isStarting ? 'Connecting to Charger...' : 'Start Charging Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
