import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { MapComponent } from './components/MapComponent';
import { TopBar, FilterCategory } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { StationCard } from './components/StationCard';
import { StationDetailModal } from './components/StationDetailModal';
import { FilterModal, FilterCriteria, defaultFilterCriteria, matchesFilterCriteria, countActiveFilters } from './components/FilterModal';
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
import { Station, Charger, Vehicle, ChargingSession, UserProfile, TripRoutePlan } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hc_customer_token'));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | undefined>(undefined);

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
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>(defaultFilterCriteria);
  const [showFilterModal, setShowFilterModal] = useState(false);
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
  const [activeRoutePlan, setActiveRoutePlan] = useState<TripRoutePlan | null>(null);

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

    // 2. Check for Universal QR scanned charger identifier in URL path, query params, or hash
    let scannedFromUrl: string | null = null;
    try {
      // A. Path match: /scan/IDENTIFIER
      const pathMatch = window.location.pathname.match(/\/scan\/([a-zA-Z0-9\-_]+)/i);
      if (pathMatch && pathMatch[1]) {
        scannedFromUrl = decodeURIComponent(pathMatch[1]).trim();
      }

      // B. Query param: ?scan=IDENTIFIER or ?charger=IDENTIFIER
      if (!scannedFromUrl && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        const paramVal = searchParams.get('scan') || searchParams.get('charger');
        if (paramVal) {
          scannedFromUrl = decodeURIComponent(paramVal).trim();
        }
      }

      // C. Hash match: #/scan/IDENTIFIER
      if (!scannedFromUrl && window.location.hash) {
        const hashMatch = window.location.hash.match(/\/scan\/([a-zA-Z0-9\-_]+)/i);
        if (hashMatch && hashMatch[1]) {
          scannedFromUrl = decodeURIComponent(hashMatch[1]).trim();
        }
      }
    } catch (e) {
      console.warn('Error reading scan parameters:', e);
    }

    const pendingScan = scannedFromUrl || sessionStorage.getItem('hc_pending_scan');

    if (pendingScan) {
      sessionStorage.setItem('hc_pending_scan', pendingScan);
      setScanInitialChargerId(pendingScan);

      if (customerToken) {
        // Customer is already authenticated: directly open the scanned charger confirmation cockpit!
        setActiveNavTab('scan');
        setShowAuthModal(false);
      } else {
        // Customer is NOT authenticated: prompt Sign In / Register while keeping scanned dispenser attached
        setShowAuthModal(true);
      }

      // Clean URL back to root if it was opened via /scan/ so back button works cleanly
      if (scannedFromUrl && window.history.replaceState) {
        window.history.replaceState({}, document.title, '/');
      }
    } else {
      // 3. Normal initial visit: If no user is logged in at all, prompt Sign In immediately
      if (!customerToken && !adminToken) {
        setShowAuthModal(true);
      }
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
      if (!token) {
        // When unauthenticated, ONLY fetch public stations - completely wipe customer data
        const stList = await apiRequest<Station[]>(`/api/stations?lat=${userLocation.lat}&lng=${userLocation.lng}`).catch(() => []);
        setStations(stList);
        setProfile(null);
        setVehicles([]);
        setFavourites([]);
        setActiveSession(null);
        setSessionHistory([]);
        setLocalWalletOffset(0);
        return;
      }

      const [stList, prof, vehList, favs, actSes, sesHist] = await Promise.all([
        apiRequest<Station[]>(`/api/stations?lat=${userLocation.lat}&lng=${userLocation.lng}`).catch(() => []),
        apiRequest<UserProfile>('/api/me').catch(() => null),
        apiRequest<Vehicle[]>('/api/vehicles').catch(() => []),
        apiRequest<Station[]>('/api/me/favourites').catch(() => []),
        apiRequest<ChargingSession>('/api/charging-sessions/active').catch(() => null),
        apiRequest<ChargingSession[]>('/api/charging-sessions').catch(() => [])
      ]);

      // If the loaded profile belongs to an Admin, NEVER display the customer UI!
      // Immediately transfer them to the official Admin Dashboard (/admin/)
      if (prof && (prof.role === 'ROLE_ADMIN' || prof.email === 'admin@haltcharge.com')) {
        localStorage.setItem('hc_admin_token', token);
        localStorage.removeItem('hc_customer_token');
        window.location.replace('/admin/');
        return;
      }

      setStations(stList);
      setProfile(prof);
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

  // Auto-dismiss toast notification after 4.5s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Sync logout across tabs, prevent browser back from showing authenticated data, handle unauthorized
  useEffect(() => {
    const handlePopState = () => {
      const currentToken = localStorage.getItem('hc_customer_token');
      if (!currentToken) {
        setToken(null);
        setProfile(null);
        setVehicles([]);
        setFavourites([]);
        setActiveSession(null);
        setSessionHistory([]);
        setLocalWalletOffset(0);
        setShowProfileModal(false);
        setShowFavouritesModal(false);
        setShowWalletTopUp(false);
        setShowActiveSessionModal(false);
        setShowTripPlanner(false);
        setActiveNavTab('map');
        setShowAuthModal(true);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hc_customer_token' && !e.newValue) {
        handleLogout(true);
      }
    };

    const handleUnauthorized = () => {
      handleLogout(true);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hc_unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hc_unauthorized', handleUnauthorized);
    };
  }, []);

  // Wallet Balance calculation
  const totalWalletBalance = (profile?.walletBalance ?? 0) + localWalletOffset;

  // Total active filter count
  const activeFiltersCount = countActiveFilters(filterCriteria);

  // Filter stations based on horizontal chips AND full-panel criteria
  const filteredStations = stations.filter(station => {
    // 1. Horizontal chip quick filter
    if (activeFilter === 'fast') {
      const isFast = station.chargers?.some(c => c.chargerType === 'DC' && (c.maxPowerKw ?? 0) >= 50);
      if (!isFast) return false;
    }
    if (activeFilter === 'available') {
      const avail = (station.availableChargers ?? 0) > 0 || station.chargers?.some(c => c.status === 'AVAILABLE');
      if (!avail || !station.isActive) return false;
    }
    if (activeFilter === 'favourites') {
      if (!favourites.some(f => f.id === station.id)) return false;
    }

    // 2. Full-panel multi-category criteria
    return matchesFilterCriteria(station, filterCriteria, vehicles, userLocation);
  });

  // Displayed station for bottom floating card
  const displayedStation = isCardDismissed
    ? null
    : (selectedStation || (filteredStations.length > 0 ? filteredStations[0] : (stations.length > 0 ? stations[0] : null)));

  // Determine if floating station card should be visible
  const hasFloatingStationCard = activeNavTab === 'map' &&
    !showSearch &&
    !showFilterModal &&
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
    if (tab === 'map') {
      setActiveNavTab('map');
      setShowProfileModal(false);
      setShowFavouritesModal(false);
      setShowTripPlanner(false);
      setShowWalletTopUp(false);
      return;
    }

    if (!token) {
      setShowAuthModal(true);
      return;
    }

    setActiveNavTab(tab);
    setShowProfileModal(false);
    setShowFavouritesModal(false);
    if (tab === 'trip') {
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
    if (!token) {
      sessionStorage.setItem('hc_pending_scan', charger.identifier);
      setScanInitialChargerId(charger.identifier);
      setShowAuthModal(true);
      return;
    }
    setScanInitialChargerId(charger.identifier);
    setActiveNavTab('scan');
  };

  // Start Charging from Station Card
  const handleStationStartCharge = (st: Station) => {
    const availableCharger = st.chargers?.find(c => c.status === 'AVAILABLE') || st.chargers?.[0];
    if (!token) {
      if (availableCharger) {
        sessionStorage.setItem('hc_pending_scan', availableCharger.identifier);
        setScanInitialChargerId(availableCharger.identifier);
      }
      setShowAuthModal(true);
      return;
    }
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
  const handleLogout = async (showNotification = true) => {
    // 1. Notify backend logout endpoint
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}

    // 2. Permanently remove all tokens and auth session storage
    localStorage.removeItem('hc_customer_token');
    localStorage.removeItem('hc_admin_token');
    sessionStorage.removeItem('hc_pending_scan');
    sessionStorage.clear();

    // 3. Immediately clear all customer state in React context/state
    setToken(null);
    setProfile(null);
    setVehicles([]);
    setFavourites([]);
    setActiveSession(null);
    setSessionHistory([]);
    setLocalWalletOffset(0);
    setSelectedStation(null);
    setActiveRoutePlan(null);
    setScanInitialChargerId(undefined);

    // 4. Close all protected customer modals immediately
    setShowProfileModal(false);
    setShowFavouritesModal(false);
    setShowWalletTopUp(false);
    setShowActiveSessionModal(false);
    setShowTripPlanner(false);
    setShowFullStationModal(false);
    setShowFilterModal(false);
    setShowSearch(false);
    setIsCardDismissed(false);
    setActiveNavTab('map');
    setActiveFilter('all');

    // 5. Show toast notification "Logged out successfully"
    if (showNotification) {
      setToastMessage('Logged out successfully');
      setAuthNotice('Logged out successfully. Enter your credentials to sign in.');
    }

    // 6. Redirect immediately to Sign In modal
    setShowAuthModal(true);

    // 7. Update browser history to prevent Back button from restoring authenticated page
    if (window.history && window.history.replaceState) {
      window.history.replaceState({ loggedOut: true }, document.title, '/');
      window.history.pushState({ loggedOut: true }, document.title, '/#/login');
    }
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
    setAuthNotice(undefined);
    setToastMessage('Signed in successfully');

    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, '/');
    }

    // Check if there was a pending QR scan waiting for authentication
    const pendingScan = sessionStorage.getItem('hc_pending_scan') || scanInitialChargerId;
    if (pendingScan) {
      setScanInitialChargerId(pendingScan);
      setActiveNavTab('scan');
      sessionStorage.removeItem('hc_pending_scan');
    }

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
        onOpenFilter={() => setShowFilterModal(true)}
        hasStationCard={hasFloatingStationCard}
        activeRoute={activeRoutePlan}
        onClearRoute={() => setActiveRoutePlan(null)}
        onOpenTripPlanner={() => setShowTripPlanner(true)}
      />

      {/* 2. Top Floating Navigation Bar (Matches reference design) */}
      <TopBar
        walletBalance={totalWalletBalance}
        isAuthenticated={!!token}
        activeFilter={activeFilter}
        onFilterChange={f => {
          if (f === 'favourites' && !token) {
            setShowAuthModal(true);
            return;
          }
          setActiveFilter(f);
        }}
        activeFiltersCount={activeFiltersCount}
        onOpenSearch={() => {
          setShowProfileModal(false);
          setShowSearch(true);
        }}
        onOpenFilter={() => {
          setShowProfileModal(false);
          setShowSearch(false);
          setShowFilterModal(true);
        }}
        onOpenProfile={() => {
          if (!token) {
            setShowAuthModal(true);
            return;
          }
          setShowSearch(false);
          setShowTripPlanner(false);
          setShowProfileModal(true);
        }}
        onOpenWallet={() => {
          if (!token) {
            setShowAuthModal(true);
            return;
          }
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
          vehicles={vehicles}
          userLocation={userLocation}
          activeRoute={activeRoutePlan}
          onApplyRoute={plan => {
            setActiveRoutePlan(plan);
          }}
          onClearRoute={() => setActiveRoutePlan(null)}
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
          onStartChargeOnCharger={handleStartChargeOnCharger}
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
            sessionStorage.removeItem('hc_pending_scan');
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
          vehicles={vehicles}
          onOpenVehicles={() => {
            setShowProfileModal(false);
            setActiveNavTab('evs');
          }}
          onOpenTripPlanner={() => {
            setShowProfileModal(false);
            setShowTripPlanner(true);
          }}
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
          onUpdateProfile={async (data) => {
            await apiRequest('/api/me', {
              method: 'PUT',
              body: JSON.stringify(data)
            });
            fetchData();
          }}
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
          noticeMessage={authNotice}
          onSuccess={handleAuthSuccess}
          onClose={() => {
            setShowAuthModal(false);
            setAuthNotice(undefined);
          }}
          pendingChargerId={scanInitialChargerId || sessionStorage.getItem('hc_pending_scan') || undefined}
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

      {/* 15. Advanced Multi-Category Full-Screen Filter Panel */}
      {showFilterModal && (
        <FilterModal
          stations={stations}
          vehicles={vehicles}
          userLocation={userLocation}
          initialCriteria={filterCriteria}
          onApply={criteria => {
            setFilterCriteria(criteria);
            setIsCardDismissed(false);
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* 16. Floating Toast Notification (Logged out successfully / Sign in notice) */}
      {toastMessage && (
        <div
          className="animate-slide-up"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            backgroundColor: '#064e3b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 700,
            border: '1.5px solid #34d399',
            backdropFilter: 'blur(8px)',
            maxWidth: '92vw'
          }}
        >
          <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d1fae5',
              cursor: 'pointer',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
