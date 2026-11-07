import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Navigation, Crosshair } from 'lucide-react';
import { Station } from '../types';

interface MapComponentProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onMapClick?: () => void;
  userLocation: { lat: number; lng: number };
  onRefresh: () => void;
  onOpenFilter: () => void;
  hasStationCard?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onMapClick,
  userLocation,
  onRefresh,
  onOpenFilter,
  hasStationCard = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'osm' | 'hot'>('osm');

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const onSelectStationRef = useRef(onSelectStation);
  useEffect(() => {
    onSelectStationRef.current = onSelectStation;
  }, [onSelectStation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.lat || 12.9716;
    const initialLng = userLocation?.lng || 77.5946;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    map.on('click', () => {
      onMapClickRef.current?.();
    });

    const tileUrl = mapLayer === 'hot'
      ? 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    (map as any)._customTileLayer = tiles;
    mapInstanceRef.current = map;

    // Add User Location Marker
    const userPinHtml = `<div class="hc-user-pin" title="Your Location"></div>`;
    const userIcon = L.divIcon({
      html: userPinHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    userMarkerRef.current = userMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if toggled
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if ((map as any)._customTileLayer) {
      map.removeLayer((map as any)._customTileLayer);
    }
    const tileUrl = mapLayer === 'hot'
      ? 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    (map as any)._customTileLayer = tiles;
  }, [mapLayer]);

  // Update User Location
  useEffect(() => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Render & Update Station Markers (3D styling + Status colors + Pulsing halo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers that no longer exist
    const currentStationIds = new Set(stations.map(s => s.id));
    Object.keys(markersRef.current).forEach(idStr => {
      const id = Number(idStr);
      if (!currentStationIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    stations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;

      // Status determination
      const hasFault = station.chargers?.some(c => c.status === 'FAULTED');
      const isOffline = !station.isActive || station.chargers?.every(c => c.status === 'OFFLINE');
      const hasAvailable = (station.availableChargers ?? 0) > 0 || station.chargers?.some(c => c.status === 'AVAILABLE');
      const isOccupied = !hasAvailable && station.chargers?.some(c => c.status === 'CHARGING' || c.status === 'PREPARING');

      let statusClass = '';
      let iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      `;

      if (isOffline) {
        statusClass = 'offline';
        iconSvg = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else if (hasFault) {
        statusClass = 'faulted';
        iconSvg = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        `;
      } else if (isOccupied) {
        statusClass = 'occupied';
      }

      const selectedClass = isSelected ? 'selected' : '';
      const haloHtml = isSelected ? '<div class="hc-pin-halo"></div>' : '';

      const markerHtml = `
        <div class="hc-station-pin">
          <div class="hc-pin-bubble ${statusClass} ${selectedClass}">
            ${iconSvg}
          </div>
          <div class="hc-pin-arrow"></div>
          ${haloHtml}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [44, 52],
        iconAnchor: [22, 50],
        popupAnchor: [0, -50]
      });

      if (markersRef.current[station.id]) {
        markersRef.current[station.id].setIcon(customIcon);
        markersRef.current[station.id].setLatLng([station.latitude, station.longitude]);
        markersRef.current[station.id].off('click');
        markersRef.current[station.id].on('click', (e: any) => {
          if (e && e.originalEvent) {
            L.DomEvent.stopPropagation(e);
          }
          onSelectStationRef.current(station);
        });
      } else {
        const marker = L.marker([station.latitude, station.longitude], { icon: customIcon })
          .addTo(map)
          .on('click', (e: any) => {
            if (e && e.originalEvent) {
              L.DomEvent.stopPropagation(e);
            }
            onSelectStationRef.current(station);
          });
        markersRef.current[station.id] = marker;
      }
    });

    // If first load and stations exist, fit bounds to show all stations
    if (stations.length > 0 && !selectedStation && !(map as any)._hasFittedBounds) {
      const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      bounds.extend([userLocation.lat, userLocation.lng]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      (map as any)._hasFittedBounds = true;
    }
  }, [stations, selectedStation]);

  // Center on selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    mapInstanceRef.current.flyTo(
      [selectedStation.latitude, selectedStation.longitude],
      14,
      { animate: true, duration: 0.8 }
    );
  }, [selectedStation]);

  // Handle Locate Me
  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
      animate: true,
      duration: 0.8
    });
  };

  // Handle Center / Re-orient to Station
  const handleNavigateToStation = () => {
    if (!mapInstanceRef.current) return;
    if (selectedStation) {
      mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 15, {
        animate: true,
        duration: 0.8
      });
    } else if (stations.length > 0) {
      mapInstanceRef.current.flyTo([stations[0].latitude, stations[0].longitude], 14, {
        animate: true,
        duration: 0.8
      });
    } else {
      handleLocateMe();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls - Right Side (Layers, Compass/Navigation, Location Crosshair) */}
      <div style={{
        position: 'fixed',
        bottom: hasStationCard ? '326px' : '98px',
        right: '16px',
        zIndex: 36,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'bottom 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Toggle Layers */}
        <button
          onClick={() => setMapLayer(prev => prev === 'osm' ? 'hot' : 'osm')}
          title="Toggle Map Style"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <Layers size={20} strokeWidth={2} />
        </button>

        {/* Center / Navigation to Station */}
        <button
          onClick={handleNavigateToStation}
          title="Center on Station"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1e293b',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <Navigation size={20} strokeWidth={2.2} style={{ transform: 'rotate(45deg)' }} />
        </button>

        {/* Locate Me */}
        <button
          onClick={handleLocateMe}
          title="My Location"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.backgroundColor = '#ecfdf5';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <Crosshair size={22} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};
