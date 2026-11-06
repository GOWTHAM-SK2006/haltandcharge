import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, ShieldCheck } from 'lucide-react';

interface WalletTopUpModalProps {
  currentBalance: number;
  onTopUp: (amount: number) => void;
  onClose: () => void;
}

export const WalletTopUpModal: React.FC<WalletTopUpModalProps> = ({
  currentBalance,
  onTopUp,
  onClose
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [isSuccess, setIsSuccess] = useState(false);

  const presets = [200, 500, 1000, 2000];

  const handleRecharge = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onTopUp(selectedAmount);
      onClose();
    }, 700);
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
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: 'var(--hc-shadow-float)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--hc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--hc-green-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--hc-green-primary)'
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>Top Up EV Wallet</h3>
              <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>Fast 1-tap seamless charging checkout</p>
            </div>
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

        {/* Balance Snapshot */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: 'var(--hc-surface-subtle)',
            border: '1px solid var(--hc-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--hc-text-muted)', fontWeight: 600 }}>Current Balance</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--hc-text-primary)', marginTop: '2px' }}>
                ₹{Number(currentBalance || 0).toFixed(2)}
              </div>
            </div>

            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: '#ecfdf5',
              color: 'var(--hc-green-dark)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={14} />
              Instant Load
            </div>
          </div>

          {/* Quick Amount Selectors */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--hc-text-secondary)', marginBottom: '8px', display: 'block' }}>
              Select Recharge Amount:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {presets.map(amt => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: selectedAmount === amt ? '2px solid var(--hc-green-primary)' : '1px solid var(--hc-border)',
                    backgroundColor: selectedAmount === amt ? 'var(--hc-green-subtle)' : '#ffffff',
                    color: selectedAmount === amt ? 'var(--hc-green-dark)' : 'var(--hc-text-primary)',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Top Up Button */}
          <button
            onClick={handleRecharge}
            disabled={isSuccess}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--hc-green-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '15px',
              cursor: isSuccess ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              boxShadow: 'var(--hc-shadow-md)'
            }}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 size={18} />
                <span>Recharge Successful!</span>
              </>
            ) : (
              <span>Add ₹{selectedAmount} to Wallet</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

