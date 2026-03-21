'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  const { sendOtp, login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      await sendOtp(fullPhone);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      await login(fullPhone, otp);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary-600 mb-2">RozgaarMatch</h1>
        <p className="text-gray-500">Find work near you, instantly</p>
      </div>

      <div className="card">
        {step === 'phone' ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Enter your phone number</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 font-medium bg-gray-100 px-3 py-3 rounded-xl">+91</span>
              <input
                type="tel"
                className="input-field"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              className="btn-primary w-full"
              onClick={handleSendOtp}
              disabled={phone.length !== 10 || loading}
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
            <p className="text-gray-500 text-sm mb-4">Sent to +91 {phone}</p>
            <input
              type="text"
              className="input-field mb-4 text-center text-2xl tracking-widest"
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              className="btn-primary w-full mb-3"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              className="text-primary-500 text-sm w-full text-center"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
            >
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
