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
      {/* Dark Emerald Green Gradient Header with Curved Bottom */}
      <div style={{
        background: 'linear-gradient(165deg, #022c22 0%, #064e3b 45%, #047857 85%, #059669 100%)',
        padding: '16px 18px 36px 18px',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 10px 30px rgba(2, 44, 34, 0.35)',
        position: 'relative'
      }}>
        {/* Top Row: Brand Logo + Name on Left, Profile Icon on Right */}
        <div style={{
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
            gap: '12px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#022c22',
              border: '2px solid rgba(16, 185, 129, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.45)',
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
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              fontFamily: 'inherit',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Halt & Charge
            </span>
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
              transition: 'transform 0.15s ease, background-color 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <User size={22} color="#059669" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Floating White Search Bar (Overlaps the bottom curve of the header) */}
      <div style={{
        padding: '0 16px',
        marginTop: '-24px',
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
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.18)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.14)')}
        >
          {/* Left: Green Search Icon & Placeholder */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1,
            overflow: 'hidden'
          }}>
            <Search size={20} color="#059669" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: '14.5px',
              fontWeight: 500,
              color: '#64748b',
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
