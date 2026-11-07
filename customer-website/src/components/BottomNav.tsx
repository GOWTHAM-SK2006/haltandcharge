import React from 'react';
import { Map, Car, Wallet, Route, Zap } from 'lucide-react';

export type NavTab = 'map' | 'evs' | 'scan' | 'wallet' | 'trip';

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

      {/* Main Bottom Bar - Matches Reference Image */}
      <nav style={{
        width: '100%',
        maxWidth: '540px',
        height: '74px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #f1f5f9',
        boxShadow: '0 -4px 25px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px 6px',
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
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
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <div style={{
            backgroundColor: activeTab === 'map' ? '#ecfdf5' : 'transparent',
            borderRadius: '16px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease'
          }}>
            <Map size={24} color={activeTab === 'map' ? '#059669' : '#334155'} strokeWidth={activeTab === 'map' ? 2.5 : 2} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: activeTab === 'map' ? 700 : 500,
            color: activeTab === 'map' ? '#059669' : '#334155',
            marginTop: '2px',
            letterSpacing: '0.1px'
          }}>
            Map
          </span>
        </button>

        {/* 2. My EVs */}
        <button
          onClick={() => onTabChange('evs')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <div style={{
            backgroundColor: activeTab === 'evs' ? '#ecfdf5' : 'transparent',
            borderRadius: '16px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease'
          }}>
            <Car size={24} color={activeTab === 'evs' ? '#059669' : '#334155'} strokeWidth={activeTab === 'evs' ? 2.5 : 2} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: activeTab === 'evs' ? 700 : 500,
            color: activeTab === 'evs' ? '#059669' : '#334155',
            marginTop: '2px',
            letterSpacing: '0.1px'
          }}>
            My EVs
          </span>
        </button>

        {/* 3. Center Elevated Action Button: Scan */}
        <div style={{
          position: 'relative',
          top: '-16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1
        }}>
          <button
            onClick={() => onTabChange('scan')}
            title="Scan QR to Start Charging"
            className="hc-scan-fab-glow"
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 60%, #047857 100%)',
              border: '4px solid #ffffff',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              outline: 'none',
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
            color: activeTab === 'scan' ? '#059669' : '#1e293b',
            marginTop: '3px'
          }}>
            Scan
          </span>
        </div>

        {/* 4. Wallet */}
        <button
          onClick={() => onTabChange('wallet')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <div style={{
            backgroundColor: activeTab === 'wallet' ? '#ecfdf5' : 'transparent',
            borderRadius: '16px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease'
          }}>
            <Wallet size={24} color={activeTab === 'wallet' ? '#059669' : '#334155'} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: activeTab === 'wallet' ? 700 : 500,
            color: activeTab === 'wallet' ? '#059669' : '#334155',
            marginTop: '2px',
            letterSpacing: '0.1px'
          }}>
            Wallet
          </span>
        </button>

        {/* 5. Trip */}
        <button
          onClick={() => onTabChange('trip')}
          style={{
            flex: 1,
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 0'
          }}
        >
          <div style={{
            backgroundColor: activeTab === 'trip' ? '#ecfdf5' : 'transparent',
            borderRadius: '16px',
            padding: '4px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s ease'
          }}>
            <Route size={24} color={activeTab === 'trip' ? '#059669' : '#334155'} strokeWidth={activeTab === 'trip' ? 2.5 : 2} />
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: activeTab === 'trip' ? 700 : 500,
            color: activeTab === 'trip' ? '#059669' : '#334155',
            marginTop: '2px',
            letterSpacing: '0.1px'
          }}>
            Trip
          </span>
        </button>
      </nav>
    </div>
  );
};
