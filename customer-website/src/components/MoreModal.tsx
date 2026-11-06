import React from 'react';
import { X, User, Wallet, History, ExternalLink, LogOut, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { UserProfile, ChargingSession } from '../types';

interface MoreModalProps {
  profile: UserProfile | null;
  walletBalance: number;
  sessionHistory: ChargingSession[];
  activeSession: ChargingSession | null;
  onOpenActiveSession: () => void;
  onOpenWallet: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onClose: () => void;
}

export const MoreModal: React.FC<MoreModalProps> = ({
  profile,
  walletBalance,
  sessionHistory,
  activeSession,
  onOpenActiveSession,
  onOpenWallet,
  onOpenAuth,
  onLogout,
  onClose
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
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
          maxWidth: '560px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: 'var(--hc-shadow-float)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hc-border)', position: 'relative' }}>
          <div style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: 'var(--hc-border-dark)',
            margin: '0 auto 12px'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Account & Services</h3>
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
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User Profile Card */}
          {profile ? (
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--hc-green-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800
              }}>
                {profile.fullName?.charAt(0) || 'U'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                    {profile.fullName}
                  </h4>
                  <ShieldCheck size={16} color="var(--hc-green-primary)" />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--hc-text-muted)', marginTop: '1px' }}>
                  {profile.email}
                </p>
                {profile.phoneNumber && (
                  <p style={{ fontSize: '12px', color: 'var(--hc-text-light)', marginTop: '2px' }}>
                    {profile.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: 'var(--hc-surface-subtle)',
              border: '1px solid var(--hc-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#e2e8f0',
                  color: 'var(--hc-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Guest User</h4>
                  <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Sign in to sync your vehicles and history</p>
                </div>
              </div>

              <button
                onClick={onOpenAuth}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--hc-green-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Wallet Balance Card */}
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--hc-shadow-md)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>
                <Wallet size={15} />
                Halt & Charge EV Wallet
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>
                ₹{Number(walletBalance || 0).toFixed(2)}
              </div>
            </div>

            <button
              onClick={onOpenWallet}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                color: 'var(--hc-green-dark)',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Top Up
            </button>
          </div>

          {/* Active Session Card (if any) */}
          {activeSession && (
            <div
              onClick={onOpenActiveSession}
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1.5px solid var(--hc-green-primary)',
                backgroundColor: 'var(--hc-green-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={22} color="var(--hc-green-primary)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--hc-green-darker)' }}>
                    Session In Progress
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hc-green-dark)' }}>
                    {activeSession.chargerIdentifier} • {activeSession.currentPowerKw?.toFixed(1) || '0'} kW
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="var(--hc-green-primary)" />
            </div>
          )}

          {/* Charging History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <History size={16} color="var(--hc-text-muted)" />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recent Charging Sessions
              </h4>
            </div>

            {sessionHistory.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--hc-text-muted)', fontSize: '13px' }}>
                No completed sessions found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessionHistory.slice(0, 5).map(ses => (
                  <div
                    key={ses.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--hc-border)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-primary)' }}>
                        {ses.stationName || ses.chargerIdentifier}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
                        {new Date(ses.startedAt).toLocaleDateString()} • {ses.energyKwh?.toFixed(1)} kWh delivered
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--hc-green-primary)' }}>
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
          </div>

          {/* Admin Dashboard Navigation */}
          <div style={{ borderTop: '1px solid var(--hc-border)', paddingTop: '16px' }}>
            <a
              href="/admin/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'var(--hc-surface-subtle)',
                color: 'var(--hc-text-primary)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <span>Switch to Admin Fleet Management</span>
              <ExternalLink size={16} color="var(--hc-text-muted)" />
            </a>
          </div>

          {/* Logout Button (if authenticated) */}
          {profile && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

