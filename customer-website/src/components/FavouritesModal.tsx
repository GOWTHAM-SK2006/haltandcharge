import React from 'react';
import { X, Heart, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { Station } from '../types';

interface FavouritesModalProps {
  favourites: Station[];
  onSelectStation: (station: Station) => void;
  onRemoveFavourite: (stationId: number) => void;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const FavouritesModal: React.FC<FavouritesModalProps> = ({
  favourites,
  onSelectStation,
  onRemoveFavourite,
  onClose,
  isAuthenticated,
  onOpenAuth
}) => {
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
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <Heart size={20} fill="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Saved Favourites</h3>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Quick access to your preferred charging spots</p>
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
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isAuthenticated ? (
            <div style={{
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--hc-surface-subtle)',
              borderRadius: '16px',
              border: '1px dashed var(--hc-border)'
            }}>
              <Heart size={40} color="#f87171" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>Sign In to Save Stations</h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px', marginBottom: '16px' }}>
                Access your favourite stations across all your devices.
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
                Sign In
              </button>
            </div>
          ) : favourites.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hc-text-muted)' }}>
              <Heart size={36} color="var(--hc-border-dark)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, fontSize: '14px' }}>No favourite stations yet</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Tap the heart icon on any station card to save it here</p>
            </div>
          ) : (
            favourites.map(st => {
              const avail = st.chargers?.filter(c => c.status === 'AVAILABLE').length ?? st.availableChargers ?? 0;
              const total = st.chargers?.length ?? st.totalChargers ?? 0;

              return (
                <div
                  key={st.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid var(--hc-border)',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--hc-shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                        {st.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                        {st.address}, {st.city}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveFavourite(st.id)}
                      title="Remove from favourites"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      <Heart size={20} fill="#ef4444" />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--hc-border)' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: avail > 0 ? 'var(--hc-green-dark)' : 'var(--hc-status-error)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={13} />
                      {avail}/{total} Available
                    </span>

                    <button
                      onClick={() => {
                        onSelectStation(st);
                        onClose();
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--hc-green-primary)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MapPin size={14} />
                      View on Map
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
