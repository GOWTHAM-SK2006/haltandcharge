import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { Charger, Station } from '../types';

interface ChargerQrModalProps {
  charger: Charger;
  station?: Station;
  onClose: () => void;
}

export const ChargerQrModal: React.FC<ChargerQrModalProps> = ({
  charger,
  station,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Encoded QR Payload containing exact Station, Charger ID, and Connector details
  const qrPayload = JSON.stringify({
    protocol: 'HALT_CHARGE_V1',
    stationId: charger.stationId,
    stationName: station?.name || 'Halt & Charge Station',
    chargerId: charger.id,
    identifier: charger.identifier,
    connectorType: charger.chargerType === 'DC' ? 'DC Fast (CCS2)' : 'AC Standard (Type 2)',
    maxPowerKw: charger.maxPowerKw,
    tariffPerKwh: charger.tariffPerKwh
  });

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        qrPayload,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#064e3b', // Deep emerald dark
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        },
        (err) => {
          if (!err && canvasRef.current) {
            setQrDataUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [qrPayload]);

  // Download high-resolution placard
  const handleDownloadPlacard = () => {
    const printCanvas = document.createElement('canvas');
    printCanvas.width = 600;
    printCanvas.height = 760;
    const ctx = printCanvas.getContext('2d');
    if (!ctx) return;

    // Card background
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(0, 0, 600, 760, 24);
    ctx.fill();

    // Top Green Header
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(0, 0, 600, 110, [24, 24, 0, 0]);
    ctx.fill();

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HALT & CHARGE NETWORK', 300, 48);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('OFFICIAL EV CHARGING DISPENSER PLACARD', 300, 78);

    // Station Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(station?.name || 'Charging Station Hub', 300, 160);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(station?.address || 'Fast EV Network Hub', 300, 185);

    // Draw QR Code
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 180, 215, 240, 240);
    }

    // Charger Identifier Pill
    ctx.fillStyle = '#ecfdf5';
    ctx.roundRect(140, 480, 320, 46, 10);
    ctx.fill();
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(charger.identifier, 300, 510);

    // Technical Details
    ctx.fillStyle = '#334155';
    ctx.font = '15px system-ui, sans-serif';
    const connLabel = charger.chargerType === 'DC' ? 'DC Fast (CCS2)' : 'AC Standard (Type 2)';
    ctx.fillText(`Connector: ${connLabel} • Power: ${charger.maxPowerKw} kW`, 300, 560);
    ctx.fillText(`Tariff: ₹${charger.tariffPerKwh}/kWh • Gun ID: #${charger.id}`, 300, 590);

    // Instruction Banner
    ctx.fillStyle = '#f1f5f9';
    ctx.roundRect(40, 630, 520, 80, 14);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('SCAN WITH HALT & CHARGE APP TO CHARGE', 300, 665);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Point your browser camera to automatically connect & initiate charging session', 300, 690);

    // Trigger download
    const link = document.createElement('a');
    link.download = `${charger.identifier}-QR-Placard.png`;
    link.href = printCanvas.toDataURL('image/png');
    link.click();
  };

  // Print placard
  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(charger.identifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Charger Station QR Placard
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Hardware Gun ID: #{charger.id} • {charger.identifier}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Placard Container */}
        <div id="printable-qr-placard" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#ffffff'
        }}>
          {/* Station Placard Card */}
          <div style={{
            width: '100%',
            maxWidth: '380px',
            border: '2px solid #a7f3d0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
            textAlign: 'center',
            backgroundColor: '#ffffff'
          }}>
            {/* Placard Green Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              padding: '12px 16px',
              color: '#ffffff'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                HALT & CHARGE
              </div>
              <div style={{ fontSize: '11px', color: '#d1fae5', fontWeight: 500 }}>
                High-Speed EV Dispenser Gun
              </div>
            </div>

            {/* Station details */}
            <div style={{ padding: '16px 16px 8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '12px', fontWeight: 700 }}>
                <MapPin size={13} />
                <span>{station?.name || 'Charging Station'}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {station?.city ? `${station.city}, Station #${charger.stationId}` : `Station #${charger.stationId}`}
              </div>
            </div>

            {/* Canvas QR Container */}
            <div style={{
              margin: '8px auto',
              display: 'flex',
              justifyContent: 'center',
              padding: '8px'
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0'
                }}
              />
            </div>

            {/* Identifier Badge */}
            <div style={{ padding: '0 16px 14px' }}>
              <div style={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '17px',
                color: '#065f46',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                {charger.identifier}
              </div>

              {/* Specs Pills */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '12px',
                fontSize: '11px'
              }}>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b' }}>Connector</div>
                  <strong style={{ color: '#0f172a' }}>{charger.chargerType === 'DC' ? 'DC (CCS2)' : 'AC (Type 2)'}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b' }}>Capacity</div>
                  <strong style={{ color: '#059669' }}>{charger.maxPowerKw} kW Fast</strong>
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '11px', color: '#047857', fontWeight: 600 }}>
                Tariff: ₹{charger.tariffPerKwh}/kWh • Virtual Simulated Gun
              </div>
            </div>

            {/* Footer Notice */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              padding: '8px 12px',
              fontSize: '10px',
              color: '#64748b',
              fontWeight: 600
            }}>
              SCAN WITH HALT & CHARGE APP TO START
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleCopyPayload}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? <CheckCircle2 size={14} color="#059669" /> : null}
            <span>{copied ? 'Copied ID!' : 'Copy Identifier'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownloadPlacard}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                background: '#ecfdf5',
                color: '#059669',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={15} />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} />
              <span>Print Placard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
