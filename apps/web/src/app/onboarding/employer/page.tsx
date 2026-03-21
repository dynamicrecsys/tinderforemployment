'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';
import LocationGate from '@/components/layout/LocationGate';

export default function EmployerOnboarding() {
  const { token, refreshAuth } = useAuth();
  const { lat, lng, hasLocation } = useLocation();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!businessName || !contactPerson || !locationText) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/profile/employer', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          businessName,
          contactPerson,
          businessType: businessType || undefined,
          locationLat: lat!,
          locationLng: lng!,
          locationText,
        }),
      });
      await refreshAuth();
      router.replace('/employer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (!hasLocation) return <LocationGate />;

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Set up your business</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
          <input className="input-field" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
          <input className="input-field" value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
          <input className="input-field" value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="e.g. Construction, Restaurant, Factory" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Location *</label>
          <input className="input-field" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="e.g. Bandra, Mumbai" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Setting up...' : 'Start Hiring'}
        </button>
      </div>
    </div>
  );
}
