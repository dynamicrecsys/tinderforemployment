'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';

export default function EmployerOnboarding() {
  const { token, refreshAuth } = useAuth();
  const { lat, lng, hasLocation, requestLocation } = useLocation();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasLocation) requestLocation();
  }, [hasLocation, requestLocation]);

  const handleSubmit = async () => {
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
          locationLat: lat || 19.076,
          locationLng: lng || 72.877,
          locationText: '',
        }),
      });
      await refreshAuth();
      router.replace('/employer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <div className="flex gap-2 mb-8">
        {[1, 2].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Your business name?</h1>
          <p className="text-gray-500 mb-6">Workers will see this on job listings</p>
          <input
            className="input-field text-lg mb-4"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Business or company name"
            autoFocus
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
          <input
            className="input-field"
            value={contactPerson}
            onChange={e => setContactPerson(e.target.value)}
            placeholder="Contact person name"
          />
          <button
            className="btn-primary w-full mt-6"
            disabled={!businessName.trim() || !contactPerson.trim()}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">What type of business?</h1>
          <p className="text-gray-500 mb-6">Helps workers understand your work</p>
          <div className="space-y-3">
            {[
              'Construction', 'Restaurant / Hotel', 'Factory / Manufacturing',
              'Retail / Shop', 'Transport / Logistics', 'Household / Domestic',
              'Security Services', 'Other',
            ].map(type => (
              <button
                key={type}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  businessType === type
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setBusinessType(type)}
              >
                <p className="font-semibold">{type}</p>
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button className="btn-outline flex-1" onClick={() => setStep(1)}>Back</button>
            <button
              className="btn-primary flex-1"
              disabled={!businessType || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Setting up...' : "Start Hiring!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
