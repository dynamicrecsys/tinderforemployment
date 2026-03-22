'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useLocation } from '@/providers/LocationProvider';
import { apiFetch } from '@/lib/api';
import Header from '@/components/layout/Header';
import type { Category } from '@tfe/shared';

// Common job title suggestions by category
const JOB_TITLE_SUGGESTIONS: Record<string, string[]> = {
  Construction: ['Site Mason', 'Helper for Construction', 'Tile Setter', 'Shuttering Carpenter', 'Site Supervisor'],
  Housekeeping: ['House Cleaner', 'Office Cleaner', 'Maid / Domestic Help', 'Laundry Worker'],
  Driving: ['Car Driver', 'Auto Driver', 'Truck Driver', 'Delivery Driver', 'Personal Driver'],
  Cooking: ['Cook / Chef', 'Tandoor Chef', 'Kitchen Helper', 'Tiffin Service Cook', 'Restaurant Cook'],
  Delivery: ['Delivery Boy', 'Courier Rider', 'Food Delivery', 'Parcel Delivery'],
  Security: ['Security Guard', 'Night Watchman', 'CCTV Operator', 'Gate Guard'],
  Painting: ['Painter', 'Interior Painter', 'Exterior Painter', 'Texture Painter'],
  Plumbing: ['Plumber', 'Pipe Fitter', 'Sanitary Worker'],
  Electrical: ['Electrician', 'Wiring Technician', 'AC Technician', 'Appliance Repair'],
  Tailoring: ['Tailor', 'Alteration Expert', 'Embroidery Worker'],
  Farming: ['Farm Worker', 'Harvester', 'Gardener'],
  'Factory Work': ['Machine Operator', 'Assembly Worker', 'Quality Inspector', 'Packing Staff'],
  Retail: ['Shop Assistant', 'Billing Counter', 'Stock Handler', 'Salesperson'],
  Warehouse: ['Warehouse Helper', 'Packing Staff', 'Loading Worker', 'Inventory Clerk'],
  Carpentry: ['Carpenter', 'Furniture Maker', 'Wood Polisher'],
  Welding: ['Welder', 'Fabricator', 'Metal Cutter'],
  Gardening: ['Gardener', 'Lawn Maintenance', 'Plant Care'],
  'AC Repair': ['AC Technician', 'AC Installer', 'HVAC Helper'],
};

// Common skills by category
const SKILL_SUGGESTIONS: Record<string, string[]> = {
  Construction: ['Masonry', 'Plastering', 'Tile Setting', 'Shuttering', 'Bar Bending', 'Cement Work', 'Flooring'],
  Housekeeping: ['Cleaning', 'Mopping', 'Dusting', 'Laundry', 'Organizing', 'Dishwashing', 'Ironing'],
  Driving: ['Car Driving', 'Two-Wheeler', 'Truck Driving', 'Auto Driving', 'Route Planning', 'GPS Navigation'],
  Cooking: ['North Indian', 'South Indian', 'Tandoor', 'Chinese', 'Baking', 'Meal Prep', 'Kitchen Management'],
  Delivery: ['Two-Wheeler Driving', 'Parcel Handling', 'Navigation', 'Customer Service', 'Time Management'],
  Security: ['Patrolling', 'CCTV Monitoring', 'Access Control', 'Emergency Response', 'Fire Safety'],
  Painting: ['Wall Painting', 'Texture', 'Waterproofing', 'Polishing', 'POP Work', 'Spray Painting'],
  Plumbing: ['Pipe Fitting', 'Leak Repair', 'Tank Installation', 'Drainage', 'Water Heater'],
  Electrical: ['Wiring', 'Circuit Repair', 'Motor Repair', 'Appliance Installation', 'Panel Work'],
  Tailoring: ['Stitching', 'Cutting', 'Alterations', 'Embroidery', 'Pattern Making'],
  'Factory Work': ['Machine Operation', 'Quality Check', 'Assembly', 'Packing', 'Safety Compliance'],
  Warehouse: ['Loading', 'Packing', 'Inventory', 'Forklift', 'Labeling', 'Dispatch'],
};

// Indian city/area suggestions
const LOCATION_SUGGESTIONS = [
  'Andheri East, Mumbai', 'Andheri West, Mumbai', 'Bandra West, Mumbai', 'Bandra East, Mumbai',
  'Dadar, Mumbai', 'Worli, Mumbai', 'Lower Parel, Mumbai', 'Kurla, Mumbai',
  'Thane, Mumbai', 'Malad, Mumbai', 'Goregaon, Mumbai', 'Borivali, Mumbai',
  'Powai, Mumbai', 'Vikhroli, Mumbai', 'Ghatkopar, Mumbai', 'Chembur, Mumbai',
  'Navi Mumbai', 'Vashi, Navi Mumbai', 'Airoli, Navi Mumbai',
  'Koramangala, Bangalore', 'Whitefield, Bangalore', 'HSR Layout, Bangalore',
  'Electronic City, Bangalore', 'Indiranagar, Bangalore', 'Marathahalli, Bangalore',
  'Connaught Place, Delhi', 'Nehru Place, Delhi', 'Dwarka, Delhi', 'Noida',
  'Gurgaon', 'Saket, Delhi', 'Lajpat Nagar, Delhi',
  'Salt Lake, Kolkata', 'Park Street, Kolkata', 'Howrah, Kolkata',
  'Anna Nagar, Chennai', 'T Nagar, Chennai', 'Adyar, Chennai',
  'Banjara Hills, Hyderabad', 'Gachibowli, Hyderabad', 'HITEC City, Hyderabad',
  'Aundh, Pune', 'Hinjewadi, Pune', 'Kothrud, Pune', 'Wakad, Pune',
  'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Indore', 'Chandigarh',
];

export default function NewJobPage() {
  const { token } = useAuth();
  const { lat, lng } = useLocation();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [workType, setWorkType] = useState('full_day');
  const [payMin, setPayMin] = useState('');
  const [payMax, setPayMax] = useState('');
  const [payPeriod, setPayPeriod] = useState('per_day');
  const [locationText, setLocationText] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState('25');
  const [slots, setSlots] = useState('1');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Category[]>('/profile/categories').then(setCategories).catch(console.error);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setCategoryId(id);
    const cat = categories.find(c => c.id === id);
    setSelectedCategoryName(cat?.nameEn || '');
    setSelectedSkills([]);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const filteredTitleSuggestions = selectedCategoryName
    ? (JOB_TITLE_SUGGESTIONS[selectedCategoryName] || []).filter(t =>
        t.toLowerCase().includes(title.toLowerCase())
      )
    : Object.values(JOB_TITLE_SUGGESTIONS).flat().filter(t =>
        t.toLowerCase().includes(title.toLowerCase())
      ).slice(0, 6);

  const filteredLocations = LOCATION_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(locationText.toLowerCase())
  ).slice(0, 5);

  const availableSkills = SKILL_SUGGESTIONS[selectedCategoryName] || [];

  const handleSubmit = async () => {
    if (!title) { setError('Please enter a job title'); return; }
    if (!payMin || !payMax) { setError('Please enter pay range'); return; }

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
          requiredSkills: selectedSkills,
          workType,
          payMin: Number(payMin),
          payMax: Number(payMax),
          payPeriod,
          locationLat: lat || 19.076,
          locationLng: lng || 72.877,
          locationText: locationText || '',
          maxDistanceKm: Number(maxDistanceKm) || 25,
          slots: Number(slots) || 1,
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

      <div className="px-6 py-4 space-y-5">
        {/* Category - first, drives other suggestions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select className="input-field" value={categoryId} onChange={handleCategoryChange}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
          </select>
        </div>

        {/* Job Title with suggestions */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input
            className="input-field"
            value={title}
            onChange={e => { setTitle(e.target.value); setShowTitleSuggestions(true); }}
            onFocus={() => setShowTitleSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
            placeholder="e.g. Painter needed"
          />
          {showTitleSuggestions && title.length === 0 && selectedCategoryName && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {(JOB_TITLE_SUGGESTIONS[selectedCategoryName] || []).map(t => (
                <button key={t} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm" onMouseDown={() => { setTitle(t); setShowTitleSuggestions(false); }}>
                  {t}
                </button>
              ))}
            </div>
          )}
          {showTitleSuggestions && title.length > 0 && filteredTitleSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredTitleSuggestions.map(t => (
                <button key={t} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm" onMouseDown={() => { setTitle(t); setShowTitleSuggestions(false); }}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input-field" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the work details (optional)" />
        </div>

        {/* Skills as tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
          {availableSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {selectedSkills.includes(skill) ? `${skill} \u2715` : skill}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select a category to see skill suggestions</p>
          )}
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Type *</label>
          <div className="flex gap-2">
            {[
              { value: 'full_day', label: 'Full Day' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'hourly', label: 'Hourly' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  workType === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setWorkType(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pay Range ({'\u20B9'}) *</label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              inputMode="numeric"
              className="input-field flex-1 text-center"
              value={payMin}
              onChange={e => setPayMin(e.target.value.replace(/\D/g, ''))}
              placeholder="Min"
            />
            <span className="text-gray-400 font-medium">to</span>
            <input
              type="tel"
              inputMode="numeric"
              className="input-field flex-1 text-center"
              value={payMax}
              onChange={e => setPayMax(e.target.value.replace(/\D/g, ''))}
              placeholder="Max"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[
              { value: 'per_day', label: '/day' },
              { value: 'per_hour', label: '/hour' },
              { value: 'per_month', label: '/month' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  payPeriod === opt.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setPayPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location with autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Location</label>
          <input
            className="input-field"
            value={locationText}
            onChange={e => { setLocationText(e.target.value); setShowLocationSuggestions(true); }}
            onFocus={() => setShowLocationSuggestions(true)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            placeholder="Search city or area"
          />
          {showLocationSuggestions && locationText.length > 0 && filteredLocations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredLocations.map(loc => (
                <button key={loc} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-2" onMouseDown={() => { setLocationText(loc); setShowLocationSuggestions(false); }}>
                  <span className="text-gray-400">{'\u{1F4CD}'}</span> {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Radius + Slots - using range slider and stepper */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={maxDistanceKm || 25}
                onChange={e => setMaxDistanceKm(e.target.value)}
                className="flex-1 accent-primary-500"
              />
              <span className="text-sm font-semibold text-gray-700 w-12 text-right">{maxDistanceKm} km</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workers Needed</label>
            <div className="flex items-center gap-1">
              <button
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600"
                onClick={() => setSlots(String(Math.max(1, Number(slots) - 1)))}
              >
                -
              </button>
              <span className="flex-1 text-center text-lg font-semibold">{slots}</span>
              <button
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600"
                onClick={() => setSlots(String(Math.min(100, Number(slots) + 1)))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

        <button className="btn-primary w-full text-lg py-4" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </div>
    </div>
  );
}
