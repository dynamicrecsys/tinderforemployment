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
  const { lat, lng, hasLocation } = useLocation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [preferredWorkType, setPreferredWorkType] = useState<string>('any');
  const [bio, setBio] = useState('');
  const [locationText, setLocationText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Category[]>('/profile/categories')
      .then(setCategories)
      .catch(console.error);
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name || !skills || selectedCategories.length === 0 || !locationText) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/profile/worker', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          name,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          categoryIds: selectedCategories,
          experienceYears,
          preferredWorkType,
          bio: bio || undefined,
          locationLat: lat!,
          locationLng: lng!,
          locationText,
        }),
      });
      await refreshAuth();
      router.replace('/swipe');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (!hasLocation) return <LocationGate />;

  return (
    <div className="min-h-screen px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Create your profile</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills * (comma separated)</label>
          <input className="input-field" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Painting, Plumbing, Driving" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Categories *</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.nameEn}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <input
            type="number"
            className="input-field"
            value={experienceYears}
            onChange={e => setExperienceYears(Number(e.target.value))}
            min={0}
            max={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Work Type</label>
          <select className="input-field" value={preferredWorkType} onChange={e => setPreferredWorkType(e.target.value)}>
            <option value="any">Any</option>
            <option value="full_day">Full Day</option>
            <option value="half_day">Half Day</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality *</label>
          <input className="input-field" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="e.g. Andheri West, Mumbai" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio (optional)</label>
          <textarea className="input-field" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell employers about yourself" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating profile...' : 'Start Finding Work'}
        </button>
      </div>
    </div>
  );
}
