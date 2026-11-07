import React from 'react';
import { CheckCircle2, MapPin, Star, Navigation, Heart, Zap, Tag } from 'lucide-react';
import { Station, Charger } from '../types';
import canopyImg from '../assets/station-canopy.jpg';

interface StationCardProps {
  station: Station;
  isFavourite: boolean;
  onToggleFavourite: (stationId: number) => void;
  onViewDetails: (station: Station) => void;
  onStartCharge: (station: Station) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isFavourite,
  onToggleFavourite,
  onViewDetails,
  onStartCharge
}) => {
  // Compute charger specs
  const dcCharger = station.chargers?.find(c => c.chargerType === 'DC');
  const acCharger = station.chargers?.find(c => c.chargerType === 'AC');
  const maxDcPower = dcCharger?.maxPowerKw || 120;
  const maxAcPower = acCharger?.maxPowerKw || 22;
  const tariff = dcCharger?.tariffPerKwh || acCharger?.tariffPerKwh || 18.5;
  const availableCount = station.chargers?.filter(c => c.status === 'AVAILABLE').length ?? station.availableChargers ?? 4;
  const totalCount = station.chargers?.length ?? station.totalChargers ?? 6;
  const distance = station.distanceKm !== undefined ? station.distanceKm.toFixed(1) : '2.8';

  return (
    <div style={{
      position: 'fixed',
      bottom: '106px',
      left: '12px',
      right: '12px',
      maxWidth: '540px',
      margin: '0 auto',
      zIndex: 35,
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(226, 232, 240, 0.9)',
      padding: '12px 16px 14px 16px',
      pointerEvents: 'auto',
      transition: 'all 0.2s ease'
    }}>
      {/* Subtle Drag Handle Pill */}
      <div style={{
        width: '36px',
        height: '4px',
        backgroundColor: '#cbd5e1',
        borderRadius: '2px',
        margin: '0 auto 10px'
      }} />

      {/* Top Row: Thumbnail + Info + Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        {/* Canopy Thumbnail Photo */}
        <div style={{
          width: '78px',
          height: '68px',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#064e3b',
          flexShrink: 0,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)'
        }}>
          <img
            src={canopyImg}
            alt={station.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Station Title & Location Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {station.name}
            </h3>
            <CheckCircle2 size={16} color="#10b981" fill="#ecfdf5" style={{ flexShrink: 0 }} />
          </div>

          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '2px 0 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <MapPin size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
            <span>{station.address || `${station.name}, Bangalore`}</span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
              4.6
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              (238 reviews)
            </span>
          </div>
        </div>

        {/* Top-Right: Favourite Button & Distance Pill */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '6px',
          flexShrink: 0
        }}>
          {/* Favourite Button */}
          <button
            onClick={() => onToggleFavourite(station.id)}
            title={isFavourite ? "Remove from Favourites" : "Add to Favourites"}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Heart
              size={18}
              color={isFavourite ? "#ef4444" : "#64748b"}
              fill={isFavourite ? "#ef4444" : "none"}
            />
          </button>

          {/* Distance Pill */}
          <div style={{
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            padding: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11.5px',
            fontWeight: 700,
            color: '#334155'
          }}>
            <Navigation size={11} color="#059669" />
            <span>{distance} km</span>
          </div>
        </div>
      </div>

      {/* Middle Row: 4 Spec Badges (DC, AC, Tariff, Availability) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        margin: '10px 0 12px'
      }}>
        {/* 1. DC Speed */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: '12px',
          padding: '6px 2px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <Zap size={13} color="#059669" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b' }}>DC</span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
            ({maxDcPower} kW)
          </div>
        </div>

        {/* 2. AC Speed */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: '12px',
          padding: '6px 2px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <Zap size={13} color="#059669" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b' }}>AC</span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
            ({maxAcPower} kW)
          </div>
        </div>

        {/* 3. Tariff */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: '12px',
          padding: '6px 2px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <Tag size={12} color="#059669" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1e293b' }}>₹ {Number(tariff).toFixed(2)}</span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
            per kWh
          </div>
        </div>

        {/* 4. Availability */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '6px 2px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <CheckCircle2 size={13} color="#059669" />
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#047857' }}>
              {availableCount}/{totalCount}
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: '#059669', marginTop: '2px', fontWeight: 700 }}>
            Available
          </div>
        </div>
      </div>

      {/* Bottom Row: View Details & Start Charging Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => onViewDetails(station)}
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #059669',
            color: '#059669',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          View Details
        </button>

        <button
          onClick={() => onStartCharge(station)}
          style={{
            flex: 1.2,
            height: '44px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Zap size={16} fill="#ffffff" stroke="#ffffff" />
          <span>Start Charging</span>
        </button>
      </div>
    </div>
  );
};

