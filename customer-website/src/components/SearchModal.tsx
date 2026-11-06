import React, { useState } from 'react';
import { X, Search, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { Station } from '../types';

interface SearchModalProps {
  stations: Station[];
  onSelectStation: (station: Station) => void;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  stations,
  onSelectStation,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DC' | 'AC' | 'AVAILABLE'>('ALL');

  const filteredStations = stations.filter(station => {
    const matchesText = station.name.toLowerCase().includes(query.toLowerCase()) ||
      station.address.toLowerCase().includes(query.toLowerCase()) ||
      station.city.toLowerCase().includes(query.toLowerCase());

    if (!matchesText) return false;

    if (filterType === 'DC') {
      return station.chargers?.some(c => c.chargerType === 'DC');
    }
    if (filterType === 'AC') {
      return station.chargers?.some(c => c.chargerType === 'AC');
    }
    if (filterType === 'AVAILABLE') {
      const avail = station.chargers?.filter(c => c.status === 'AVAILABLE').length ?? station.availableChargers ?? 0;
      return avail > 0;
    }
    return true;
  });

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
        {/* Search Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hc-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--hc-surface-subtle)',
              borderRadius: '12px',
              padding: '10px 14px',
              border: '1px solid var(--hc-border)'
            }}>
              <Search size={18} color="var(--hc-green-primary)" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search station, city, or area..."
                autoFocus
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
              {query && (
                <button
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--hc-text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
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

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'ALL', label: 'All Stations' },
              { id: 'AVAILABLE', label: 'Available Now' },
              { id: 'DC', label: 'DC Fast (CCS2)' },
              { id: 'AC', label: 'AC Destination' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: filterType === tab.id ? '1px solid var(--hc-green-primary)' : '1px solid var(--hc-border)',
                  backgroundColor: filterType === tab.id ? 'var(--hc-green-subtle)' : '#ffffff',
                  color: filterType === tab.id ? 'var(--hc-green-dark)' : 'var(--hc-text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Results List */}
        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredStations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--hc-text-muted)' }}>
              <MapPin size={36} color="var(--hc-border-dark)" style={{ margin: '0 auto 10px' }} />
              <p style={{ fontWeight: 600, fontSize: '14px' }}>No charging stations found</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Try searching for a different area or removing filters</p>
            </div>
          ) : (
            filteredStations.map(st => {
              const avail = st.chargers?.filter(c => c.status === 'AVAILABLE').length ?? st.availableChargers ?? 0;
              const total = st.chargers?.length ?? st.totalChargers ?? 0;
              const maxKw = st.chargers ? Math.max(...st.chargers.map(c => c.maxPowerKw), 0) : 0;

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    onSelectStation(st);
                    onClose();
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--hc-border)',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'border-color 0.15s ease, transform 0.1s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--hc-green-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--hc-border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--hc-green-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--hc-green-primary)',
                      flexShrink: 0
                    }}>
                      <Zap size={22} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                        {st.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                        {st.address}, {st.city}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: avail > 0 ? 'var(--hc-green-dark)' : 'var(--hc-status-error)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle2 size={12} />
                          {avail}/{total} Available
                        </span>
                        {maxKw > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--hc-text-light)' }}>
                            • Up to {maxKw} kW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {st.distanceKm != null && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>
                        {st.distanceKm.toFixed(1)} km
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
