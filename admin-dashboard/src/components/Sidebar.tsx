import React from 'react';
import { 
  LayoutDashboard, MapPin, Zap, Sliders, Activity, 
  Users, Car, CalendarCheck, LifeBuoy, Percent, 
  CreditCard, Bell, BarChart3, ShieldCheck, Settings, 
  LogOut, Shield
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout
}) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'NETWORK FLEET',
      items: [
        { id: 'stations', label: 'Stations', icon: MapPin },
        { id: 'chargers', label: 'Chargers Fleet', icon: Zap },
        { id: 'simulator', label: 'Hardware Simulator', icon: Sliders, badge: 'Live' },
        { id: 'sessions', label: 'Charging Sessions', icon: Activity }
      ]
    },
    {
      title: 'CUSTOMER OPERATIONS',
      items: [
        { id: 'users', label: 'Registered Customers', icon: Users },
        { id: 'vehicles', label: 'Customer Vehicles', icon: Car },
        { id: 'bookings', label: 'Slot Bookings', icon: CalendarCheck },
        { id: 'support', label: 'Support & Helpdesk', icon: LifeBuoy }
      ]
    },
    {
      title: 'BILLING & COMMERCE',
      items: [
        { id: 'tariffs', label: 'Tariffs & Rates', icon: Percent },
        { id: 'transactions', label: 'Financial Ledger', icon: CreditCard }
      ]
    },
    {
      title: 'ENTERPRISE & SYSTEM',
      items: [
        { id: 'notifications', label: 'Broadcast Alerts', icon: Bell },
        { id: 'reports', label: 'Network Reports', icon: BarChart3 },
        { id: 'audit', label: 'Security & Audit', icon: ShieldCheck },
        { id: 'settings', label: 'Platform Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 20,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
          flexShrink: 0
        }}>
          <Zap size={22} strokeWidth={2.5} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.4px', color: '#0f172a', whiteSpace: 'nowrap' }}>
            HALT <span style={{ color: '#059669' }}>&</span> CHARGE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
            <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              COMMAND CENTER
            </span>
          </div>
        </div>
      </div>

      {/* Nav Groups Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {navSections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.8px',
              padding: '0 12px 6px',
              textTransform: 'uppercase'
            }}>
              {sec.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sec.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: active ? '#ecfdf5' : 'transparent',
                      color: active ? '#059669' : '#475569',
                      border: active ? '1px solid #a7f3d0' : '1px solid transparent',
                      fontWeight: active ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.5 : 2} color={active ? '#059669' : '#64748b'} />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#10b981',
                        color: '#ffffff',
                        fontWeight: 700
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Profile Footer */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            border: '1px solid #a7f3d0',
            flexShrink: 0
          }}>
            <Shield size={16} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Enterprise Admin
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              admin@haltcharge.com
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px'
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
};
