import React, { useState } from 'react';
import { X, Zap, BatteryCharging, Clock, DollarSign, Gauge, StopCircle } from 'lucide-react';
import { ChargingSession } from '../types';

interface ActiveSessionModalProps {
  session: ChargingSession;
  onStopSession: (sessionId: number) => Promise<void>;
  onClose: () => void;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  session,
  onStopSession,
  onClose
}) => {
  const [isStopping, setIsStopping] = useState(false);

  const handleStop = async () => {
    if (!confirm('Are you sure you want to stop this active charging session?')) return;
    setIsStopping(true);
    try {
      await onStopSession(session.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to stop session');
    } finally {
      setIsStopping(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const soc = session.socPercentage ?? 65;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
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
                <Zap size={22} fill="var(--hc-green-primary)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Live Charging Cockpit</h3>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0'
                  }}>
                    SIMULATED
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--hc-green-dark)', fontWeight: 600 }}>
                  Active Port: {session.chargerIdentifier} • {session.stationName || 'Halt & Charge Station'}
                </p>
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

        {/* Live Cockpit */}
        <div style={{ padding: '24px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {/* Animated Battery SOC Circle */}
          <div style={{
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'conic-gradient(#10b981 0% calc(' + soc + ' * 1%), #e2e8f0 calc(' + soc + ' * 1%) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.25)',
            position: 'relative'
          }}>
            <div style={{
              width: '144px',
              height: '144px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <BatteryCharging size={26} color="var(--hc-green-primary)" />
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--hc-text-primary)', lineHeight: 1.1, marginTop: '2px' }}>
                {Math.round(soc)}%
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--hc-green-dark)', textTransform: 'uppercase' }}>
                State of Charge
              </span>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* Power Speed */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--hc-text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gauge size={16} color="var(--hc-green-primary)" />
                  Power Speed
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669' }}>SIMULATED</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--hc-text-primary)', marginTop: '4px' }}>
                {session.currentPowerKw?.toFixed(1) || '0.0'} <span style={{ fontSize: '13px', fontWeight: 600 }}>kW</span>
              </div>
            </div>

            {/* Energy Delivered */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--hc-text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} color="var(--hc-green-primary)" />
                  Delivered
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#059669' }}>SIMULATED</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--hc-text-primary)', marginTop: '4px' }}>
                {session.energyKwh?.toFixed(2) || '0.00'} <span style={{ fontSize: '13px', fontWeight: 600 }}>kWh</span>
              </div>
            </div>

            {/* Elapsed Duration */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--hc-text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <Clock size={16} color="var(--hc-green-primary)" />
                Duration
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--hc-text-primary)', marginTop: '4px' }}>
                {formatDuration(session.durationSeconds || 0)}
              </div>
            </div>

            {/* Current Cost */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--hc-text-muted)', fontSize: '12px', fontWeight: 600 }}>
                <DollarSign size={16} color="var(--hc-green-primary)" />
                Current Cost
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--hc-green-primary)', marginTop: '4px' }}>
                ₹{session.estimatedCost?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Stop Button Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--hc-border)', backgroundColor: '#ffffff' }}>
          <button
            onClick={handleStop}
            disabled={isStopping}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isStopping ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              opacity: isStopping ? 0.75 : 1
            }}
          >
            <StopCircle size={20} />
            <span>{isStopping ? 'Stopping Session...' : 'Stop Charging Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

