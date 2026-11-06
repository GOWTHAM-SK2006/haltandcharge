import React, { useState } from 'react';
import { X, Navigation, BatteryCharging, Zap, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Station } from '../types';

interface TripPlannerModalProps {
  stations: Station[];
  onSelectStation: (station: Station) => void;
  onClose: () => void;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  stations,
  onSelectStation,
  onClose
}) => {
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Mysuru');
  const [batterySoc, setBatterySoc] = useState(75);
  const [isCalculated, setIsCalculated] = useState(false);

  // Mock calculated stops from stations
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculated(true);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: 'var(--hc-shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginTop: '8px'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--hc-green-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--hc-green-primary)'
            }}>
              <Navigation size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>EV Trip Planner</h3>
              <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Find optimal charging stops along your route</p>
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

        {/* Inputs */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Origin & Destination Inputs */}
            <div style={{
              backgroundColor: 'var(--hc-surface-subtle)',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid var(--hc-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--hc-green-primary)' }} />
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="Starting point (e.g. Bengaluru)"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--hc-text-primary)'
                  }}
                />
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--hc-border)', margin: '0 4px 0 16px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Destination (e.g. Mysuru)"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--hc-text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Battery Level Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BatteryCharging size={16} color="var(--hc-green-primary)" />
                  Current Battery Charge:
                </label>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-green-primary)' }}>
                  {batterySoc}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={batterySoc}
                onChange={e => setBatterySoc(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--hc-green-primary)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--hc-green-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--hc-shadow-sm)'
              }}
            >
              <span>Calculate Route & Stops</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Results Plan */}
          {isCalculated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              {/* Route Summary */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '14px',
                backgroundColor: 'var(--hc-green-subtle)',
                border: '1px solid var(--hc-green-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hc-green-dark)' }}>
                    Total Route
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--hc-green-darker)', marginTop: '2px' }}>
                    143 km • ~2h 45m
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--hc-green-dark)' }}>
                    Estimated Need
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--hc-green-darker)', marginTop: '2px' }}>
                    28.5 kWh
                  </div>
                </div>
              </div>

              {/* Recommended Halt Stop */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Recommended Charging Halt
                </h4>

                {stations.slice(0, 1).map(st => (
                  <div
                    key={st.id}
                    style={{
                      border: '1px solid var(--hc-border)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                          <Zap size={20} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                            {st.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                            At Km 68 • Stop for 22 mins to charge from 34% to 80%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => {
                          onSelectStation(st);
                          onClose();
                        }}
                        style={{
                          flex: 1,
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--hc-surface-subtle)',
                          border: '1px solid var(--hc-border)',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--hc-text-primary)',
                          cursor: 'pointer'
                        }}
                      >
                        View Station on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
