import React, { useState, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { StationDetailModal } from './components/StationDetailModal';
import { SearchModal } from './components/SearchModal';
import { TripPlannerModal } from './components/TripPlannerModal';
import { MyEvsModal } from './components/MyEvsModal';
import { ScanChargeModal } from './components/ScanChargeModal';
import { FavouritesModal } from './components/FavouritesModal';
import { MoreModal } from './components/MoreModal';
import { ActiveSessionModal } from './components/ActiveSessionModal';
import { AuthModal } from './components/AuthModal';
import { WalletTopUpModal } from './components/WalletTopUpModal';
import { apiRequest } from './api';
import { Station, Charger, Vehicle, ChargingSession, UserProfile } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hc_customer_token'));

  // App Data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [localWalletOffset, setLocalWalletOffset] = useState<number>(0);
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favourites, setFavourites] = useState<Station[]>([]);
  const [activeSession, setActiveSession] = useState<ChargingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<ChargingSession[]>([]);

  // Navigation & Modal States
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showWalletTopUp, setShowWalletTopUp] = useState(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scanInitialChargerId, setScanInitialChargerId] = useState<string | undefined>(undefined);

  // User Coordinates (Default Bengaluru center)
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  // Try GPS Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        err => {
          console.log('Using default location', err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Fetch Data from Backend APIs
  const fetchData = async () => {
    try {
      const [stList, prof, vehList, favs, actSes, sesHist] = await Promise.all([
        apiRequest<Station[]>(`/api/stations?lat=${userLocation.lat}&lng=${userLocation.lng}`).catch(() => []),
        token ? apiRequest<UserProfile>('/api/me').catch(() => null) : Promise.resolve(null),
        token ? apiRequest<Vehicle[]>('/api/vehicles').catch(() => []) : Promise.resolve([]),
        token ? apiRequest<Station[]>('/api/me/favourites').catch(() => []) : Promise.resolve([]),
        token ? apiRequest<ChargingSession>('/api/charging-sessions/active').catch(() => null) : Promise.resolve(null),
        token ? apiRequest<ChargingSession[]>('/api/charging-sessions').catch(() => []) : Promise.resolve([])
      ]);

      setStations(stList);
      if (prof) setProfile(prof);
      setVehicles(vehList);
      setFavourites(favs);
      setActiveSession(actSes);
      setSessionHistory(sesHist);

      // Keep selectedStation data in sync
      if (selectedStation) {
        const fresh = stList.find(s => s.id === selectedStation.id);
        if (fresh) setSelectedStation(fresh);
      }
    } catch (err) {
      console.error('Error fetching Halt & Charge data', err);
    }
  };

  // Poll for real-time telemetry and charger status updates every 3s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [token, userLocation]);

  // Wallet Balance calculation
  const totalWalletBalance = (profile?.walletBalance ?? 0) + localWalletOffset;

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    setActiveNavTab(tab);
    if (tab === 'map') {
      setSelectedStation(null);
    }
  };

  // Handle Station Marker Click
  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
  };

  // Toggle Favourite Station
  const handleToggleFavourite = async (stationId: number) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    const isFav = favourites.some(f => f.id === stationId);
    try {
      if (isFav) {
        await apiRequest(`/api/me/favourites/${stationId}`, { method: 'DELETE' });
      } else {
        await apiRequest(`/api/me/favourites/${stationId}`, { method: 'POST' });
      }
      fetchData();
    } catch (err: any) {
      console.error('Failed to toggle favourite', err);
    }
  };

  // Start Charging on a specific charger
  const handleStartChargeOnCharger = (charger: Charger) => {
    setScanInitialChargerId(charger.identifier);
    setActiveNavTab('scan');
  };

  // Initiate Charging Session API
  const handleStartChargingSession = async (chargerIdentifier: string, vehicleId?: number) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    const res = await apiRequest<ChargingSession>('/api/charging-sessions', {
      method: 'POST',
      body: JSON.stringify({
        chargerIdentifier,
        vehicleId: vehicleId || vehicles[0]?.id
      })
    });
    setActiveSession(res);
    setShowActiveSessionModal(true);
    fetchData();
  };

  // Stop Charging Session API
  const handleStopChargingSession = async (sessionId: number) => {
    await apiRequest(`/api/charging-sessions/${sessionId}/stop`, {
      method: 'POST'
    });
    setActiveSession(null);
    fetchData();
  };

  // Add Vehicle API
  const handleAddVehicle = async (vehicleData: Partial<Vehicle>) => {
    await apiRequest('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
    fetchData();
  };

  // Wallet Top Up
  const handleWalletTopUp = (amount: number) => {
    setLocalWalletOffset(prev => prev + amount);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('hc_customer_token');
    setToken(null);
    setProfile(null);
    setActiveSession(null);
    setLocalWalletOffset(0);
  };

  // Auth Success
  const handleAuthSuccess = (newToken: string, role?: string) => {
    if (role === 'ROLE_ADMIN') {
      localStorage.setItem('hc_admin_token', newToken);
      localStorage.setItem('hc_customer_token', newToken);
      window.location.href = '/admin/';
      return;
    }
    localStorage.setItem('hc_customer_token', newToken);
    setToken(newToken);
    fetchData();
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--hc-bg-page)'
    }}>
      {/* 1. Full-Screen Interactive Leaflet Map */}
      <MapComponent
        stations={stations}
        selectedStation={selectedStation}
        onSelectStation={handleSelectStation}
        userLocation={userLocation}
        onRefresh={fetchData}
        onOpenFilter={() => setShowSearch(true)}
      />

      {/* 2. Top Floating Navigation Bar (Matches ZEON reference layout) */}
      <TopBar
        walletBalance={totalWalletBalance}
        onOpenSearch={() => setShowSearch(true)}
        onOpenTripPlanner={() => setShowTripPlanner(true)}
        onOpenWallet={() => setShowWalletTopUp(true)}
      />

      {/* 3. Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        isSessionActive={!!activeSession && activeSession.status === 'IN_PROGRESS'}
        onOpenActiveSession={() => setShowActiveSessionModal(true)}
      />

      {/* 4. Station Detail Bottom Sheet (When station marker is clicked) */}
      {selectedStation && (
        <StationDetailModal
          station={selectedStation}
          isFavourite={favourites.some(f => f.id === selectedStation.id)}
          onToggleFavourite={handleToggleFavourite}
          onStartCharge={handleStartChargeOnCharger}
          onClose={() => setSelectedStation(null)}
        />
      )}

      {/* 5. Search Modal */}
      {showSearch && (
        <SearchModal
          stations={stations}
          onSelectStation={st => {
            setSelectedStation(st);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* 6. Trip Planner Modal */}
      {showTripPlanner && (
        <TripPlannerModal
          stations={stations}
          onSelectStation={st => {
            setSelectedStation(st);
            setShowTripPlanner(false);
          }}
          onClose={() => setShowTripPlanner(false)}
        />
      )}

      {/* 7. My EVs Modal */}
      {activeNavTab === 'evs' && (
        <MyEvsModal
          vehicles={vehicles}
          onAddVehicle={handleAddVehicle}
          onClose={() => setActiveNavTab('map')}
          isAuthenticated={!!token}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 8. Scan & Instant Charge Modal */}
      {activeNavTab === 'scan' && (
        <ScanChargeModal
          stations={stations}
          vehicles={vehicles}
          selectedChargerId={scanInitialChargerId}
          onStartCharging={handleStartChargingSession}
          onClose={() => {
            setActiveNavTab('map');
            setScanInitialChargerId(undefined);
          }}
          isAuthenticated={!!token}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 9. Favourites Modal */}
      {activeNavTab === 'favourites' && (
        <FavouritesModal
          favourites={favourites}
          onSelectStation={st => {
            setSelectedStation(st);
            setActiveNavTab('map');
          }}
          onRemoveFavourite={handleToggleFavourite}
          onClose={() => setActiveNavTab('map')}
          isAuthenticated={!!token}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 10. More / Account Menu Modal */}
      {activeNavTab === 'more' && (
        <MoreModal
          profile={profile}
          walletBalance={totalWalletBalance}
          sessionHistory={sessionHistory}
          activeSession={activeSession}
          onOpenActiveSession={() => setShowActiveSessionModal(true)}
          onOpenWallet={() => setShowWalletTopUp(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onClose={() => setActiveNavTab('map')}
        />
      )}

      {/* 11. Live Active Session Cockpit Modal */}
      {showActiveSessionModal && activeSession && (
        <ActiveSessionModal
          session={activeSession}
          onStopSession={handleStopChargingSession}
          onClose={() => setShowActiveSessionModal(false)}
        />
      )}

      {/* 12. Auth Sign In / Register Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* 13. Wallet Top Up Modal */}
      {showWalletTopUp && (
        <WalletTopUpModal
          currentBalance={totalWalletBalance}
          onTopUp={handleWalletTopUp}
          onClose={() => setShowWalletTopUp(false)}
        />
      )}
    </div>
  );
}
