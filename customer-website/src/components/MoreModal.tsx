import React, { useState } from 'react';
import {
  User,
  Car,
  Heart,
  History,
  Navigation,
  Wallet,
  CreditCard,
  Bell,
  Sliders,
  ShieldCheck,
  Headphones,
  MessageSquare,
  Handshake,
  Info,
  LogOut,
  ChevronRight,
  X,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  Star,
  Zap,
  Lock,
  Smartphone,
  Check,
  ExternalLink,
  Shield
} from 'lucide-react';
import { UserProfile, ChargingSession, Vehicle } from '../types';

interface MoreModalProps {
  profile: UserProfile | null;
  walletBalance: number;
  favouritesCount?: number;
  sessionHistory: ChargingSession[];
  activeSession: ChargingSession | null;
  vehicles?: Vehicle[];
  onOpenVehicles?: () => void;
  onOpenTripPlanner?: () => void;
  onOpenActiveSession: () => void;
  onOpenWallet: () => void;
  onOpenFavourites: () => void;
  onOpenAuth: () => void;
  onUpdateProfile?: (data: { fullName: string; phoneNumber: string }) => Promise<void>;
  onLogout: () => void;
  onClose: () => void;
}

export const MoreModal: React.FC<MoreModalProps> = ({
  profile,
  walletBalance,
  favouritesCount = 0,
  sessionHistory,
  activeSession,
  vehicles = [],
  onOpenVehicles,
  onOpenTripPlanner,
  onOpenActiveSession,
  onOpenWallet,
  onOpenFavourites,
  onOpenAuth,
  onUpdateProfile,
  onLogout,
  onClose
}) => {
  // Active Sub-modal state
  const [activeSubModal, setActiveSubModal] = useState<
    | 'edit-profile'
    | 'history'
    | 'rfid'
    | 'notifications'
    | 'preferences'
    | 'security'
    | 'help'
    | 'feedback'
    | 'partner'
    | 'about'
    | null
  >(null);

  // Edit Profile Form state
  const [editFullName, setEditFullName] = useState(profile?.fullName || '');
  const [editPhoneNumber, setEditPhoneNumber] = useState(profile?.phoneNumber || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);

  // RFID & Autocharge state
  const [autochargeEnabled, setAutochargeEnabled] = useState(true);
  const [rfidCardId, setRfidCardId] = useState('HC-RFID-9428-IND');

  // App Preferences state
  const [mapStylePref, setMapStylePref] = useState<'standard' | 'satellite'>('standard');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [currencyDisplay, setCurrencyDisplay] = useState<'INR' | 'USD'>('INR');

  // Feedback Form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Charging Speed');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Partner With Us Form state
  const [partnerPropertyType, setPartnerPropertyType] = useState('Highway Dhaba / Restaurant');
  const [partnerLocation, setPartnerLocation] = useState('');
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  // Logout confirmation dialog
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect admin to official admin dashboard
  if (profile && (profile.role === 'ROLE_ADMIN' || profile.email === 'admin@haltcharge.com')) {
    window.location.replace('/admin/');
    return null;
  }

  // Handle Edit Profile submission
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateProfile) return;
    setIsUpdatingProfile(true);
    setProfileUpdateSuccess(false);
    try {
      await onUpdateProfile({
        fullName: editFullName.trim(),
        phoneNumber: editPhoneNumber.trim()
      });
      setProfileUpdateSuccess(true);
      setTimeout(() => {
        setProfileUpdateSuccess(false);
        setActiveSubModal(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Compute initials for circular avatar
  const getInitials = (name?: string, email?: string): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'EV';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: '68px', // Pinned cleanly above bottom navigation bar
      zIndex: 25,
      backgroundColor: '#f8fafc',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '40px'
      }}>

        {/* 1. PREMIUM EMERALD GREEN GRADIENT HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
          padding: '24px 20px 48px 20px',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px',
          boxShadow: '0 12px 30px rgba(6, 78, 59, 0.25)',
          color: '#ffffff',
          position: 'relative'
        }}>
          {/* Top Bar with Title & Close Button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#a7f3d0',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                Halt & Charge Account
              </span>
            </div>

            <button
              onClick={onClose}
              title="Close Profile"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Card Header */}
          {profile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Circular Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34d399, #059669)',
                border: '3px solid #ffffff',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#ffffff',
                flexShrink: 0
              }}>
                {getInitials(profile.fullName, profile.email)}
              </div>

              {/* Name & Contact */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {profile.fullName || 'Valued EV Driver'}
                </h2>
                <div style={{ fontSize: '13px', color: '#d1fae5', fontWeight: 600, marginTop: '2px' }}>
                  {profile.phoneNumber || 'Phone not set'}
                </div>
                <div style={{ fontSize: '12px', color: '#a7f3d0', opacity: 0.9, marginTop: '1px' }}>
                  {profile.email}
                </div>
              </div>

              {/* Edit Profile Action Button */}
              <button
                onClick={() => {
                  setEditFullName(profile.fullName || '');
                  setEditPhoneNumber(profile.phoneNumber || '');
                  setActiveSubModal('edit-profile');
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>
            </div>
          ) : (
            /* Sign In Prompt Banner if guest */
            <div
              onClick={onOpenAuth}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                    Sign In to Halt & Charge
                  </h3>
                  <p style={{ fontSize: '12px', color: '#d1fae5', marginTop: '2px' }}>
                    Access wallet, registered EVs and session records
                  </p>
                </div>
              </div>
              <ChevronRight size={20} color="#ffffff" />
            </div>
          )}
        </div>

        {/* 2. FLOATING ACCOUNT STATISTICS CARD */}
        <div style={{
          margin: '-30px 16px 20px 16px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          padding: '14px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* My EVs */}
          <div
            onClick={() => onOpenVehicles ? onOpenVehicles() : null}
            style={{ cursor: 'pointer', padding: '6px 2px' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px'
            }}>
              <Car size={18} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {vehicles.length}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '1px' }}>
              My EVs
            </div>
          </div>

          {/* Sessions */}
          <div
            onClick={() => setActiveSubModal('history')}
            style={{ cursor: 'pointer', padding: '6px 2px' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px'
            }}>
              <Zap size={18} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {sessionHistory.length}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '1px' }}>
              Sessions
            </div>
          </div>

          {/* Favourites */}
          <div
            onClick={onOpenFavourites}
            style={{ cursor: 'pointer', padding: '6px 2px' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px'
            }}>
              <Heart size={18} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
              {favouritesCount}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '1px' }}>
              Favourites
            </div>
          </div>

          {/* Wallet */}
          <div
            onClick={onOpenWallet}
            style={{ cursor: 'pointer', padding: '6px 2px' }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 6px'
            }}>
              <Wallet size={18} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
              ₹{Math.round(walletBalance)}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '1px' }}>
              Wallet
            </div>
          </div>
        </div>

        {/* 3. SECTION 1: ACCOUNT */}
        <div style={{ padding: '0 16px', marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
            paddingLeft: '4px'
          }}>
            Account
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}>
            {/* Personal Information */}
            <SectionRow
              icon={<User size={19} color="#059669" />}
              iconBg="#ecfdf5"
              title="Personal Information"
              subtitle="Name, phone number, email & profile"
              onClick={() => {
                if (!profile) {
                  onOpenAuth();
                  return;
                }
                setEditFullName(profile.fullName || '');
                setEditPhoneNumber(profile.phoneNumber || '');
                setActiveSubModal('edit-profile');
              }}
            />

            <Divider />

            {/* My Vehicles */}
            <SectionRow
              icon={<Car size={19} color="#2563eb" />}
              iconBg="#eff6ff"
              title="My Vehicles"
              subtitle={vehicles.length > 0 ? `${vehicles.length} vehicle(s) linked to your account` : 'Register your electric car'}
              badge={vehicles.length > 0 ? `${vehicles.length}` : undefined}
              onClick={() => {
                if (onOpenVehicles) {
                  onOpenVehicles();
                }
              }}
            />

            <Divider />

            {/* Favourites */}
            <SectionRow
              icon={<Heart size={19} color="#dc2626" />}
              iconBg="#fef2f2"
              title="Favourites"
              subtitle="Quick access to bookmarked charging hubs"
              badge={favouritesCount > 0 ? `${favouritesCount}` : undefined}
              onClick={onOpenFavourites}
            />

            <Divider />

            {/* Charging History */}
            <SectionRow
              icon={<History size={19} color="#0891b2" />}
              iconBg="#ecfeff"
              title="Charging History"
              subtitle="Past charging sessions, energy & receipts"
              badge={sessionHistory.length > 0 ? `${sessionHistory.length}` : undefined}
              onClick={() => setActiveSubModal('history')}
            />

            <Divider />

            {/* Saved Trips */}
            <SectionRow
              icon={<Navigation size={19} color="#7c3aed" />}
              iconBg="#f5f3ff"
              title="Saved Trips"
              subtitle="Planned smart EV routes & corridor charging halts"
              onClick={() => {
                if (onOpenTripPlanner) {
                  onOpenTripPlanner();
                }
              }}
            />
          </div>
        </div>

        {/* 4. SECTION 2: WALLET & SERVICES */}
        <div style={{ padding: '0 16px', marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
            paddingLeft: '4px'
          }}>
            Wallet & Services
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}>
            {/* Wallet & Transactions */}
            <SectionRow
              icon={<Wallet size={19} color="#059669" />}
              iconBg="#ecfdf5"
              title="Wallet & Transactions"
              subtitle={`Current Balance: ₹${walletBalance.toFixed(2)} • Top up via UPI`}
              badge={`₹${Math.round(walletBalance)}`}
              onClick={onOpenWallet}
            />

            <Divider />

            {/* RFID & AutoCharge */}
            <SectionRow
              icon={<CreditCard size={19} color="#d97706" />}
              iconBg="#fffbeb"
              title="RFID & AutoCharge"
              subtitle="Physical charging cards & instant plug-in charge"
              badge={autochargeEnabled ? 'Active' : 'Off'}
              onClick={() => setActiveSubModal('rfid')}
            />

            <Divider />

            {/* Notifications */}
            <SectionRow
              icon={<Bell size={19} color="#4f46e5" />}
              iconBg="#eef2ff"
              title="Notifications"
              subtitle="Charging session alerts & balance reminders"
              onClick={() => setActiveSubModal('notifications')}
            />

            <Divider />

            {/* App Preferences */}
            <SectionRow
              icon={<Sliders size={19} color="#475569" />}
              iconBg="#f1f5f9"
              title="App Preferences"
              subtitle="Map display layer, distance units & language"
              onClick={() => setActiveSubModal('preferences')}
            />

            <Divider />

            {/* Security Settings */}
            <SectionRow
              icon={<ShieldCheck size={19} color="#059669" />}
              iconBg="#ecfdf5"
              title="Security Settings"
              subtitle="JWT session tokens, password & privacy"
              onClick={() => setActiveSubModal('security')}
            />
          </div>
        </div>

        {/* 5. SECTION 3: SUPPORT */}
        <div style={{ padding: '0 16px', marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
            paddingLeft: '4px'
          }}>
            Support
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden'
          }}>
            {/* Help & Support */}
            <SectionRow
              icon={<Headphones size={19} color="#2563eb" />}
              iconBg="#eff6ff"
              title="Help & Support"
              subtitle="24/7 emergency toll-free hotline & assistance"
              onClick={() => setActiveSubModal('help')}
            />

            <Divider />

            {/* Feedback */}
            <SectionRow
              icon={<MessageSquare size={19} color="#059669" />}
              iconBg="#ecfdf5"
              title="Feedback"
              subtitle="Rate charging experience & suggest features"
              onClick={() => setActiveSubModal('feedback')}
            />

            <Divider />

            {/* Partner With Us */}
            <SectionRow
              icon={<Handshake size={19} color="#d97706" />}
              iconBg="#fffbeb"
              title="Partner With Us"
              subtitle="Host a Halt & Charge dispenser on your property"
              onClick={() => setActiveSubModal('partner')}
            />

            <Divider />

            {/* About Halt & Charge */}
            <SectionRow
              icon={<Info size={19} color="#475569" />}
              iconBg="#f1f5f9"
              title="About Halt & Charge"
              subtitle="Version 2.4.0 • Clean energy mobility platform"
              onClick={() => setActiveSubModal('about')}
            />
          </div>
        </div>

        {/* 6. LOGOUT BUTTON (Prominent at the bottom) */}
        <div style={{ padding: '0 16px' }}>
          {profile ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '16px',
                border: '1.5px solid #fecaca',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#f87171';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut size={18} strokeWidth={2.2} />
              <span>Log Out of Halt & Charge</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              <User size={18} />
              <span>Sign In to Account</span>
            </button>
          )}

          {/* Version tag */}
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: 600,
            marginTop: '16px'
          }}>
            Halt & Charge Customer Platform v2.4.0 • Secured by Supabase & JWT
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ==================== SUB-MODALS ======================== */}
      {/* ======================================================== */}

      {/* SUB-MODAL 1: EDIT PROFILE / PERSONAL INFORMATION */}
      {activeSubModal === 'edit-profile' && (
        <SubModalContainer title="Personal Information" onClose={() => setActiveSubModal(null)}>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {profileUpdateSuccess && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={editFullName}
                onChange={e => setEditFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={editPhoneNumber}
                onChange={e => setEditPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Email Address (Registered)
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'not-allowed'
                }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Primary email address cannot be changed directly. Contact support for assistance.
              </span>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}
            >
              <Check size={16} />
              <span>{isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </SubModalContainer>
      )}

      {/* SUB-MODAL 2: CHARGE HISTORY */}
      {activeSubModal === 'history' && (
        <SubModalContainer title="Charging History" onClose={() => setActiveSubModal(null)}>
          {sessionHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <History size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>No charging history found</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Completed charging sessions will appear here with energy consumed and invoice amounts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessionHistory.map(ses => (
                <div
                  key={ses.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {ses.stationName || ses.chargerIdentifier}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {new Date(ses.startedAt).toLocaleDateString()} • {ses.energyKwh?.toFixed(1)} kWh delivered
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669' }}>
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

      {/* SUB-MODAL 3: RFID & AUTOCHARGE */}
      {activeSubModal === 'rfid' && (
        <SubModalContainer title="RFID & AutoCharge" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              border: '1.5px solid #a7f3d0',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
                  AutoCharge Enabled
                </h4>
                <p style={{ fontSize: '12px', color: '#047857', marginTop: '2px' }}>
                  Plug in your EV gun to automatically initiate session without scanning.
                </p>
              </div>

              <input
                type="checkbox"
                checked={autochargeEnabled}
                onChange={e => setAutochargeEnabled(e.target.checked)}
                style={{
                  width: '22px',
                  height: '22px',
                  accentColor: '#059669',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Linked RFID Card
              </h4>
              <div style={{
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={22} color="#059669" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                      {rfidCardId}
                    </div>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                      ACTIVE • LINKED TO WALLET
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('RFID Card settings synchronized.')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
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

      {/* SUB-MODAL 4: NOTIFICATIONS */}
      {activeSubModal === 'notifications' && (
        <SubModalContainer title="Notification Settings" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Charging Complete Alert', desc: 'Alert when your EV reaches target charge level' },
              { title: 'Low Wallet Balance', desc: 'Notification when wallet drops below ₹150' },
              { title: 'Favourite Charger Availability', desc: 'Alert when bookmarked station plugs become free' },
              { title: 'Promotional Off-Peak Tariffs', desc: 'Special reduced rate alerts on weekends and holidays' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={idx < 3}
                  style={{ accentColor: '#059669', width: '20px', height: '20px' }}
                />
              </div>
            ))}
          </div>
        </SubModalContainer>
      )}

      {/* SUB-MODAL 5: APP PREFERENCES */}
      {activeSubModal === 'preferences' && (
        <SubModalContainer title="App Preferences" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Map Base Layer
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMapStylePref('standard')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: mapStylePref === 'standard' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: mapStylePref === 'standard' ? '#ecfdf5' : '#ffffff',
                    color: mapStylePref === 'standard' ? '#059669' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Standard OpenStreetMap
                </button>
                <button
                  type="button"
                  onClick={() => setMapStylePref('satellite')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: mapStylePref === 'satellite' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: mapStylePref === 'satellite' ? '#ecfdf5' : '#ffffff',
                    color: mapStylePref === 'satellite' ? '#059669' : '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Humanitarian HOT
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Distance & Energy Units
              </label>
              <select
                value={distanceUnit}
                onChange={e => setDistanceUnit(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <option value="km">Metric (Kilometers / kWh)</option>
                <option value="miles">Imperial (Miles / kWh)</option>
              </select>
            </div>
          </div>
        </SubModalContainer>
      )}

      {/* SUB-MODAL 6: SECURITY SETTINGS */}
      {activeSubModal === 'security' && (
        <SubModalContainer title="Security Settings" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>JWT Session Authentication</h4>
                <p style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  HMAC-SHA256 Encrypted • Active Session
                </p>
              </div>
              <ShieldCheck size={20} color="#059669" />
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Database Encryption</h4>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Protected by Supabase PostgreSQL Row Level Security
                </p>
              </div>
              <Lock size={18} color="#64748b" />
            </div>
          </div>
        </SubModalContainer>
      )}

      {/* SUB-MODAL 7: HELP & SUPPORT */}
      {activeSubModal === 'help' && (
        <SubModalContainer title="Help & 24/7 Support" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '16px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857' }}>
                <Phone size={18} />
                <span style={{ fontSize: '13px', fontWeight: 800 }}>24/7 Charging Emergency Hotline</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 900, color: '#065f46', marginTop: '4px' }}>
                1800-425-8274 (Toll-Free)
              </p>
              <p style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                Immediate assistance for dispenser unlocking, station access, or charging support.
              </p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={18} color="#64748b" />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Email Customer Support</h4>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>support@haltcharge.com</p>
                </div>
              </div>
              <a
                href="mailto:support@haltcharge.com"
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
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

      {/* SUB-MODAL 8: FEEDBACK */}
      {activeSubModal === 'feedback' && (
        <SubModalContainer title="Customer Feedback" onClose={() => setActiveSubModal(null)}>
          {feedbackSubmitted ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#065f46' }}>Thank you for your feedback!</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Your insights help us continuously elevate the Halt & Charge charging network.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Rate your charging experience:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={feedbackCategory}
                  onChange={e => setFeedbackCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px'
                  }}
                >
                  <option>Charging Speed</option>
                  <option>Station Cleanliness & Amenities</option>
                  <option>App Usability & Navigation</option>
                  <option>Tariff & Pricing</option>
                  <option>Hardware Reliability</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Comments / Suggestions:
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setFeedbackSubmitted(true)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Submit Feedback
              </button>
            </div>
          )}
        </SubModalContainer>
      )}

      {/* SUB-MODAL 9: PARTNER WITH US */}
      {activeSubModal === 'partner' && (
        <SubModalContainer title="Partner With Us" onClose={() => setActiveSubModal(null)}>
          {partnerSubmitted ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <CheckCircle2 size={44} color="#059669" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#065f46' }}>Partnership Inquiry Submitted!</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Our business development team will review your location details and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                Monetize your commercial property, highway dhaba, hotel, mall, or tech park by hosting official Halt & Charge fast dispensers.
              </p>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Property Type</label>
                <select
                  value={partnerPropertyType}
                  onChange={e => setPartnerPropertyType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px' }}
                >
                  <option>Highway Restaurant / Dhaba</option>
                  <option>Shopping Mall / Retail Center</option>
                  <option>Hotel / Resort</option>
                  <option>Commercial Office / Tech Park</option>
                  <option>Independent Land / Petrol Pump</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Location / City</label>
                <input
                  type="text"
                  value={partnerLocation}
                  onChange={e => setPartnerLocation(e.target.value)}
                  placeholder="e.g. Bengaluru-Mysuru Expressway, Ramanagara"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <button
                type="button"
                onClick={() => setPartnerSubmitted(true)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Submit Partnership Inquiry
              </button>
            </div>
          )}
        </SubModalContainer>
      )}

      {/* SUB-MODAL 10: ABOUT HALT & CHARGE */}
      {activeSubModal === 'about' && (
        <SubModalContainer title="About Halt & Charge" onClose={() => setActiveSubModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              margin: '0 auto'
            }}>
              <Zap size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Halt & Charge</h3>
              <p style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>Clean Energy Fast EV Charging Network</p>
            </div>

            <div style={{
              padding: '14px',
              borderRadius: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'left',
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.6
            }}>
              Halt & Charge is an Indian electric mobility infrastructure network delivering high-power DC fast charging, automated billing, and universal QR-to-Web accessibility.
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              App Version 2.4.0 (Build 20261108) • © 2026 Halt & Charge Technologies Pvt Ltd.
            </div>
          </div>
        </SubModalContainer>
      )}

      {/* LOGOUT CONFIRMATION DIALOG */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 80,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <LogOut size={24} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Log Out of Halt & Charge?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              You will need to sign in again to start charging or manage your EV wallet.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onClose();
                  onLogout();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Section Item Component
interface SectionRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}

const SectionRow: React.FC<SectionRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  onClick
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: hovered ? '#f8fafc' : '#ffffff',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {icon}
        </div>

        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {title}
          </h4>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {badge && (
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: '#ecfdf5',
            color: '#059669'
          }}>
            {badge}
          </span>
        )}
        <ChevronRight size={17} color="#94a3b8" />
      </div>
    </div>
  );
};

const Divider = () => (
  <div style={{ height: '1px', backgroundColor: '#f1f5f9', marginLeft: '66px' }} />
);

// Reusable Sub-Modal Container
const SubModalContainer: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children
}) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 70,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  }}>
    <div
      className="animate-slide-up"
      style={{
        width: '100%',
        maxWidth: '540px',
        maxHeight: '82vh',
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
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
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
