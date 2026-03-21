'use client';

import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
        <p className="text-gray-500">How do you want to use RozgaarMatch?</p>
      </div>

      <div className="space-y-4">
        <button
          className="card w-full text-left flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => router.push('/onboarding/worker')}
        >
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
            <span role="img" aria-label="worker">&#128119;</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">I'm looking for work</h3>
            <p className="text-gray-500 text-sm">Find jobs near you and get hired</p>
          </div>
        </button>

        <button
          className="card w-full text-left flex items-center gap-4 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => router.push('/onboarding/employer')}
        >
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
            <span role="img" aria-label="employer">&#127970;</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">I'm hiring workers</h3>
            <p className="text-gray-500 text-sm">Post jobs and find the right people</p>
          </div>
        </button>
      </div>
    </div>
  );
}
