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
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--mama-cream)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === 1 && (
          <div className="text-center max-w-sm">
            {/* Logo */}
            <div 
              className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--mama-coral-light) 0%, white 100%)' }}
            >
              <span className="text-6xl">🤰</span>
            </div>
            
            <h1 
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Welcome to MamaSense
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Your trusted companion for pregnancy-safe food choices
            </p>

            <div className="space-y-4 text-left bg-white rounded-2xl p-5 shadow-sm mb-8">
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--safe-green-light)' }}
                >
                  <span style={{ color: 'var(--safe-green)' }}>✓</span>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Instant Answers</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Scan any barcode, get safety info in seconds</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--safe-green-light)' }}
                >
                  <span style={{ color: 'var(--safe-green)' }}>✓</span>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Trimester-Specific</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Advice tailored to your stage of pregnancy</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--safe-green-light)' }}
                >
                  <span style={{ color: 'var(--safe-green)' }}>✓</span>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Clear Explanations</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Understand why, not just what to avoid</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--mama-coral) 0%, #E8927A 100%)' }}
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center max-w-sm w-full">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'var(--mama-coral-light)' }}
            >
              <span className="text-3xl">📅</span>
            </div>
            
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Which trimester?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              This helps us give you the most relevant safety information
            </p>

            <div className="space-y-3">
              <TrimesterButton
                trimester={1}
                weeks="Weeks 1-12"
                emoji="🌱"
                description="First trimester"
                selected={trimester === 1}
                onSelect={() => handleTrimesterSelect(1)}
              />
              <TrimesterButton
                trimester={2}
                weeks="Weeks 13-26"
                emoji="🌿"
                description="Second trimester"
                selected={trimester === 2}
                onSelect={() => handleTrimesterSelect(2)}
              />
              <TrimesterButton
                trimester={3}
                weeks="Weeks 27-40"
                emoji="🌳"
                description="Third trimester"
                selected={trimester === 3}
                onSelect={() => handleTrimesterSelect(3)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </main>
  );
}

function TrimesterButton({
  trimester,
  weeks,
  emoji,
  description,
  selected,
  onSelect,
}: {
  trimester: number;
  weeks: string;
  emoji: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-4 rounded-2xl border-2 text-left transition-all btn-press"
      style={{ 
        borderColor: selected ? 'var(--mama-coral)' : 'var(--border-light)',
        background: selected ? 'var(--mama-coral-light)' : 'white'
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{ 
            background: selected ? 'var(--mama-coral)' : 'var(--mama-peach)',
          }}
        >
          {selected ? <span className="text-white font-bold">{trimester}</span> : emoji}
        </div>
        <div>
          <div 
            className="font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {description}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{weeks}</div>
        </div>
        {selected && (
          <div 
            className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
            style={{ background: 'var(--mama-coral)' }}
          >
            ✓
          </div>
        )}
      </div>
    </button>
  );
}
