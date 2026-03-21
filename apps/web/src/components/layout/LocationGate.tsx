'use client';

import { useLocation } from '@/providers/LocationProvider';

export default function LocationGate() {
  const { loading, error, requestLocation } = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-4xl mb-6">
        <span role="img" aria-label="location">&#128205;</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Enable Location</h2>
      <p className="text-gray-500 mb-8 max-w-xs">
        We need your location to find jobs and workers near you. Your location stays private.
      </p>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <button
        className="btn-primary w-full max-w-xs"
        onClick={requestLocation}
        disabled={loading}
      >
        {loading ? 'Getting location...' : 'Allow Location'}
      </button>
    </div>
  );
}
