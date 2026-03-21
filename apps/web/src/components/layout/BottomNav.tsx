'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const workerTabs = [
  { href: '/swipe', label: 'Discover', icon: '&#128293;' },
  { href: '/matches', label: 'Matches', icon: '&#128172;' },
  { href: '/profile', label: 'Profile', icon: '&#128100;' },
];

const employerTabs = [
  { href: '/swipe', label: 'Discover', icon: '&#128293;' },
  { href: '/matches', label: 'Matches', icon: '&#128172;' },
  { href: '/employer/jobs', label: 'Jobs', icon: '&#128188;' },
  { href: '/profile', label: 'Profile', icon: '&#128100;' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = user?.role === 'employer' ? employerTabs : workerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {tabs.map(tab => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <span className="text-xl" dangerouslySetInnerHTML={{ __html: tab.icon }} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
