import React from 'react';
import { Search, SlidersHorizontal, User, Wallet, MapPin, Zap, Car, Star } from 'lucide-react';
import logoImg from '../assets/logo.png';

export type FilterCategory = 'all' | 'fast' | 'available' | 'favourites';

interface TopBarProps {
  walletBalance: number;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenFilter?: () => void;
  activeFiltersCount?: number;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  walletBalance,
  onOpenSearch,
  onOpenProfile,
  onOpenWallet,
  onOpenFilter,
  activeFiltersCount = 0,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      pointerEvents: 'none'
    }}>
      {/* Dark Emerald Green Gradient Header with Curved Ambient Wave */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '16px',
        overflow: 'hidden'
      }}>
        {/* SVG Curved Gradient Backdrop */}
        <svg
          viewBox="0 0 375 145"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        >
          <defs>
            <linearGradient id="hcHeaderDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="40%" stopColor="#064e3b" />
              <stop offset="75%" stopColor="#047857" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="hcHeaderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(5, 150, 105, 0.2)" />
              <stop offset="60%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.55)" />
            </linearGradient>
          </defs>

          {/* Lower accent glow wave */}
          <path
            d="M0,0 L375,0 L375,130 Q280,150 180,128 Q80,105 0,135 Z"
            fill="url(#hcHeaderGlow)"
          />

          {/* Main dark emerald wave */}
          <path
            d="M0,0 L375,0 L375,116 Q285,142 170,116 Q75,90 0,120 Z"
            fill="url(#hcHeaderDarkGrad)"
          />
        </svg>

        {/* Content Layer */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '12px 14px 4px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Row 1: Brand (Left) + Wallet Pill + Profile Icon (Right) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            {/* Brand Logo & Name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#022c22',
                border: '1.5px solid rgba(34, 197, 94, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
                flexShrink: 0
              }}>
                <img
                  src={logoImg}
                  alt="Halt & Charge Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                fontFamily: 'inherit',
                lineHeight: 1.1
              }}>
                <span style={{ color: '#ffffff' }}>Halt &amp; </span>
                <span style={{ color: '#22c55e' }}>Charge</span>
              </div>
            </div>

            {/* Right: Wallet Balance Pill + Profile Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Wallet Pill */}
              <button
                onClick={onOpenWallet}
                title="View Wallet & Top Up"
                style={{
                  height: '34px',
                  backgroundColor: 'rgba(6, 78, 59, 0.75)',
                  border: '1px solid rgba(52, 211, 153, 0.4)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '18px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Wallet size={14} color="#ffffff" strokeWidth={2.2} />
                <span style={{ fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.2px' }}>
                  ₹ {Number(walletBalance || 0).toFixed(2)}
                </span>
              </button>

              {/* Circular Profile Button */}
              <button
                onClick={onOpenProfile}
                title="Profile & Account"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0,
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <User size={19} color="#059669" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar + Filter Button (Matches Reference) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            marginTop: '2px'
          }}>
            {/* Search Pill */}
            <button
              onClick={onOpenSearch}
              title="Search for station, location or charger"
              style={{
                flex: 1,
                height: '46px',
                backgroundColor: '#ffffff',
                borderRadius: '9999px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '10px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'box-shadow 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.16)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)')}
            >
              <Search size={18} color="#059669" strokeWidth={2.4} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#475569',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '-0.1px'
              }}>
                Search for station, location or charger...
              </span>
            </button>

            {/* Filter Sliders Button with Notification Dot */}
            <button
              onClick={onOpenFilter || onOpenSearch}
              title="Filter Chargers"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                outline: 'none',
                position: 'relative',
                flexShrink: 0,
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <SlidersHorizontal size={19} color="#059669" strokeWidth={2.2} />
              {/* Red Notification Dot / Active Filter Count Badge */}
              <div style={{
                position: 'absolute',
                top: activeFiltersCount > 0 ? '6px' : '9px',
                right: activeFiltersCount > 0 ? '6px' : '9px',
                minWidth: activeFiltersCount > 0 ? '16px' : '7px',
                height: activeFiltersCount > 0 ? '16px' : '7px',
                borderRadius: activeFiltersCount > 0 ? '8px' : '50%',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ffffff',
                padding: activeFiltersCount > 0 ? '0 3px' : '0'
              }}>
                {activeFiltersCount > 0 ? activeFiltersCount : null}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Horizontal Filter Chips (Matches Reference Image) */}
      <div style={{
        padding: '0 12px',
        marginTop: '-12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        pointerEvents: 'auto',
        position: 'relative',
        zIndex: 5
      }}>
        {/* 1. All Chargers */}
        <button
          onClick={() => onFilterChange('all')}
          style={{
            height: '34px',
            borderRadius: '20px',
            padding: '0 14px',
            border: activeFilter === 'all' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #e2e8f0',
            background: activeFilter === 'all'
              ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
              : '#ffffff',
            color: activeFilter === 'all' ? '#ffffff' : '#1e293b',
            boxShadow: activeFilter === 'all'
              ? '0 4px 12px rgba(6, 78, 59, 0.35)'
              : '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <MapPin size={13} color={activeFilter === 'all' ? '#34d399' : '#059669'} strokeWidth={2.4} />
          <span>All Chargers</span>
        </button>

        {/* 2. Fast Charger */}
        <button
          onClick={() => onFilterChange('fast')}
          style={{
            height: '34px',
            borderRadius: '20px',
            padding: '0 14px',
            border: activeFilter === 'fast' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #e2e8f0',
            background: activeFilter === 'fast'
              ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
              : '#ffffff',
            color: activeFilter === 'fast' ? '#ffffff' : '#1e293b',
            boxShadow: activeFilter === 'fast'
              ? '0 4px 12px rgba(6, 78, 59, 0.35)'
              : '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Zap size={13} color={activeFilter === 'fast' ? '#34d399' : '#059669'} strokeWidth={2.4} />
          <span>Fast Charger</span>
        </button>

        {/* 3. Available */}
        <button
          onClick={() => onFilterChange('available')}
          style={{
            height: '34px',
            borderRadius: '20px',
            padding: '0 14px',
            border: activeFilter === 'available' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #e2e8f0',
            background: activeFilter === 'available'
              ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
              : '#ffffff',
            color: activeFilter === 'available' ? '#ffffff' : '#1e293b',
            boxShadow: activeFilter === 'available'
              ? '0 4px 12px rgba(6, 78, 59, 0.35)'
              : '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Car size={13} color={activeFilter === 'available' ? '#34d399' : '#059669'} strokeWidth={2.4} />
          <span>Available</span>
        </button>

        {/* 4. Favourites */}
        <button
          onClick={() => onFilterChange('favourites')}
          style={{
            height: '34px',
            borderRadius: '20px',
            padding: '0 14px',
            border: activeFilter === 'favourites' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid #e2e8f0',
            background: activeFilter === 'favourites'
              ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
              : '#ffffff',
            color: activeFilter === 'favourites' ? '#ffffff' : '#1e293b',
            boxShadow: activeFilter === 'favourites'
              ? '0 4px 12px rgba(6, 78, 59, 0.35)'
              : '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <Star size={13} color={activeFilter === 'favourites' ? '#34d399' : '#059669'} fill={activeFilter === 'favourites' ? '#34d399' : '#059669'} />
          <span>Favourites</span>
        </button>
      </div>
    </div>
  );
};
