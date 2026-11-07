import React, { useState } from 'react';
import {
  Wallet,
  History,
  Zap,
  Plug,
  Handshake,
  Bell,
  MessageSquare,
  Info,
  LogOut,
  ChevronRight,
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  Star,
  User,
  Heart
} from 'lucide-react';
import { UserProfile, ChargingSession } from '../types';

interface MoreModalProps {
  profile: UserProfile | null;
  walletBalance: number;
  favouritesCount?: number;
  sessionHistory: ChargingSession[];
  activeSession: ChargingSession | null;
  onOpenActiveSession: () => void;
  onOpenWallet: () => void;
  onOpenFavourites: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const MoreModal: React.FC<MoreModalProps> = ({
  profile,
  walletBalance,
  favouritesCount,
  sessionHistory,
  activeSession,
  onOpenActiveSession,
  onOpenWallet,
  onOpenFavourites,
  onOpenAuth,
  onLogout,
  onClose
}) => {
  // Sub-modal state for items
  const [activeSubModal, setActiveSubModal] = useState<
    'history' | 'rfid' | 'buy-charger' | 'partner' | 'notifications' | 'feedback' | 'help' | null
  >(null);

  // Form states for sub-modals
  const [autochargeEnabled, setAutochargeEnabled] = useState(true);
  const [rfidCardId, setRfidCardId] = useState('HC-RFID-9428-IND');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  // If authenticated as Admin, NEVER show the customer profile screen. Redirect to the real Admin Dashboard.
  if (profile && (profile.role === 'ROLE_ADMIN' || profile.email === 'admin@haltcharge.com')) {
    window.location.replace('/admin/');
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: '68px', /* Pinned cleanly above bottom navigation bar */
      zIndex: 25,
      backgroundColor: '#ffffff',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Container constrained to mobile/tablet width for clean native app look */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        minHeight: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 40px'
      }}>
        {/* Top Header with Close Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '8px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--hc-green-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}>
            Account & Profile
          </span>
          <button
            onClick={onClose}
            title="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Header: Shows User Profile IF SIGNED IN, or Sign In banner IF SIGNED OUT */}
        {profile ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 4px 20px'
              }}
            >
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--hc-text-primary)',
                  letterSpacing: '-0.3px',
                  fontFamily: 'inherit'
                }}>
                  {profile.fullName || 'User'}
                </h2>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--hc-text-muted)',
                  marginTop: '4px'
                }}>
                  {profile.phoneNumber || profile.email}
                </p>
              </div>

              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--hc-text-secondary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronRight size={18} strokeWidth={2.5} />
              </div>
            </div>

            {/* Divider Line */}
            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              width: '100%',
              marginBottom: '16px'
            }} />
          </>
        ) : (
          /* When SIGNED OUT: Show prominent Sign In / Register CTA Card */
          <>
            <div
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: '16px',
                backgroundColor: 'var(--hc-green-subtle)',
                border: '1.5px solid var(--hc-green-border)',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dcfce7')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--hc-green-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--hc-green-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--hc-shadow-sm)'
                }}>
                  <User size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--hc-green-darker)' }}>
                    Sign In / Register
                  </h3>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hc-green-dark)', marginTop: '2px' }}>
                    Tap to access EV wallet, vehicles & history
                  </p>
                </div>
              </div>
              <ChevronRight size={20} color="var(--hc-green-primary)" />
            </div>

            {/* Divider Line */}
            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              width: '100%',
              marginBottom: '16px'
            }} />
          </>
        )}

        {/* 2. Menu List Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {/* Favourites - Swapped from bottom navigation */}
          {profile && (
            <button
              onClick={onOpenFavourites}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <Heart size={20} color="#374151" strokeWidth={2.2} />
              </div>
              <span style={menuItemTextStyle}>Favourites</span>
              <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 800, color: 'var(--hc-green-primary)' }}>
                {favouritesCount ?? 0}
              </span>
            </button>
          )}

          {/* Charge History - Visible ONLY when signed in */}
          {profile && (
            <button
              onClick={() => setActiveSubModal('history')}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <History size={20} color="#374151" strokeWidth={2.2} />
              </div>
              <span style={menuItemTextStyle}>Charge History</span>
            </button>
          )}

          {/* RFIDs and Autocharge - Visible ONLY when signed in */}
          {profile && (
            <button
              onClick={() => setActiveSubModal('rfid')}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <CreditCard size={20} color="#374151" strokeWidth={2.2} />
              </div>
              <span style={menuItemTextStyle}>RFIDs and Autocharge</span>
            </button>
          )}

          {/* Buy Charger - ALWAYS visible (Public store) */}
          <button
            onClick={() => setActiveSubModal('buy-charger')}
            style={menuItemStyle}
            onMouseEnter={handleHover}
            onMouseLeave={handleUnhover}
          >
            <div style={iconContainerStyle}>
              <Plug size={20} color="#374151" strokeWidth={2.2} />
            </div>
            <span style={menuItemTextStyle}>Buy Charger</span>
          </button>

          {/* Partner With Us - ALWAYS visible (Public inquiry) */}
          <button
            onClick={() => setActiveSubModal('partner')}
            style={menuItemStyle}
            onMouseEnter={handleHover}
            onMouseLeave={handleUnhover}
          >
            <div style={iconContainerStyle}>
              <Handshake size={20} color="#374151" strokeWidth={2.2} />
            </div>
            <span style={menuItemTextStyle}>Partner With Us</span>
          </button>

          {/* Notification - Visible ONLY when signed in */}
          {profile && (
            <button
              onClick={() => setActiveSubModal('notifications')}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <Bell size={20} color="#374151" strokeWidth={2.2} />
              </div>
              <span style={menuItemTextStyle}>Notification</span>
            </button>
          )}

          {/* Feedback - ALWAYS visible (Public feedback) */}
          <button
            onClick={() => setActiveSubModal('feedback')}
            style={menuItemStyle}
            onMouseEnter={handleHover}
            onMouseLeave={handleUnhover}
          >
            <div style={iconContainerStyle}>
              <MessageSquare size={20} color="#374151" strokeWidth={2.2} />
            </div>
            <span style={menuItemTextStyle}>Feedback</span>
          </button>

          {/* Help - ALWAYS visible (Public 24/7 hotline & FAQ) */}
          <button
            onClick={() => setActiveSubModal('help')}
            style={menuItemStyle}
            onMouseEnter={handleHover}
            onMouseLeave={handleUnhover}
          >
            <div style={iconContainerStyle}>
              <Info size={20} color="#374151" strokeWidth={2.2} />
            </div>
            <span style={menuItemTextStyle}>Help</span>
          </button>

          {/* Sign In / Register (when signed out) OR Logout (when signed in) */}
          {profile ? (
            <button
              onClick={onLogout}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <LogOut size={20} color="#ef4444" strokeWidth={2.2} />
              </div>
              <span style={{ ...menuItemTextStyle, color: '#ef4444' }}>Logout</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              style={menuItemStyle}
              onMouseEnter={handleHover}
              onMouseLeave={handleUnhover}
            >
              <div style={iconContainerStyle}>
                <LogOut size={20} color="var(--hc-green-primary)" strokeWidth={2.2} />
              </div>
              <span style={{ ...menuItemTextStyle, color: 'var(--hc-green-primary)', fontWeight: 700 }}>
                Sign In / Register
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== SUB-MODALS ==================== */}

      {/* 1. Charge History Modal */}
      {activeSubModal === 'history' && (
        <SubModalContainer title="Charge History" onClose={() => setActiveSubModal(null)}>
          {sessionHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--hc-text-muted)' }}>
              <History size={40} color="var(--hc-border-dark)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '15px' }}>No charging history found</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Your completed charging sessions will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessionHistory.map(ses => (
                <div
                  key={ses.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--hc-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                      {ses.stationName || ses.chargerIdentifier}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                      {new Date(ses.startedAt).toLocaleDateString()} • {ses.energyKwh?.toFixed(1)} kWh delivered
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-green-primary)' }}>
                      ₹{ses.estimatedCost?.toFixed(2)}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }}>
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SubModalContainer>
      )}

      {/* 2. RFIDs and Autocharge Modal */}
      {activeSubModal === 'rfid' && (
        <SubModalContainer title="RFIDs and Autocharge" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Autocharge Toggle */}
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--hc-border)',
              backgroundColor: 'var(--hc-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                  Halt & Charge Autocharge
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                  Plug in your EV to begin charging automatically without opening the app.
                </p>
              </div>

              <input
                type="checkbox"
                checked={autochargeEnabled}
                onChange={e => setAutochargeEnabled(e.target.checked)}
                style={{
                  width: '22px',
                  height: '22px',
                  accentColor: 'var(--hc-green-primary)',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Linked RFID Cards */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Active RFID Cards
              </h4>
              <div style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid var(--hc-border)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={20} color="var(--hc-green-primary)" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                      {rfidCardId}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--hc-green-dark)', fontWeight: 700 }}>
                      ACTIVE • LINKED TO WALLET
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => alert('RFID Card settings updated.')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--hc-surface-subtle)',
                    border: '1px solid var(--hc-border)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </SubModalContainer>
      )}

      {/* 3. Buy Charger Modal */}
      {activeSubModal === 'buy-charger' && (
        <SubModalContainer title="Buy Halt & Charge Hardware" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              border: '1px solid var(--hc-border)',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: '#ffffff'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--hc-green-subtle)',
                color: 'var(--hc-green-dark)'
              }}>
                HOME CHARGER
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '8px' }}>
                Halt & Charge AC Smart Wallbox (7.4 kW)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px' }}>
                Weatherproof IP65, RFID authentication, Wi-Fi smart app controls, and scheduled off-peak charging.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--hc-text-primary)' }}>
                  ₹38,500 <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--hc-text-muted)' }}>+ GST</span>
                </span>
                <button
                  onClick={() => alert('Order request placed! Our team will contact you.')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--hc-green-primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Request Quote
                </button>
              </div>
            </div>

            <div style={{
              border: '1px solid var(--hc-border)',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: '#ffffff'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#dbeafe',
                color: '#1e40af'
              }}>
                COMMERCIAL FAST DC
              </span>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '8px' }}>
                Halt & Charge Dual-Gun DC Fast Charger (60 kW / 120 kW)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px' }}>
                OCPP 1.6J / 2.0.1 compliant, dual CCS2 connectors, cloud billing integration, and high reliability.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--hc-text-primary)' }}>
                  Commercial Pricing
                </span>
                <button
                  onClick={() => alert('Commercial catalog requested! Our solutions team will contact you.')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--hc-text-primary)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </SubModalContainer>
      )}

      {/* 4. Partner With Us Modal */}
      {activeSubModal === 'partner' && (
        <SubModalContainer title="Partner With Us" onClose={() => setActiveSubModal(null)}>
          {partnerSubmitted ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <CheckCircle2 size={44} color="var(--hc-green-primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '17px', fontWeight: 800 }}>Partnership Inquiry Submitted!</h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px' }}>
                Our business development team will review your location details and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)' }}>
                Host a Halt & Charge station on your highway property, hotel, mall, or tech park. Earn monthly recurring revenue.
              </p>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Property Type</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--hc-border)', marginTop: '4px' }}>
                  <option>Highway Restaurant / Dhaba</option>
                  <option>Shopping Mall / Retail Center</option>
                  <option>Hotel / Resort</option>
                  <option>Commercial Office / Tech Park</option>
                  <option>Independent Land / Petrol Pump</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Location / City</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai-Bengaluru Highway, Sriperumbudur"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--hc-border)', marginTop: '4px' }}
                />
              </div>

              <button
                onClick={() => setPartnerSubmitted(true)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--hc-green-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Submit Partnership Inquiry
              </button>
            </div>
          )}
        </SubModalContainer>
      )}

      {/* 5. Notifications Modal */}
      {activeSubModal === 'notifications' && (
        <SubModalContainer title="Notification Preferences" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { title: 'Charging Complete Alert', desc: 'Get notified when your EV reaches target charge level' },
              { title: 'Low Wallet Balance', desc: 'Alert when wallet balance drops below ₹150' },
              { title: 'Charger Availability Updates', desc: 'Notify when saved favourite station plugs become free' },
              { title: 'Special Discounts & Offers', desc: 'Discounted tariffs on off-peak hours and holidays' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--hc-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{item.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked={idx < 3} style={{ accentColor: 'var(--hc-green-primary)', width: '20px', height: '20px' }} />
              </div>
            ))}
          </div>
        </SubModalContainer>
      )}

      {/* 6. Feedback Modal */}
      {activeSubModal === 'feedback' && (
        <SubModalContainer title="Customer Feedback" onClose={() => setActiveSubModal(null)}>
          {feedbackSubmitted ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <CheckCircle2 size={44} color="var(--hc-green-primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '17px', fontWeight: 800 }}>Thank you for your feedback!</h4>
              <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '4px' }}>
                Your insights help us continuously elevate the Halt & Charge charging network.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Rate your charging experience:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Star
                        size={28}
                        color={star <= feedbackRating ? '#f59e0b' : '#cbd5e1'}
                        fill={star <= feedbackRating ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Comments / Suggestions:
                </label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--hc-border)',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={() => setFeedbackSubmitted(true)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--hc-green-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Send Feedback
              </button>
            </div>
          )}
        </SubModalContainer>
      )}

      {/* 7. Help & Support Modal */}
      {activeSubModal === 'help' && (
        <SubModalContainer title="Help & 24/7 Support" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'var(--hc-green-subtle)',
              border: '1px solid var(--hc-green-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hc-green-dark)' }}>
                <Phone size={18} />
                <span style={{ fontSize: '14px', fontWeight: 800 }}>24/7 Charging Emergency Hotline</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--hc-green-darker)', marginTop: '4px' }}>
                1800-425-8274 (Toll-Free)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--hc-green-dark)', marginTop: '2px' }}>
                Immediate assistance for station access, payment queries, or stalled sessions.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid var(--hc-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="var(--hc-text-muted)" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Email Customer Support</h4>
                  <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>support@haltcharge.com</p>
                </div>
              </div>
              <a
                href="mailto:support@haltcharge.com"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--hc-surface-subtle)',
                  color: 'var(--hc-text-primary)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                Write
              </a>
            </div>
          </div>
        </SubModalContainer>
      )}
    </div>
  );
};

// Reusable Sub-Modal Container
const SubModalContainer: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children
}) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  }}>
    <div
      className="animate-slide-up"
      style={{
        width: '100%',
        maxWidth: '540px',
        maxHeight: '80vh',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: 'var(--hc-shadow-float)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--hc-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--hc-surface-subtle)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--hc-text-muted)'
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {children}
      </div>
    </div>
  </div>
);

// Menu Item Styles matching reference layout
const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '14px 8px',
  background: 'none',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '12px',
  width: '100%',
  textAlign: 'left',
  transition: 'background-color 0.15s ease'
};

const iconContainerStyle: React.CSSProperties = {
  width: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start'
};

const menuItemTextStyle: React.CSSProperties = {
  fontSize: '15.5px',
  fontWeight: 600,
  color: '#262626',
  letterSpacing: '-0.2px'
};

const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = '#f8fafc';
};

const handleUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = 'transparent';
};
