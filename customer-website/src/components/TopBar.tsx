import React from 'react';
import { Search, MapPin, AlertCircle, Wallet } from 'lucide-react';

interface TopBarProps {
  walletBalance: number;
  onOpenSearch: () => void;
  onOpenTripPlanner: () => void;
  onOpenWallet: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  walletBalance,
  onOpenSearch,
  onOpenTripPlanner,
  onOpenWallet
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      pointerEvents: 'none' /* Children have pointerEvents: auto */
    }}>
      {/* Search & Plan a Trip Pill (matches reference design) */}
      <div style={{
        flex: 1,
        maxWidth: '480px',
        height: '48px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: 'var(--hc-shadow-float)',
        display: 'flex',
        alignItems: 'center',
        padding: '3px 6px',
        border: '1px solid var(--hc-border)',
        pointerEvents: 'auto'
      }}>
        {/* Search Option */}
        <button
          onClick={onOpenSearch}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--hc-text-primary)',
            padding: '0 12px',
            borderRadius: '20px',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hc-surface-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Search size={18} color="var(--hc-green-primary)" strokeWidth={2.2} />
          <span>Search</span>
        </button>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--hc-border)' }} />

        {/* Plan a Trip Option */}
        <button
          onClick={onOpenTripPlanner}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--hc-text-primary)',
            padding: '0 12px',
            borderRadius: '20px',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--hc-surface-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <MapPin size={18} color="var(--hc-green-primary)" strokeWidth={2.2} />
          <span>Plan a trip</span>
        </button>
      </div>

      {/* Floating Wallet Balance (top right) */}
      <button
        onClick={onOpenWallet}
        title="View Wallet Balance & Top Up"
        style={{
          height: '42px',
          backgroundColor: '#334155', /* High-contrast slate pill like reference */
          color: '#ffffff',
          borderRadius: '21px',
          padding: '0 14px 0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--hc-shadow-float)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          position: 'relative',
          transition: 'transform 0.15s ease, background-color 0.15s ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ecfdf5' }}>₹</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2px' }}>
          {Number(walletBalance || 0).toFixed(2)}
        </span>

        {/* Low balance alert icon badge */}
        {(walletBalance || 0) <= 0 && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'var(--hc-status-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff'
          }}>
            <AlertCircle size={10} color="#ffffff" strokeWidth={3} />
          </div>
        )}
      </button>
    </div>
  );
};

