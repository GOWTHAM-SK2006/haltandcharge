import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  isSimulated?: boolean;
  trend?: string;
  trendPositive?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = '#059669',
  iconBg = '#ecfdf5',
  isSimulated = false,
  trend,
  trendPositive = true
}) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{title}</span>
          {isSimulated && (
            <span style={{
              marginLeft: '6px',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a'
            }}>
              SIMULATED
            </span>
          )}
        </div>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0
        }}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>

      <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '12px' }}>
        {trend && (
          <span style={{
            fontWeight: 700,
            color: trendPositive ? '#059669' : '#dc2626',
            background: trendPositive ? '#ecfdf5' : '#fef2f2',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {trend}
          </span>
        )}
        <span style={{ color: '#64748b' }}>{subtext}</span>
      </div>
    </div>
  );
};
