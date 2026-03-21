'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiFetch } from '@/lib/api';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/profile/me', { token })
      .then((res: any) => setProfile(res.profile))
      .catch(console.error);
  }, [token]);

  return (
    <div className="min-h-screen pb-20">
      <Header title="Profile" />

      <div className="px-6 py-4">
        <div className="card text-center mb-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>&#128100;</span>
            )}
          </div>
          <h2 className="text-xl font-bold">
            {profile?.name || profile?.businessName || 'User'}
          </h2>
          <p className="text-gray-500 text-sm">{user?.phone}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role}</p>
        </div>

        {profile && user?.role === 'worker' && (
          <div className="card space-y-3 mb-6">
            <div>
              <p className="text-xs text-gray-500">Skills</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.skills?.map((s: string, i: number) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Experience</p>
              <p className="font-medium">{profile.experienceYears} years</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium">{profile.locationText || 'Not set'}</p>
            </div>
          </div>
        )}

        {profile && user?.role === 'employer' && (
          <div className="card space-y-3 mb-6">
            <div>
              <p className="text-xs text-gray-500">Contact Person</p>
              <p className="font-medium">{profile.contactPerson}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Business Type</p>
              <p className="font-medium">{profile.businessType || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium">{profile.locationText || 'Not set'}</p>
            </div>
          </div>
        )}

        <button className="btn-outline w-full text-red-500 border-red-300 hover:bg-red-50" onClick={() => { logout(); window.location.href = '/login'; }}>
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
