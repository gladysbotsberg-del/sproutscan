'use client';

import { useState } from 'react';
import { Trimester, UserProfile } from '@/app/page';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [trimester, setTrimester] = useState<Trimester | null>(null);

  const handleTrimesterSelect = (t: Trimester) => {
    setTrimester(t);
    onComplete({ trimester: t });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === 1 && (
          <div className="text-center max-w-sm">
            {/* Logo */}
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-8">
              <span className="text-5xl">🍼</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to MamaSense
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your trusted companion for pregnancy-safe food choices. 
              Scan any product and get instant, trimester-specific safety information.
            </p>

            <div className="space-y-4 text-left bg-white rounded-xl p-6 shadow-sm mb-8">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-medium">Instant Answers</div>
                  <div className="text-sm text-gray-500">Scan barcode, get safety info in seconds</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-medium">Trimester-Specific</div>
                  <div className="text-sm text-gray-500">Advice tailored to your stage of pregnancy</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <div className="font-medium">Clear Explanations</div>
                  <div className="text-sm text-gray-500">Understand why, not just what to avoid</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Which trimester are you in?
            </h2>
            <p className="text-gray-600 mb-8">
              This helps us give you the most relevant safety information
            </p>

            <div className="space-y-4">
              <TrimesterButton
                trimester={1}
                weeks="Weeks 1-12"
                description="First trimester"
                selected={trimester === 1}
                onSelect={() => handleTrimesterSelect(1)}
              />
              <TrimesterButton
                trimester={2}
                weeks="Weeks 13-26"
                description="Second trimester"
                selected={trimester === 2}
                onSelect={() => handleTrimesterSelect(2)}
              />
              <TrimesterButton
                trimester={3}
                weeks="Weeks 27-40"
                description="Third trimester"
                selected={trimester === 3}
                onSelect={() => handleTrimesterSelect(3)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </main>
  );
}

function TrimesterButton({
  trimester,
  weeks,
  description,
  selected,
  onSelect,
}: {
  trimester: number;
  weeks: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-green-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
          selected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {trimester}
        </div>
        <div>
          <div className="font-semibold text-gray-800">{description}</div>
          <div className="text-sm text-gray-500">{weeks}</div>
        </div>
      </div>
    </button>
  );
}
