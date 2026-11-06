import React, { useState } from 'react';
import { X, Car, Plus, CheckCircle2, Battery, Zap, Shield } from 'lucide-react';
import { Vehicle } from '../types';

interface MyEvsModalProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicleData: Partial<Vehicle>) => Promise<void>;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const MyEvsModal: React.FC<MyEvsModalProps> = ({
  vehicles,
  onAddVehicle,
  onClose,
  isAuthenticated,
  onOpenAuth
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [brand, setBrand] = useState('Tata');
  const [model, setModel] = useState('Curvv EV');
  const [licensePlate, setLicensePlate] = useState('KA-04-EV-2025');
  const [batteryCapacity, setBatteryCapacity] = useState(55);
  const [connectorType, setConnectorType] = useState('CCS2');
  const [maxChargingSpeed, setMaxChargingSpeed] = useState(70);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddVehicle({
        brand,
        model,
        licensePlate,
        batteryCapacityKwh: batteryCapacity,
        connectorType,
        maxChargingSpeedKw: maxChargingSpeed,
        isDefault: vehicles.length === 0
      });
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: 'var(--hc-shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Pull handle & header */}
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
                <Car size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>My EV Garage</h3>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Manage registered electric vehicles</p>
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

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isAuthenticated ? (
            <div style={{
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--hc-surface-subtle)',
              borderRadius: '16px',
              border: '1px dashed var(--hc-border)'
            }}>
              <Car size={40} color="var(--hc-green-primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>Sign In to View Your Garage</h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                Save your vehicles, battery limits, and connector preferences.
              </p>
              <button
                onClick={onOpenAuth}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--hc-green-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Sign In / Register
              </button>
            </div>
          ) : showAddForm ? (
            /* Add Vehicle Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Add New Electric Vehicle</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 600, color: 'var(--hc-text-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Brand / Manufacturer</label>
                <input
                  type="text"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Tata, MG, Hyundai, Tesla"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--hc-border)',
                    marginTop: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. Nexon EV, Curvv, ZS EV"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--hc-border)',
                    marginTop: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Registration / License Plate</label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={e => setLicensePlate(e.target.value)}
                  placeholder="e.g. KA-04-EV-2025"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--hc-border)',
                    marginTop: '4px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Battery (kWh)</label>
                  <input
                    type="number"
                    value={batteryCapacity}
                    onChange={e => setBatteryCapacity(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--hc-border)',
                      marginTop: '4px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Connector</label>
                  <select
                    value={connectorType}
                    onChange={e => setConnectorType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--hc-border)',
                      marginTop: '4px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="CCS2">CCS2 (DC Fast)</option>
                    <option value="Type 2">Type 2 (AC)</option>
                    <option value="GB/T">GB/T</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
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
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Add Vehicle to Garage'}
              </button>
            </form>
          ) : (
            /* Vehicle List */
            <>
              {vehicles.map(v => (
                <div
                  key={v.id}
                  style={{
                    border: '1px solid var(--hc-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--hc-shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                          {v.brand} {v.model}
                        </h4>
                        {v.isDefault && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--hc-green-subtle)',
                            color: 'var(--hc-green-dark)'
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                        {v.licensePlate}
                      </p>
                    </div>

                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--hc-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--hc-text-secondary)'
                    }}>
                      <Car size={20} />
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--hc-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Battery size={16} color="var(--hc-green-primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hc-text-secondary)' }}>
                        {v.batteryCapacityKwh} kWh
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={16} color="var(--hc-green-primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--hc-text-secondary)' }}>
                        {v.connectorType} ({v.maxChargingSpeedKw || 60} kW max)
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '14px',
                  border: '1.5px dashed var(--hc-border)',
                  backgroundColor: 'var(--hc-surface-subtle)',
                  color: 'var(--hc-text-primary)',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Plus size={18} color="var(--hc-green-primary)" />
                Add New Electric Vehicle
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
