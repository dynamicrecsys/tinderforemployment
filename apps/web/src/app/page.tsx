'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    } else if (!user.isOnboarded) {
      router.replace('/onboarding');
    } else if (user.role === 'employer') {
      router.replace('/employer/dashboard');
    } else {
      router.replace('/swipe');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-xl text-gray-400">Loading...</div>
    </div>
  );
}
