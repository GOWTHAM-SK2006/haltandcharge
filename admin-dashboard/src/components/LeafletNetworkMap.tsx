import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Station } from '../types';
import { MapPin, Zap } from 'lucide-react';

interface LeafletNetworkMapProps {
  stations: Station[];
  onSelectStation?: (station: Station) => void;
}

export const LeafletNetworkMap: React.FC<LeafletNetworkMapProps> = ({
  stations,
  onSelectStation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Bengaluru as primary hub
    const defaultLat = 12.9716;
    const defaultLng = 77.5946;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when stations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    if (stations.length === 0) return;

    const bounds = L.latLngBounds([]);

    stations.forEach(st => {
      const isOperational = st.isActive !== false && st.status !== 'DECOMMISSIONED';
      const pinClass = isOperational ? 'hc-pin-available' : 'hc-pin-offline';
      
      const pinHtml = `
        <div class="hc-station-pin ${pinClass}" title="${st.name}">
          ⚡
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">${st.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${st.address}, ${st.city}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 11px;">
            <span style="color: ${isOperational ? '#059669' : '#dc2626'}; font-weight: 700;">● ${st.status}</span>
            <span style="color: #64748b;">${st.operatingHours || '24/7'}</span>
          </div>
        </div>
      `;

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      if (onSelectStation) {
        marker.on('click', () => onSelectStation(st));
      }

      markersRef.current[st.id] = marker;
      bounds.extend([st.latitude, st.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [stations, onSelectStation]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Network Stations Geographic Distribution
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#ecfdf5',
              color: '#059669',
              fontWeight: 700,
              border: '1px solid #a7f3d0'
            }}>
              {stations.length} Hubs Active
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            Live geospatial positioning of Halt & Charge charging hubs across metropolitan regions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }}></span>
            <span style={{ color: '#475569', fontWeight: 500 }}>Operational</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748b' }}></span>
            <span style={{ color: '#475569', fontWeight: 500 }}>Maintenance</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '320px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};
