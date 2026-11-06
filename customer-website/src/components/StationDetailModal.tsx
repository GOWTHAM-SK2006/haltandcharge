import React from 'react';
import { X, Navigation, Heart, Zap, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Station, Charger } from '../types';

interface StationDetailModalProps {
  station: Station;
  isFavourite: boolean;
  onToggleFavourite: (stationId: number) => void;
  onStartCharge: (charger: Charger) => void;
  onClose: () => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  isFavourite,
  onToggleFavourite,
  onStartCharge,
  onClose
}) => {
  const availableCount = station.chargers?.filter(c => c.status === 'AVAILABLE').length ?? station.availableChargers ?? 0;
  const totalCount = station.chargers?.length ?? station.totalChargers ?? 0;

  const handleOpenDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
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
      {/* Bottom Sheet Card */}
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
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--hc-border)', position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--hc-border-dark)',
            margin: '0 auto 12px'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                  {station.name}
                </h3>
                <ShieldCheck size={18} color="var(--hc-green-primary)" />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                {station.address}, {station.city}
              </p>
            </div>

            {/* Close button */}
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

          {/* Quick status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: availableCount > 0 ? 'var(--hc-green-subtle)' : '#fee2e2',
              color: availableCount > 0 ? 'var(--hc-green-dark)' : 'var(--hc-status-error)'
            }}>
              <CheckCircle2 size={13} />
              {availableCount} of {totalCount} Plugs Available
            </span>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '14px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: 'var(--hc-surface-subtle)',
              color: 'var(--hc-text-secondary)'
            }}>
              <Clock size={13} />
              {station.operatingHours || '24/7'}
            </span>

            {station.distanceKm != null && (
              <span style={{
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'var(--hc-surface-subtle)',
                color: 'var(--hc-text-secondary)'
              }}>
                {station.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Amenities */}
          {station.amenities && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Amenities
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {station.amenities.split(',').map((amenity, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--hc-surface-subtle)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--hc-text-secondary)'
                    }}
                  >
                    {amenity.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Chargers */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Charging Ports ({station.chargers?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {station.chargers?.map(charger => {
                const isAvail = charger.status === 'AVAILABLE';
                return (
                  <div
                    key={charger.id}
                    style={{
                      border: '1px solid var(--hc-border)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isAvail ? '#ffffff' : 'var(--hc-surface-subtle)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        backgroundColor: isAvail ? 'var(--hc-green-subtle)' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAvail ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)'
                      }}>
                        <Zap size={20} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>
                            {charger.name}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: charger.chargerType === 'DC' ? '#dcfce7' : '#e0e7ff',
                            color: charger.chargerType === 'DC' ? '#166534' : '#3730a3'
                          }}>
                            {charger.chargerType} FAST
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                          Power: <strong>{charger.maxPowerKw} kW</strong> • Rate: <strong>₹{charger.tariffPerKwh.toFixed(2)}/kWh</strong>
                        </div>
                      </div>
                    </div>

                    {isAvail ? (
                      <button
                        onClick={() => onStartCharge(charger)}
                        style={{
                          backgroundColor: 'var(--hc-green-primary)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: 'var(--hc-shadow-sm)'
                        }}
                      >
                        Charge
                      </button>
                    ) : (
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: charger.status === 'CHARGING' ? 'var(--hc-status-charging)' : 'var(--hc-text-light)'
                      }}>
                        {charger.status}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--hc-border)',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Favourite Toggle */}
          <button
            onClick={() => onToggleFavourite(station.id)}
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: isFavourite ? '#fee2e2' : 'var(--hc-surface-subtle)',
              border: isFavourite ? '1px solid #fca5a5' : '1px solid var(--hc-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isFavourite ? '#ef4444' : 'var(--hc-text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Heart size={20} fill={isFavourite ? '#ef4444' : 'none'} />
          </button>

          {/* Navigation Directions */}
          <button
            onClick={handleOpenDirections}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--hc-text-primary)',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <Navigation size={18} color="var(--hc-green-primary)" />
            Directions
          </button>

          {/* Primary Action: Start Charging */}
          <button
            onClick={() => {
              const firstAvail = station.chargers?.find(c => c.status === 'AVAILABLE');
              if (firstAvail) {
                onStartCharge(firstAvail);
              } else if (station.chargers && station.chargers.length > 0) {
                onStartCharge(station.chargers[0]);
              }
            }}
            style={{
              flex: 1.5,
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--hc-green-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: 'var(--hc-shadow-md)'
            }}
          >
            <Zap size={18} fill="#ffffff" />
            Start Charging
          </button>
        </div>
      </div>
    </div>
  );
};
