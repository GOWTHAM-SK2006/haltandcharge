import React from 'react';
import { Search, SlidersHorizontal, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenProfile
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
      {/* Compact Dark Emerald Green Curved Wave Header */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '74px',
        overflow: 'hidden'
      }}>
        {/* Sleek SVG Curved Wave Background */}
        <svg
          viewBox="0 0 375 74"
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
            <linearGradient id="hcHeaderGradCompact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="35%" stopColor="#064e3b" />
              <stop offset="70%" stopColor="#047857" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="hcGlowWaveCompact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(5, 150, 105, 0.25)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.4)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.55)" />
            </linearGradient>
          </defs>

          {/* Lower accent glow wave */}
          <path
            d="M0,0 L375,0 L375,64 Q285,78 180,62 Q85,48 0,68 Z"
            fill="url(#hcGlowWaveCompact)"
          />

          {/* Main dark emerald wave */}
          <path
            d="M0,0 L375,0 L375,54 Q290,72 170,54 Q75,40 0,58 Z"
            fill="url(#hcHeaderGradCompact)"
          />
        </svg>

        {/* Content on top of wave */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '8px 16px 14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          pointerEvents: 'auto'
        }}>
          {/* Brand Logo & Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#022c22',
              border: '1.5px solid rgba(34, 197, 94, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
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
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              flexShrink: 0,
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <User size={19} color="#059669" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Floating White Search Bar - Shifted Higher Up */}
      <div style={{
        padding: '0 14px',
        marginTop: '-12px',
        position: 'relative',
        zIndex: 5,
        pointerEvents: 'auto'
      }}>
        <button
          onClick={onOpenSearch}
          title="Search for station, location or charger"
          style={{
            width: '100%',
            maxWidth: '560px',
            margin: '0 auto',
            height: '46px',
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'box-shadow 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.16)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)')}
        >
          {/* Left: Green Search Icon & Placeholder */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flex: 1,
            overflow: 'hidden'
          }}>
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
          </div>

          {/* Right: Green Filter Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px',
            flexShrink: 0
          }}>
            <SlidersHorizontal size={18} color="#059669" strokeWidth={2.2} />
          </div>
        </button>
      </div>
    </div>
  );
};
