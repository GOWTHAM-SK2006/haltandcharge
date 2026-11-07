import React, { useState, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { TopBar, FilterCategory } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { StationCard } from './components/StationCard';
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

  // Navigation, Filter & Modal States
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('map');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isCardDismissed, setIsCardDismissed] = useState(false);
  const [showFullStationModal, setShowFullStationModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFavouritesModal, setShowFavouritesModal] = useState(false);
  const [showWalletTopUp, setShowWalletTopUp] = useState(false);
  const [showActiveSessionModal, setShowActiveSessionModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scanInitialChargerId, setScanInitialChargerId] = useState<string | undefined>(undefined);

  // User Coordinates (Default Bengaluru center)
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  // Try GPS Geolocation & Authentication Router on mount
  useEffect(() => {
    // 1. If an Admin is already authenticated in this browser, redirect to the real Admin Dashboard
    const adminToken = localStorage.getItem('hc_admin_token');
    const customerToken = localStorage.getItem('hc_customer_token');

    if (adminToken && !customerToken) {
      window.location.replace('/admin/');
      return;
    }

    // 2. If no user is logged in at all, prompt Sign In immediately
    if (!customerToken && !adminToken) {
      setShowAuthModal(true);
    }

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

      // If the loaded profile belongs to an Admin, NEVER display the customer UI!
      // Immediately transfer them to the official Admin Dashboard (/admin/)
      if (prof && (prof.role === 'ROLE_ADMIN' || prof.email === 'admin@haltcharge.com')) {
        if (token) {
          localStorage.setItem('hc_admin_token', token);
        }
        localStorage.removeItem('hc_customer_token');
        window.location.replace('/admin/');
        return;
      }

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

  // Filter stations based on selected horizontal chip
  const filteredStations = stations.filter(station => {
    if (activeFilter === 'fast') {
      return station.chargers?.some(c => c.chargerType === 'DC' && (c.maxPowerKw ?? 0) >= 50);
    }
    if (activeFilter === 'available') {
      const avail = (station.availableChargers ?? 0) > 0 || station.chargers?.some(c => c.status === 'AVAILABLE');
      return avail && station.isActive;
    }
    if (activeFilter === 'favourites') {
      return favourites.some(f => f.id === station.id);
    }
    return true;
  });

  // Displayed station for bottom floating card
  const displayedStation = isCardDismissed
    ? null
    : (selectedStation || (filteredStations.length > 0 ? filteredStations[0] : (stations.length > 0 ? stations[0] : null)));

  // Determine if floating station card should be visible
  const hasFloatingStationCard = activeNavTab === 'map' &&
    !showSearch &&
    !showTripPlanner &&
    !showProfileModal &&
    !showFavouritesModal &&
    !showWalletTopUp &&
    !showActiveSessionModal &&
    !showAuthModal &&
    !showFullStationModal &&
    displayedStation !== null;

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    setActiveNavTab(tab);
    setShowProfileModal(false);
    setShowFavouritesModal(false);
    if (tab === 'map') {
      setShowTripPlanner(false);
      setShowWalletTopUp(false);
    } else if (tab === 'trip') {
      setShowTripPlanner(true);
    } else if (tab === 'wallet') {
      setShowWalletTopUp(true);
    }
  };

  // Handle Station Marker Click -> Show card
  const handleSelectStation = (station: Station) => {
    setIsCardDismissed(false);
    setSelectedStation(station);
  };

  // Handle Map Click -> Dismiss card
  const handleMapClick = () => {
    setIsCardDismissed(true);
    setSelectedStation(null);
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

  // Start Charging from Station Card
  const handleStationStartCharge = (st: Station) => {
    const availableCharger = st.chargers?.find(c => c.status === 'AVAILABLE') || st.chargers?.[0];
    if (availableCharger) {
      handleStartChargeOnCharger(availableCharger);
    } else {
      setActiveNavTab('scan');
    }
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
    localStorage.removeItem('hc_admin_token');
    setToken(null);
    setProfile(null);
    setActiveSession(null);
    setLocalWalletOffset(0);
    setShowAuthModal(true);
  };

  // Auth Success
  const handleAuthSuccess = (newToken: string, role?: string) => {
    if (role === 'ROLE_ADMIN') {
      localStorage.setItem('hc_admin_token', newToken);
      localStorage.removeItem('hc_customer_token');
      window.location.replace('/admin/');
      return;
    }
    localStorage.setItem('hc_customer_token', newToken);
    localStorage.removeItem('hc_admin_token');
    setToken(newToken);
    setShowAuthModal(false);
    fetchData();
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100dvh',
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--hc-bg-page)'
    }}>
      {/* 1. Full-Screen Interactive Leaflet Map */}
      <MapComponent
        stations={filteredStations}
        selectedStation={displayedStation}
        onSelectStation={handleSelectStation}
        onMapClick={handleMapClick}
        userLocation={userLocation}
        onRefresh={fetchData}
        onOpenFilter={() => setShowSearch(true)}
        hasStationCard={hasFloatingStationCard}
      />

      {/* 2. Top Floating Navigation Bar (Matches reference design) */}
      <TopBar
        walletBalance={totalWalletBalance}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onOpenSearch={() => {
          setShowProfileModal(false);
          setShowSearch(true);
        }}
        onOpenProfile={() => {
          setShowSearch(false);
          setShowTripPlanner(false);
          setShowProfileModal(true);
        }}
        onOpenWallet={() => {
          setShowProfileModal(false);
          setShowWalletTopUp(true);
        }}
      />

      {/* 3. Floating Station Details Card (Matches reference design) */}
      {hasFloatingStationCard && displayedStation && (
        <StationCard
          station={displayedStation}
          isFavourite={favourites.some(f => f.id === displayedStation.id)}
          onToggleFavourite={handleToggleFavourite}
          onViewDetails={st => {
            setSelectedStation(st);
            setShowFullStationModal(true);
          }}
          onStartCharge={handleStationStartCharge}
        />
      )}

      {/* 4. Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        isSessionActive={!!activeSession && activeSession.status === 'IN_PROGRESS'}
        onOpenActiveSession={() => setShowActiveSessionModal(true)}
      />

      {/* 5. Station Detail Full Modal (When View Details is clicked) */}
      {showFullStationModal && selectedStation && (
        <StationDetailModal
          station={selectedStation}
          isFavourite={favourites.some(f => f.id === selectedStation.id)}
          onToggleFavourite={handleToggleFavourite}
          onStartCharge={handleStartChargeOnCharger}
          onClose={() => setShowFullStationModal(false)}
        />
      )}

      {/* 6. Search Modal */}
      {showSearch && (
        <SearchModal
          stations={stations}
          onSelectStation={st => {
            setIsCardDismissed(false);
            setSelectedStation(st);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* 7. Trip Planner Modal */}
      {(showTripPlanner || activeNavTab === 'trip') && (
        <TripPlannerModal
          stations={stations}
          onSelectStation={st => {
            setIsCardDismissed(false);
            setSelectedStation(st);
            setShowTripPlanner(false);
            setActiveNavTab('map');
          }}
          onClose={() => {
            setShowTripPlanner(false);
            setActiveNavTab('map');
          }}
        />
      )}

      {/* 8. My EVs Modal */}
      {activeNavTab === 'evs' && (
        <MyEvsModal
          vehicles={vehicles}
          onAddVehicle={handleAddVehicle}
          onClose={() => setActiveNavTab('map')}
          isAuthenticated={!!token}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 9. Scan & Instant Charge Modal */}
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

      {/* 10. Favourites Modal (Opened from Profile -> Favourites) */}
      {showFavouritesModal && (
        <FavouritesModal
          favourites={favourites}
          onSelectStation={st => {
            setIsCardDismissed(false);
            setSelectedStation(st);
            setShowFavouritesModal(false);
            setActiveNavTab('map');
          }}
          onRemoveFavourite={handleToggleFavourite}
          onClose={() => setShowFavouritesModal(false)}
          isAuthenticated={!!token}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 11. Profile & Account Modal (Opened by Circular Profile Icon) */}
      {showProfileModal && (
        <MoreModal
          profile={profile}
          walletBalance={totalWalletBalance}
          favouritesCount={favourites.length}
          sessionHistory={sessionHistory}
          activeSession={activeSession}
          onOpenActiveSession={() => setShowActiveSessionModal(true)}
          onOpenWallet={() => {
            setShowProfileModal(false);
            setShowWalletTopUp(true);
          }}
          onOpenFavourites={() => {
            setShowProfileModal(false);
            setShowFavouritesModal(true);
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* 12. Live Active Session Cockpit Modal */}
      {showActiveSessionModal && activeSession && (
        <ActiveSessionModal
          session={activeSession}
          onStopSession={handleStopChargingSession}
          onClose={() => setShowActiveSessionModal(false)}
        />
      )}

      {/* 13. Auth Sign In / Register Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* 14. Wallet Modal (Opened from Bottom Navigation Bar or Profile) */}
      {(showWalletTopUp || activeNavTab === 'wallet') && (
        <WalletTopUpModal
          currentBalance={totalWalletBalance}
          onTopUp={handleWalletTopUp}
          onClose={() => {
            setShowWalletTopUp(false);
            setActiveNavTab('map');
          }}
        />
      )}
    </div>
  );
}
