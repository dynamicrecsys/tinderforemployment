'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';
import Header from '@/components/layout/Header';
import type { Category } from '@tfe/shared';

export default function NewJobPage() {
  const { token } = useAuth();
  const { lat, lng } = useLocation();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [workType, setWorkType] = useState('full_day');
  const [payMin, setPayMin] = useState('');
  const [payMax, setPayMax] = useState('');
  const [payPeriod, setPayPeriod] = useState('per_day');
  const [locationText, setLocationText] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [slots, setSlots] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Category[]>('/profile/categories').then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!title || !payMin || !payMax || !locationText) {
      setError('Please fill required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/jobs', {
        method: 'POST',
        token: token!,
        body: JSON.stringify({
          title,
          description: description || undefined,
          categoryId: categoryId || undefined,
          requiredSkills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [],
          workType,
          payMin: Number(payMin),
          payMax: Number(payMax),
          payPeriod,
          locationLat: lat!,
          locationLng: lng!,
          locationText,
          maxDistanceKm,
          slots,
        }),
      });
      router.replace('/employer/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      <Header title="Post New Job" showBack />

      <div className="px-6 py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Painter needed, Driver required" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the work details" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="input-field" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma separated)</label>
          <input className="input-field" value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} placeholder="e.g. Painting, Wall prep" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Type *</label>
          <select className="input-field" value={workType} onChange={e => setWorkType(e.target.value)}>
            <option value="full_day">Full Day</option>
            <option value="half_day">Half Day</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Pay (&#8377;) *</label>
            <input type="number" className="input-field" value={payMin} onChange={e => setPayMin(e.target.value)} placeholder="500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Pay (&#8377;) *</label>
            <input type="number" className="input-field" value={payMax} onChange={e => setPayMax(e.target.value)} placeholder="800" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
          <select className="input-field" value={payPeriod} onChange={e => setPayPeriod(e.target.value)}>
            <option value="per_day">Per Day</option>
            <option value="per_hour">Per Hour</option>
            <option value="per_month">Per Month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Location *</label>
          <input className="input-field" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="e.g. Andheri, Mumbai" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius (km)</label>
            <input type="number" className="input-field" value={maxDistanceKm} onChange={e => setMaxDistanceKm(Number(e.target.value))} min={1} max={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workers Needed</label>
            <input type="number" className="input-field" value={slots} onChange={e => setSlots(Number(e.target.value))} min={1} max={100} />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </div>
    </div>
  );
}
