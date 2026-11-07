import React, { useState } from 'react';
import { Settings, Shield, Sliders, CheckCircle2, Server, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [telemetryInterval, setTelemetryInterval] = useState('4');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [defaultTariff, setDefaultTariff] = useState('18.5');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }}>
      {savedSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#059669',
          padding: '12px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} />
          System settings updated successfully.
        </div>
      )}

      {/* Simulator Engine Configuration */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Simulator & Network Parameters
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Tune telemetry ingestion speed and baseline charging station defaults
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Telemetry Poll Interval (seconds)
              </label>
              <input
                type="number"
                value={telemetryInterval}
                onChange={e => setTelemetryInterval(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Default Base Tariff (₹/kWh)
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultTariff}
                onChange={e => setDefaultTariff(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Currency Notation
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Simulator Mode
              </label>
              <div style={{
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                Virtual Telemetry Loop Active
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}
            >
              Save Parameters
            </button>
          </div>
        </form>
      </div>

      {/* Cloud & Platform Infrastructure Information */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#f0f9ff',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              System & Cloud Infrastructure
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Current runtime versions, security hashes, and deployment specs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#475569', fontWeight: 500 }}>Backend Framework</span>
            <strong style={{ color: '#0f172a' }}>Spring Boot 3.3.5 / OpenJDK 21</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#475569', fontWeight: 500 }}>Database Platform</span>
            <strong style={{ color: '#0f172a' }}>PostgreSQL 15 (Supabase Cloud) + Flyway Migrations</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#475569', fontWeight: 500 }}>Security Engine</span>
            <strong style={{ color: '#0f172a' }}>Spring Security 6 with 760-bit HMAC-SHA512 JWT</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#475569', fontWeight: 500 }}>Cloud Hosting</span>
            <strong style={{ color: '#0f172a' }}>Railway Production (Docker Containerized)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

