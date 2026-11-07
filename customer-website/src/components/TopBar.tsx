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
      {/* Dark Emerald Green Organic Curved Wave Header */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '112px',
        overflow: 'hidden'
      }}>
        {/* SVG Curved Wave Background Matching Reference Image */}
        <svg
          viewBox="0 0 375 115"
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
            <linearGradient id="hcHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#022c22" />
              <stop offset="35%" stopColor="#064e3b" />
              <stop offset="70%" stopColor="#047857" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="hcGlowWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(5, 150, 105, 0.3)" />
              <stop offset="50%" stopColor="rgba(16, 185, 129, 0.45)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.6)" />
            </linearGradient>
          </defs>

          {/* Lower accent glow wave (creates organic dual-wave effect) */}
          <path
            d="M0,0 L375,0 L375,98 Q285,122 180,96 Q85,76 0,108 Z"
            fill="url(#hcGlowWave)"
          />

          {/* Main dark emerald wave */}
          <path
            d="M0,0 L375,0 L375,84 Q290,116 170,84 Q75,62 0,92 Z"
            fill="url(#hcHeaderGrad)"
          />
        </svg>

        {/* Content on top of wave */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '14px 18px 24px 18px',
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
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#022c22',
              border: '2px solid rgba(34, 197, 94, 0.6)',
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
              fontSize: '20px',
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
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
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
            <User size={22} color="#059669" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Floating White Search Bar */}
      <div style={{
        padding: '0 16px',
        marginTop: '-18px',
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
            height: '52px',
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'box-shadow 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.16)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)')}
        >
          {/* Left: Green Search Icon & Placeholder */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            overflow: 'hidden'
          }}>
            <Search size={20} color="#059669" strokeWidth={2.4} style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: '14.5px',
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
            <SlidersHorizontal size={20} color="#059669" strokeWidth={2.2} />
          </div>
        </button>
      </div>
    </div>
  );
};
