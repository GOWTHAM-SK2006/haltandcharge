import React from 'react';
import { Search, User } from 'lucide-react';

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
      top: '16px',
      left: '16px',
      right: '16px',
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {/* Search Pill - Matches reference design */}
      <button
        onClick={onOpenSearch}
        title="Search charging stations"
        style={{
          flex: 1,
          maxWidth: '480px',
          height: '50px',
          backgroundColor: '#ffffff',
          borderRadius: '9999px',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '12px',
          cursor: 'pointer',
          outline: 'none',
          pointerEvents: 'auto',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
      >
        <Search size={22} color="#059669" strokeWidth={2.4} />
        <span style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1e293b',
          letterSpacing: '-0.2px'
        }}>
          Search
        </span>
      </button>

      {/* Circular Profile Button - Matches reference design */}
      <button
        onClick={onOpenProfile}
        title="Account & Profile"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '2px solid #059669',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          outline: 'none',
          pointerEvents: 'auto',
          flexShrink: 0,
          transition: 'transform 0.15s ease, background-color 0.15s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = '#ecfdf5';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <User size={24} color="#059669" strokeWidth={2.2} />
      </button>
    </div>
  );
};
