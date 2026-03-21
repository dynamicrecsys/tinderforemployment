'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { apiFetch } from '@/lib/api';

interface LocationState {
  lat: number | null;
  lng: number | null;
  locationText: string | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  hasLocation: boolean;
}

const LocationContext = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBackend = useCallback(async (latitude: number, longitude: number) => {
    if (!token) return;
    try {
      await apiFetch('/profile/me/location', {
        method: 'PATCH',
        token,
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });
    } catch (err) {
      console.error('Failed to update location on server:', err);
    }
  }, [token]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        setLoading(false);
        updateBackend(latitude, longitude);
      },
      (err) => {
        setError('Location permission denied. Please enable location access.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateBackend]);

  return (
    <LocationContext.Provider value={{
      lat, lng, locationText, loading, error,
      requestLocation,
      hasLocation: lat !== null && lng !== null,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
