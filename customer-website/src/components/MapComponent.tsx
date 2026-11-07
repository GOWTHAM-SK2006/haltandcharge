import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Navigation, Crosshair, X, MapPin, Zap } from 'lucide-react';
import { Station, TripRoutePlan } from '../types';

interface MapComponentProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station) => void;
  onMapClick?: () => void;
  userLocation: { lat: number; lng: number };
  onRefresh: () => void;
  onOpenFilter: () => void;
  hasStationCard?: boolean;
  activeRoute?: TripRoutePlan | null;
  onClearRoute?: () => void;
  onOpenTripPlanner?: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onMapClick,
  userLocation,
  onRefresh,
  onOpenFilter,
  hasStationCard = false,
  activeRoute = null,
  onClearRoute,
  onOpenTripPlanner
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerGroupRef = useRef<L.FeatureGroup | null>(null);
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

    // If first load and stations exist and no active route, fit bounds to show all stations
    if (!activeRoute && stations.length > 0 && !selectedStation && !(map as any)._hasFittedBounds) {
      const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
      bounds.extend([userLocation.lat, userLocation.lng]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      (map as any)._hasFittedBounds = true;
    }
  }, [stations, selectedStation, activeRoute]);

  // Center on selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStation) return;
    mapInstanceRef.current.flyTo(
      [selectedStation.latitude, selectedStation.longitude],
      14,
      { animate: true, duration: 0.8 }
    );
  }, [selectedStation]);

  // Render & Update Active Trip Route Polyline and Waypoint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerGroupRef.current) {
      map.removeLayer(routeLayerGroupRef.current);
      routeLayerGroupRef.current = null;
    }

    if (!activeRoute || !activeRoute.geometryCoordinates || activeRoute.geometryCoordinates.length < 2) {
      return;
    }

    const featureGroup = L.featureGroup();

    // 1. Route outer casing (glow effect)
    const outerPolyline = L.polyline(activeRoute.geometryCoordinates, {
      color: '#064e3b',
      weight: 8,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    });
    featureGroup.addLayer(outerPolyline);

    // 2. Route core line (vivid emerald green)
    const corePolyline = L.polyline(activeRoute.geometryCoordinates, {
      color: '#10b981',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    });
    featureGroup.addLayer(corePolyline);

    // 3. Origin Marker (Green 'A')
    const originHtml = `
      <div style="background: #059669; color: #ffffff; font-weight: 800; font-size: 11px; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        A
      </div>
    `;
    const originIcon = L.divIcon({
      html: originHtml,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const originMarker = L.marker([activeRoute.origin.lat, activeRoute.origin.lng], { icon: originIcon });
    originMarker.bindPopup(`<strong>Origin:</strong> ${activeRoute.origin.name}`);
    featureGroup.addLayer(originMarker);

    // 4. Destination Marker (Red 'B')
    const destHtml = `
      <div style="background: #dc2626; color: #ffffff; font-weight: 800; font-size: 11px; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        B
      </div>
    `;
    const destIcon = L.divIcon({
      html: destHtml,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const destMarker = L.marker([activeRoute.destination.lat, activeRoute.destination.lng], { icon: destIcon });
    destMarker.bindPopup(`<strong>Destination:</strong> ${activeRoute.destination.name}`);
    featureGroup.addLayer(destMarker);

    // 5. Waypoint Stop Markers for Recommended Charging Halts
    activeRoute.recommendedStops?.forEach((stop) => {
      const stopHtml = `
        <div style="background: #f59e0b; color: #ffffff; font-weight: 900; font-size: 13px; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.45), 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          ⚡
        </div>
      `;
      const stopIcon = L.divIcon({
        html: stopHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const stopMarker = L.marker([stop.station.latitude, stop.station.longitude], { icon: stopIcon });
      stopMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; min-width: 180px;">
          <div style="color: #059669; font-weight: 800; font-size: 11px; text-transform: uppercase;">Recommended Charging Halt</div>
          <strong style="color: #0f172a; font-size: 13px; display: block; margin: 2px 0;">${stop.station.name}</strong>
          <div style="color: #64748b; font-size: 11px;">At Km ${stop.atKm} • Stop for ~${stop.estimatedChargingMinutes} mins</div>
          <div style="color: #059669; font-weight: 700; font-size: 11px; margin-top: 4px;">Charge: ${stop.arrivalBatteryPercent}% → ${stop.chargeToBatteryPercent}% (Est. ₹${stop.estimatedCost})</div>
        </div>
      `);
      featureGroup.addLayer(stopMarker);
    });

    featureGroup.addTo(map);
    routeLayerGroupRef.current = featureGroup;

    // Fit map bounds to show full route smoothly
    try {
      const bounds = featureGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
      }
    } catch (e) {
      console.warn('Error fitting route bounds', e);
    }
  }, [activeRoute]);

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

      {/* Active Trip Route Floating Banner */}
      {activeRoute && (
        <div style={{
          position: 'fixed',
          top: '90px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35,
          width: 'calc(100% - 32px)',
          maxWidth: '520px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.16)',
          border: '1.5px solid #a7f3d0',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Navigation size={18} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Trip: {activeRoute.origin.name} → {activeRoute.destination.name}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                {activeRoute.totalDistanceKm} km • ~{Math.floor(activeRoute.totalDriveDurationMinutes / 60)}h {activeRoute.totalDriveDurationMinutes % 60}m • {activeRoute.recommendedStops.length > 0 ? `${activeRoute.recommendedStops.length} charging halt` : 'Direct drive'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {onOpenTripPlanner && (
              <button
                type="button"
                onClick={onOpenTripPlanner}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0',
                  background: '#ecfdf5',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Plan Details
              </button>
            )}

            {onClearRoute && (
              <button
                type="button"
                onClick={onClearRoute}
                title="Clear Planned Route"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

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
