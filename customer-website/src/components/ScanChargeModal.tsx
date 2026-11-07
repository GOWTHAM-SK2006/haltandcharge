import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Zap, Car, Shield, CheckCircle2, AlertTriangle, Camera, Upload, RefreshCw, AlertCircle, MapPin, ArrowRight, LogIn } from 'lucide-react';
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
  stationAddress?: string;
  stationId?: number;
  connectorType?: string;
  maxPowerKw?: number;
  tariffPerKwh?: number;
  status: string; // 'AVAILABLE' | 'CHARGING' | 'FAULTED' | 'OFFLINE' | 'UNKNOWN' | 'VERIFYING'
  isValid: boolean;
  isUnknown?: boolean;
  errorReason?: string;
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
  const [isScanning, setIsScanning] = useState(!selectedChargerId);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedCharger, setDetectedCharger] = useState<DetectedChargerInfo | null>(null);
  const [vehicleId, setVehicleId] = useState<number | undefined>(vehicles[0]?.id);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectedSuccess, setIsConnectedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to extract clean charger identifier from URL, JSON, query params or raw string
  const extractIdentifier = (rawText: string): string => {
    let clean = (rawText || '').trim();
    if (!clean) return '';

    try {
      // 1. JSON payload: {"protocol":"HALT_CHARGE_V1","identifier":"..."}
      if (clean.startsWith('{') && clean.endsWith('}')) {
        const parsedJson = JSON.parse(clean);
        if (parsedJson.identifier) {
          return String(parsedJson.identifier).trim();
        }
      }

      // 2. URL Path: https://.../scan/IDENTIFIER or /scan/IDENTIFIER
      const scanPathMatch = clean.match(/\/scan\/([a-zA-Z0-9\-_]+)/i);
      if (scanPathMatch && scanPathMatch[1]) {
        return decodeURIComponent(scanPathMatch[1]).trim();
      }

      // 3. URL Query Params: ?scan=IDENTIFIER or ?charger=IDENTIFIER
      if (clean.includes('scan=') || clean.includes('charger=')) {
        const queryPart = clean.includes('?') ? clean.split('?')[1] : clean;
        const urlParams = new URLSearchParams(queryPart);
        const p = urlParams.get('scan') || urlParams.get('charger');
        if (p) return decodeURIComponent(p).trim();
      }

      // 4. URL without /scan/: e.g. https://domain.com/IDENTIFIER
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        const urlObj = new URL(clean);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          return decodeURIComponent(segments[segments.length - 1]).trim();
        }
      }
    } catch (e) {
      // fallback
    }

    return clean;
  };

  // Helper to resolve charger from identifier against real station data
  const resolveCharger = (rawText: string): DetectedChargerInfo => {
    const identifier = extractIdentifier(rawText);

    if (!identifier || identifier.length < 2) {
      return {
        identifier: rawText,
        isValid: false,
        isUnknown: true,
        status: 'UNKNOWN',
        errorReason: 'Invalid QR Code format. Please scan an authentic Halt & Charge dispenser QR.'
      };
    }

    // Lookup in network stations
    let matchedCharger: Charger | undefined;
    let matchedStation: Station | undefined;

    for (const st of stations) {
      const ch = st.chargers?.find(
        c => c.identifier.toLowerCase() === identifier.toLowerCase() ||
             String(c.id) === identifier
      );
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
        stationAddress: `${matchedStation.address || ''}, ${matchedStation.city || ''}`,
        stationId: matchedStation.id,
        connectorType: matchedCharger.chargerType === 'DC' ? 'DC Fast (CCS2)' : 'AC Standard (Type 2)',
        maxPowerKw: matchedCharger.maxPowerKw,
        tariffPerKwh: matchedCharger.tariffPerKwh,
        status: matchedCharger.status,
        isValid: true
      };
    }

    // If stations have loaded from backend and no charger was found:
    if (stations.length > 0) {
      return {
        identifier: identifier,
        isValid: false,
        isUnknown: true,
        status: 'UNKNOWN',
        errorReason: `Charger "${identifier}" could not be found on the Halt & Charge network. Please verify dispenser or scan again.`
      };
    }

    // Stations still fetching from backend API
    return {
      identifier: identifier,
      isValid: true,
      status: 'VERIFYING',
      stationName: 'Resolving Station Details...',
      connectorType: 'Detecting...',
      maxPowerKw: 0,
      tariffPerKwh: 0
    };
  };

  // Re-resolve whenever selectedChargerId or stations list updates
  useEffect(() => {
    if (selectedChargerId) {
      const resolved = resolveCharger(selectedChargerId);
      setDetectedCharger(resolved);
      setIsScanning(false);
    }
  }, [selectedChargerId, stations]);

  // Keep vehicleId in sync when vehicles load
  useEffect(() => {
    if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

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
      // Save pending scan before redirecting to login
      if (detectedCharger?.identifier) {
        sessionStorage.setItem('hc_pending_scan', detectedCharger.identifier);
      }
      onOpenAuth();
      return;
    }
    if (!detectedCharger || !detectedCharger.isValid || detectedCharger.status !== 'AVAILABLE') return;

    setErrorMessage(null);
    setIsConnecting(true);
    try {
      // Establish session on backend API
      await onStartCharging(detectedCharger.identifier, vehicleId);

      // Display "Charger Connected" success confirmation
      setIsConnectedSuccess(true);

      // Brief animation before opening live charging cockpit
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to establish connection with virtual charger');
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
  const isChargerOccupied = detectedCharger?.status === 'CHARGING';
  const isChargerOffline = detectedCharger?.status === 'FAULTED' || detectedCharger?.status === 'OFFLINE';
  const isChargerUnknown = detectedCharger?.isUnknown || detectedCharger?.status === 'UNKNOWN';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'var(--hc-green-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--hc-green-primary)'
              }}>
                <QrCode size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--hc-text-primary)' }}>
                  {detectedCharger ? 'EV Dispenser Detected' : 'Scan Charger QR Code'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--hc-text-muted)' }}>
                  {detectedCharger ? 'Verify dispenser specifications and confirm session' : 'Point camera at dispenser placard or upload QR'}
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
                  padding: '5px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
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
                  padding: '11px',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Upload size={15} />
                <span>Upload QR Image / Placard Snapshot</span>
              </button>
            </div>
          )}

          {/* STATE 2: UNKNOWN / INVALID CHARGER ERROR */}
          {detectedCharger && isChargerUnknown && !isConnectedSuccess && (
            <div style={{
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '20px',
              padding: '24px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertCircle size={32} />
              </div>

              <div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#991b1b' }}>
                  Unrecognized EV Dispenser
                </h4>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>
                  {detectedCharger.identifier}
                </div>
                <p style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '8px', lineHeight: 1.4 }}>
                  {detectedCharger.errorReason || 'This QR code does not match any registered charger in the Halt & Charge network.'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleRescan}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #fca5a5',
                    background: '#ffffff',
                    color: '#dc2626',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Scan Another Code</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Browse Map
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: CHARGER DETECTED VIA SCAN (KNOWN DISPENSER) */}
          {detectedCharger && !isChargerUnknown && !isConnectedSuccess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Detected Card */}
              <div style={{
                background: '#ffffff',
                border: isChargerAvailable ? '2px solid #a7f3d0' :
                        isChargerOccupied ? '2px solid #bfdbfe' : '2px solid #fecaca',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: isChargerAvailable ? '0 8px 24px rgba(16, 185, 129, 0.12)' : '0 4px 14px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isChargerAvailable ? '#059669' :
                             isChargerOccupied ? '#2563eb' : '#dc2626',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}>
                      {isChargerAvailable ? '⚡ Charger Detected & Verified' :
                       isChargerOccupied ? 'ℹ️ Charger Occupied' : '⚠️ Charger Unavailable'}
                    </span>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {detectedCharger.stationName}
                    </h4>
                    {detectedCharger.stationAddress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        <MapPin size={12} color="#059669" />
                        <span>{detectedCharger.stationAddress}</span>
                      </div>
                    )}
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#065f46', fontSize: '14px', marginTop: '4px' }}>
                      {detectedCharger.identifier} {detectedCharger.chargerId ? `(Dispenser #${detectedCharger.chargerId})` : ''}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
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
                  padding: '12px 14px',
                  borderRadius: '14px',
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
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>Virtual Simulator Active</div>
                  </div>
                </div>

                {/* Status Warning if Occupied */}
                {isChargerOccupied && (
                  <div style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    fontSize: '12px',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <AlertTriangle size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <strong>Charger Occupied:</strong> Another EV is currently charging at this gun. Please wait for the current session to complete or select an adjacent available dispenser.
                    </div>
                  </div>
                )}

                {/* Status Warning if Faulted or Offline */}
                {isChargerOffline && (
                  <div style={{
                    marginTop: '14px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    fontSize: '12px',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <strong>Dispenser Offline:</strong> This charger is undergoing maintenance or is temporarily offline. Please use another charger at this station.
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Selector (Only if Available) */}
              {isChargerAvailable && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Car size={15} color="#059669" />
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Select Your EV Profile:
                    </label>
                  </div>
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
                          {v.brand} {v.model} ({v.licensePlate}) • {v.batteryCapacityKwh} kWh
                        </option>
                      ))
                    ) : (
                      <option value={undefined}>Default EV Profile (50 kWh Battery)</option>
                    )}
                  </select>
                </div>
              )}

              {/* Authentication Prompt Banner (If not logged in) */}
              {!isAuthenticated && isChargerAvailable && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Shield size={18} color="#059669" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Sign In Required:</strong> Please sign in or create an account to initiate charging at <strong>{detectedCharger.identifier}</strong>.
                  </div>
                </div>
              )}

              {/* Error message from API */}
              {errorMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <span>{errorMessage}</span>
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
                  {isConnecting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Initiating Charging Session...</span>
                    </>
                  ) : !isAuthenticated ? (
                    <>
                      <LogIn size={18} />
                      <span>Sign In & Start Charging</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Confirm & Start Charging</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: CHARGER CONNECTED CONFIRMATION */}
          {isConnectedSuccess && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '76px',
                height: '76px',
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
                <CheckCircle2 size={46} strokeWidth={2.5} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#065f46', marginBottom: '6px' }}>
                Charger Connected!
              </h3>
              <p style={{ fontSize: '13px', color: '#047857', maxWidth: '340px', lineHeight: 1.5 }}>
                Handshake verified with <strong>{detectedCharger?.identifier}</strong>. Virtual Charger Simulator initiated!
              </p>
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#059669" />
                <span>Launching Live Charging Cockpit...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
