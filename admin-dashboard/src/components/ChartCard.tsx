import React, { useState } from 'react';
import { TrendingUp, Zap, Clock } from 'lucide-react';

interface ChartCardProps {
  activeSessionsCount: number;
  totalEnergyKwh: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  activeSessionsCount,
  totalEnergyKwh
}) => {
  const [metric, setMetric] = useState<'energy' | 'power'>('energy');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 24-hour simulation data points based on actual telemetry
  const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
  
  // Dynamic scale from real total energy or baseline
  const baseEnergy = Math.max(totalEnergyKwh, 12.5);
  const energyData = [
    baseEnergy * 0.12, baseEnergy * 0.08, baseEnergy * 0.25, baseEnergy * 0.65,
    baseEnergy * 0.88, baseEnergy * 0.72, baseEnergy * 0.95, baseEnergy * 0.80, baseEnergy
  ];

  const basePower = activeSessionsCount > 0 ? activeSessionsCount * 45 : 30;
  const powerData = [15, 10, 22, 65, 90, 75, 110, 85, basePower];

  const currentData = metric === 'energy' ? energyData : powerData;
  const maxValue = Math.max(...currentData, 10) * 1.15;
  const unit = metric === 'energy' ? 'kWh' : 'kW';

  // SVG dimensions
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const points = currentData.map((val, idx) => {
    const x = paddingX + (idx / (currentData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (val / maxValue) * (svgHeight - paddingY * 2);
    return { x, y, val, hour: hours[idx] };
  });

  // Generate SVG path string with smooth curves
  const pathD = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Network Telemetry & Activity Flow
            </h3>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a'
            }}>
              SIMULATED TELEMETRY
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Real-time power dispatch and simulated energy increments across network chargers
          </p>
        </div>

        {/* Metric Switcher */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setMetric('energy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: metric === 'energy' ? '#ffffff' : 'transparent',
              color: metric === 'energy' ? '#059669' : '#64748b',
              boxShadow: metric === 'energy' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <TrendingUp size={14} />
            Energy (kWh)
          </button>
          <button
            onClick={() => setMetric('power')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: metric === 'power' ? '#ffffff' : 'transparent',
              color: metric === 'power' ? '#059669' : '#64748b',
              boxShadow: metric === 'power' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Zap size={14} />
            Power (kW)
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '220px', minWidth: '500px' }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (svgHeight - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 6 : 4}
                fill="#ffffff"
                stroke="#059669"
                strokeWidth={hoverIndex === idx ? 3 : 2}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* X-axis labels */}
              <text
                x={p.x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {p.hour}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div style={{
            position: 'absolute',
            left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
            top: `${(points[hoverIndex].y / svgHeight) * 100}%`,
            transform: 'translate(-50%, -120%)',
            background: '#0f172a',
            color: '#ffffff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            {points[hoverIndex].hour} : {points[hoverIndex].val.toFixed(1)} {unit}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '12px', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="#059669" />
          <span>Real-time polling every 4 seconds</span>
        </div>
        <div style={{ fontWeight: 600, color: '#0f172a' }}>
          Peak Load: {Math.max(...currentData).toFixed(1)} {unit}
        </div>
      </div>
    </div>
  );
};

