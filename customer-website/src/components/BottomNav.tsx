import React from 'react';
import { Map, Car, Heart, Menu, Zap } from 'lucide-react';

export type NavTab = 'map' | 'evs' | 'scan' | 'favourites' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isSessionActive: boolean;
  onOpenActiveSession: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  isSessionActive,
  onOpenActiveSession
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none'
    }}>
      {/* Active Session Notification Pill (if charging in progress) */}
      {isSessionActive && (
        <div style={{
          marginBottom: '10px',
          pointerEvents: 'auto',
          animation: 'bounce 2s infinite'
        }}>
          <button
            onClick={onOpenActiveSession}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: '24px',
              padding: '8px 18px',
              boxShadow: 'var(--hc-shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#34d399',
              boxShadow: '0 0 8px #34d399'
            }} />
            <Zap size={16} fill="#ffffff" />
            <span>Active Charging Session in Progress</span>
          </button>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav style={{
        width: '100%',
        maxWidth: '540px',
        height: '68px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--hc-border)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        pointerEvents: 'auto',
        position: 'relative'
      }}>
        {/* 1. Map */}
        <button
          onClick={() => onTabChange('map')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'map' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
            transition: 'color 0.15s ease'
          }}
        >
          <Map size={22} strokeWidth={activeTab === 'map' ? 2.5 : 2} />
          <span style={{ fontSize: '11px', fontWeight: activeTab === 'map' ? 700 : 500 }}>Map</span>
        </button>

        {/* 2. My EVs */}
        <button
          onClick={() => onTabChange('evs')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'evs' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
            transition: 'color 0.15s ease'
          }}
        >
          <Car size={22} strokeWidth={activeTab === 'evs' ? 2.5 : 2} />
          <span style={{ fontSize: '11px', fontWeight: activeTab === 'evs' ? 700 : 500 }}>My EVs</span>
        </button>

        {/* 3. Center Elevated Action Button: Scan */}
        <div style={{
          position: 'relative',
          top: '-18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1
        }}>
          <button
            onClick={() => onTabChange('scan')}
            title="Scan QR to Start Charging"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: '4px solid #ffffff',
              boxShadow: 'var(--hc-shadow-fab)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Zap size={28} fill="#ffffff" stroke="#ffffff" strokeWidth={1.5} />
          </button>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: activeTab === 'scan' ? 'var(--hc-green-primary)' : 'var(--hc-text-secondary)',
            marginTop: '3px'
          }}>
            Scan
          </span>
        </div>

        {/* 4. Favourites */}
        <button
          onClick={() => onTabChange('favourites')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'favourites' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
            transition: 'color 0.15s ease'
          }}
        >
          <Heart size={22} strokeWidth={activeTab === 'favourites' ? 2.5 : 2} />
          <span style={{ fontSize: '11px', fontWeight: activeTab === 'favourites' ? 700 : 500 }}>Favourites</span>
        </button>

        {/* 5. More */}
        <button
          onClick={() => onTabChange('more')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            color: activeTab === 'more' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
            transition: 'color 0.15s ease'
          }}
        >
          <Menu size={22} strokeWidth={activeTab === 'more' ? 2.5 : 2} />
          <span style={{ fontSize: '11px', fontWeight: activeTab === 'more' ? 700 : 500 }}>More</span>
        </button>
      </nav>
    </div>
  );
};
