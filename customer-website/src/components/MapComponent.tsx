import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, RefreshCw, Crosshair, Filter } from 'lucide-react';
import { Station } from '../types';

interface MapComponentProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  userLocation: { lat: number; lng: number };
  onRefresh: () => void;
  onOpenFilter: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  userLocation,
  onRefresh,
  onOpenFilter
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapLayer, setMapLayer] = useState<'osm' | 'hot'>('osm');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Render & Update Station Markers
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
      const isAvailable = (station.availableChargers ?? 0) > 0;
      const statusClass = !station.isActive ? 'offline' : (isAvailable ? '' : 'occupied');
      const selectedClass = isSelected ? 'selected' : '';

      const markerHtml = `
        <div class="hc-station-pin">
          <div class="hc-pin-bubble ${statusClass} ${selectedClass}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div class="hc-pin-arrow"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [40, 48],
        iconAnchor: [20, 48],
        popupAnchor: [0, -48]
      });

      if (markersRef.current[station.id]) {
        markersRef.current[station.id].setIcon(customIcon);
        markersRef.current[station.id].setLatLng([station.latitude, station.longitude]);
      } else {
        const marker = L.marker([station.latitude, station.longitude], { icon: customIcon })
          .addTo(map)
          .on('click', () => {
            onSelectStation(station);
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

  // Handle Refresh Click
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls - Bottom Left (Layers & Refresh, Fixed on Viewport Above Bottom Nav) */}
      <div style={{
        position: 'fixed',
        bottom: '98px',
        left: '16px',
        zIndex: 35,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '10px'
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

        {/* Refresh Stations */}
        <button
          onClick={handleRefreshClick}
          title="Refresh Stations"
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
          <RefreshCw size={20} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Floating Map Controls - Bottom Right (Current Location, Fixed on Viewport Above Bottom Nav) */}
      <div style={{
        position: 'fixed',
        bottom: '98px',
        right: '16px',
        zIndex: 35,
        pointerEvents: 'auto'
      }}>
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

