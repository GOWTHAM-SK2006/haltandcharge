import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Zap, Car, Shield, CheckCircle2, AlertTriangle, Camera, Upload, RefreshCw } from 'lucide-react';
import { Station, Charger, Vehicle } from '../types';

interface ScanChargeModalProps {
  stations: Station[];
  vehicles: Vehicle[];
  selectedChargerId?: string;
  onStartCharging: (chargerIdentifier: string, vehicleId?: number) => Promise<void>;
  onClose: () => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

interface DetectedChargerInfo {
  identifier: string;
  chargerId?: number;
  stationName?: string;
  stationId?: number;
  connectorType?: string;
  maxPowerKw?: number;
  tariffPerKwh?: number;
  status: string;
}

export const ScanChargeModal: React.FC<ScanChargeModalProps> = ({
  stations,
  vehicles,
  selectedChargerId,
  onStartCharging,
  onClose,
  isAuthenticated,
  onOpenAuth
}) => {
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedCharger, setDetectedCharger] = useState<DetectedChargerInfo | null>(null);
  const [vehicleId, setVehicleId] = useState<number | undefined>(vehicles[0]?.id);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectedSuccess, setIsConnectedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to resolve charger from identifier
  const resolveCharger = (rawText: string): DetectedChargerInfo => {
    let identifier = rawText.trim();
    let parsedJson: any = null;

    try {
      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        parsedJson = JSON.parse(rawText);
        if (parsedJson.identifier) {
          identifier = parsedJson.identifier;
        }
      } else if (rawText.includes('charger=')) {
        const urlParams = new URLSearchParams(rawText.split('?')[1] || rawText);
        identifier = urlParams.get('charger') || identifier;
      }
    } catch (e) {
      // Use raw identifier
    }

    // Lookup in network stations
    let matchedCharger: Charger | undefined;
    let matchedStation: Station | undefined;

    for (const st of stations) {
      const ch = st.chargers?.find(c => c.identifier.toLowerCase() === identifier.toLowerCase());
      if (ch) {
        matchedCharger = ch;
        matchedStation = st;
        break;
      }
    }

    if (matchedCharger && matchedStation) {
      return {
        identifier: matchedCharger.identifier,
        chargerId: matchedCharger.id,
        stationName: matchedStation.name,
        stationId: matchedStation.id,
        connectorType: matchedCharger.chargerType === 'DC' ? 'DC Fast (CCS2)' : 'AC Standard (Type 2)',
        maxPowerKw: matchedCharger.maxPowerKw,
        tariffPerKwh: matchedCharger.tariffPerKwh,
        status: matchedCharger.status
      };
    }

    // Fallback to QR parsed values if not in cached station list
    return {
      identifier: identifier,
      chargerId: parsedJson?.chargerId,
      stationName: parsedJson?.stationName || 'Halt & Charge Station',
      stationId: parsedJson?.stationId,
      connectorType: parsedJson?.connectorType || 'DC Fast (CCS2)',
      maxPowerKw: parsedJson?.maxPowerKw || 120.0,
      tariffPerKwh: parsedJson?.tariffPerKwh || 18.5,
      status: 'AVAILABLE'
    };
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (!decodedText) return;
    try {
      // Stop scanner
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (e) {
      console.warn('Error stopping scanner:', e);
    }

    setIsScanning(false);
    const resolved = resolveCharger(decodedText);
    setDetectedCharger(resolved);
  };

  // Start Camera QR Scanner
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    const scannerId = 'html5qr-camera-stream';

    const startCamera = async () => {
      try {
        setCameraError(null);
        html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleScanSuccess(decodedText);
          },
          () => {
            // Frame scanned without QR, ignore
          }
        );
      } catch (err: any) {
        console.warn('Unable to access camera:', err);
        setCameraError(err?.message || 'Camera permission denied or camera device not found. You can upload a QR image.');
      }
    };

    if (isScanning && !detectedCharger) {
      // Small timeout to ensure DOM container is rendered
      const timer = setTimeout(startCamera, 300);
      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().then(() => html5QrCode?.clear()).catch(console.error);
        }
      };
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
      }
    };
  }, [isScanning, detectedCharger]);

  // Handle file QR scan fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('html5qr-camera-stream');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanSuccess(decodedText);
    } catch (err: any) {
      alert('Could not detect a valid QR code in the uploaded image. Please try again.');
    }
  };

  // Connect & Start Charging
  const handleConnectAndStart = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!detectedCharger) return;

    setErrorMessage(null);
    setIsConnecting(true);
    try {
      // 1. Establish session on backend
      await onStartCharging(detectedCharger.identifier, vehicleId);

      // 2. Display "Charger Connected" success confirmation
      setIsConnectedSuccess(true);

      // 3. Briefly display confirmation before opening cockpit
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to establish connection with charger');
      setIsConnecting(false);
    }
  };

  // Rescan Action
  const handleRescan = () => {
    setDetectedCharger(null);
    setIsConnectedSuccess(false);
    setErrorMessage(null);
    setIsScanning(true);
  };

  const isChargerAvailable = detectedCharger?.status === 'AVAILABLE';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
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
                <QrCode size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                  Camera QR Scanner
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>
                  Point browser camera at dispenser QR code
                </p>
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
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Hidden File Input for fallback */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* STATE 1: CAMERA SCANNING */}
          {!detectedCharger && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Camera Container */}
              <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '260px',
                backgroundColor: '#0f172a',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)'
              }}>
                <div id="html5qr-camera-stream" style={{ width: '100%' }} />

                {/* Live Scanner Target Brackets */}
                <div style={{
                  position: 'absolute',
                  width: '210px',
                  height: '210px',
                  border: '2px solid rgba(16, 185, 129, 0.8)',
                  borderRadius: '18px',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Laser Scan Animation Line */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 12px #10b981, 0 0 24px #10b981',
                    animation: 'scannerLaser 2s infinite ease-in-out'
                  }} />
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Camera size={13} color="#10b981" />
                  <span>Align physical dispenser QR code inside frame</span>
                </div>
              </div>

              {/* Camera Permission Error Notice & Fallback */}
              {cameraError && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  fontSize: '12px',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>{cameraError}</span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #f87171',
                      color: '#dc2626',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Upload size={12} />
                    <span>Upload QR</span>
                  </button>
                </div>
              )}

              {/* Upload QR File Alternative Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Upload size={14} />
                <span>Upload QR Image / File from Device</span>
              </button>
            </div>
          )}

          {/* STATE 2: CHARGER DETECTED VIA SCAN */}
          {detectedCharger && !isConnectedSuccess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Detected Card */}
              <div style={{
                background: '#ffffff',
                border: '2px solid #a7f3d0',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      QR Scan Verified Dispenser
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {detectedCharger.stationName}
                    </h4>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#065f46', fontSize: '14px', marginTop: '2px' }}>
                      {detectedCharger.identifier} {detectedCharger.chargerId ? `(#${detectedCharger.chargerId})` : ''}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: detectedCharger.status === 'AVAILABLE' ? '#ecfdf5' :
                                detectedCharger.status === 'CHARGING' ? '#eff6ff' :
                                detectedCharger.status === 'FAULTED' ? '#fef2f2' : '#f1f5f9',
                    color: detectedCharger.status === 'AVAILABLE' ? '#059669' :
                           detectedCharger.status === 'CHARGING' ? '#2563eb' :
                           detectedCharger.status === 'FAULTED' ? '#dc2626' : '#475569',
                    border: detectedCharger.status === 'AVAILABLE' ? '1px solid #a7f3d0' :
                            detectedCharger.status === 'CHARGING' ? '1px solid #bfdbfe' :
                            detectedCharger.status === 'FAULTED' ? '1px solid #fecaca' : '1px solid #cbd5e1'
                  }}>
                    {detectedCharger.status}
                  </span>
                </div>

                {/* Specs Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginTop: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Connector Type</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{detectedCharger.connectorType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Power Rating</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{detectedCharger.maxPowerKw} kW Fast</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Tariff Rate</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>₹{detectedCharger.tariffPerKwh} / kWh</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Hardware Engine</div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>[SIMULATED GUN]</div>
                  </div>
                </div>

                {/* Status Warning if not available */}
                {!isChargerAvailable && (
                  <div style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '12px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={16} />
                    <span>This charger is currently <strong>{detectedCharger.status}</strong> and cannot accept connections.</span>
                  </div>
                )}
              </div>

              {/* Vehicle Selector (Only if Available) */}
              {isChargerAvailable && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Select Your EV Vehicle:
                  </label>
                  <select
                    value={vehicleId}
                    onChange={e => setVehicleId(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  >
                    {vehicles.length > 0 ? (
                      vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model} ({v.licensePlate})
                        </option>
                      ))
                    ) : (
                      <option value={undefined}>Default EV Profile (50 kWh Battery)</option>
                    )}
                  </select>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Controls */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleRescan}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Rescan</span>
                </button>

                <button
                  type="button"
                  onClick={handleConnectAndStart}
                  disabled={!isChargerAvailable || isConnecting}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: isChargerAvailable ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
                    color: isChargerAvailable ? '#ffffff' : '#94a3b8',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: isChargerAvailable && !isConnecting ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isChargerAvailable ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
                  }}
                >
                  <Zap size={18} />
                  <span>{isConnecting ? 'Establishing Connection...' : 'Connect & Start Charging'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: CHARGER CONNECTED CONFIRMATION */}
          {isConnectedSuccess && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                border: '3px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.35)',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={44} strokeWidth={2.5} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#065f46', marginBottom: '4px' }}>
                Charger Connected
              </h3>
              <p style={{ fontSize: '13px', color: '#047857', maxWidth: '320px' }}>
                Handshake verified with {detectedCharger?.identifier}. Virtual Charger Simulator initialized!
              </p>
              <div style={{ marginTop: '16px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                Opening Live Charging Cockpit...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
