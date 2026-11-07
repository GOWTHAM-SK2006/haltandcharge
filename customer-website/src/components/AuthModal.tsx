import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiRequest } from '../api';

interface AuthModalProps {
  onSuccess: (token: string, role?: string) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onClose
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const res = await apiRequest<{ token: string; role?: string; email?: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        // If user is Admin, save admin token and immediately redirect to official Admin Dashboard
        if (res.role === 'ROLE_ADMIN' || res.email === 'admin@haltcharge.com' || email.trim().toLowerCase() === 'admin@haltcharge.com') {
          localStorage.setItem('hc_admin_token', res.token);
          localStorage.removeItem('hc_customer_token');
          window.location.replace('/admin/');
          return;
        }

        localStorage.setItem('hc_customer_token', res.token);
        localStorage.removeItem('hc_admin_token');
        onSuccess(res.token, res.role);
      } else {
        const res = await apiRequest<{ token: string; role?: string }>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            fullName,
            phoneNumber: phone
          })
        });
        localStorage.setItem('hc_customer_token', res.token);
        localStorage.removeItem('hc_admin_token');
        onSuccess(res.token, res.role);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setMode('login');
    setEmail('admin@haltcharge.com');
    setPassword('Password@123');
  };

  const handleFillCustomer = () => {
    setMode('login');
    setEmail('customer@haltcharge.com');
    setPassword('Password@123');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: 'var(--hc-shadow-float)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--hc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
              {mode === 'login' ? 'Sign In to Halt & Charge' : 'Create Customer Account'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)', marginTop: '2px' }}>
              Enter your credentials to access your dashboard
            </p>
          </div>

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

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--hc-border)' }}>
          <button
            onClick={() => {
              setMode('login');
              setEmail('');
              setPassword('');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              color: mode === 'login' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
              borderBottom: mode === 'login' ? '2.5px solid var(--hc-green-primary)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setEmail('');
              setPassword('');
              setFullName('');
              setPhone('');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              color: mode === 'register' ? 'var(--hc-green-primary)' : 'var(--hc-text-muted)',
              borderBottom: mode === 'register' ? '2.5px solid var(--hc-green-primary)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Full Name</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid var(--hc-border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginTop: '4px'
                }}>
                  <User size={16} color="var(--hc-text-muted)" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Phone Number</label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: '1px solid var(--hc-border)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginTop: '4px'
                }}>
                  <Phone size={16} color="var(--hc-text-muted)" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Email Address</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid var(--hc-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginTop: '4px'
            }}>
              <Mail size={16} color="var(--hc-text-muted)" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--hc-text-secondary)' }}>Password</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid var(--hc-border)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginTop: '4px'
            }}>
              <Lock size={16} color="var(--hc-text-muted)" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--hc-green-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px'
            }}
          >
            <span>{loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Account' : 'Register Account')}</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Demo Fill Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleFillAdmin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--hc-green-primary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Fill Admin Login
            </button>
            <span style={{ color: 'var(--hc-border-dark)' }}>•</span>
            <button
              type="button"
              onClick={handleFillCustomer}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--hc-text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Fill Customer Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
