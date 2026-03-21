'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';
import type { Category } from '@tfe/shared';
import LocationGate from '@/components/layout/LocationGate';

export default function WorkerOnboarding() {
  const { token, refreshAuth } = useAuth();
  const { lat, lng, hasLocation, requestLocation } = useLocation();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [preferredWorkType, setPreferredWorkType] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Category[]>('/profile/categories')
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!hasLocation) requestLocation();
  }, [hasLocation, requestLocation]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/profile/worker', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          name,
          skills: [],
          categoryIds: selectedCategories,
          preferredWorkType,
          locationLat: lat || 19.076,
          locationLng: lng || 72.877,
        }),
      });
      await refreshAuth();
      router.replace('/swipe');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">What's your name?</h1>
          <p className="text-gray-500 mb-6">This is how employers will see you</p>
          <input
            className="input-field text-lg"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            autoFocus
          />
          <button
            className="btn-primary w-full mt-6"
            disabled={!name.trim()}
            onClick={() => setStep(2)}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">What work do you do?</h1>
          <p className="text-gray-500 mb-6">Select one or more categories</p>
          <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary-500 text-white scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.nameEn}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn-outline flex-1" onClick={() => setStep(1)}>Back</button>
            <button
              className="btn-primary flex-1"
              disabled={selectedCategories.length === 0}
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold mb-2">Preferred work type?</h1>
          <p className="text-gray-500 mb-6">What kind of shifts work best for you?</p>
          <div className="space-y-3">
            {[
              { value: 'full_day', label: 'Full Day', desc: '8-10 hour shifts' },
              { value: 'half_day', label: 'Half Day', desc: '4-5 hour shifts' },
              { value: 'hourly', label: 'Hourly', desc: 'Pay by the hour' },
              { value: 'any', label: 'Any', desc: "I'm flexible" },
            ].map(opt => (
              <button
                key={opt.value}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  preferredWorkType === opt.value
                    ? 'bg-primary-50 border-2 border-primary-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
                onClick={() => setPreferredWorkType(opt.value)}
              >
                <p className="font-semibold">{opt.label}</p>
                <p className="text-sm text-gray-500">{opt.desc}</p>
              </button>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button className="btn-outline flex-1" onClick={() => setStep(2)}>Back</button>
            <button
              className="btn-primary flex-1"
              disabled={!preferredWorkType || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Setting up...' : "Let's Go!"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
