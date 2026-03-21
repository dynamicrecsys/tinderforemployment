import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { LocationProvider } from '@/providers/LocationProvider';
import { SocketProvider } from '@/providers/SocketProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RozgaarMatch - Find Work Near You',
  description: 'Swipe-based job matching for gig workers, blue-collar employees, and daily wage workers',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LocationProvider>
            <SocketProvider>
              <main className="min-h-screen max-w-md mx-auto">
                {children}
              </main>
            </SocketProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
