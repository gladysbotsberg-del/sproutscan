'use client';

import { useState } from 'react';
import { Trimester, UserProfile } from '@/app/page';
import { SproutScanIcon } from './SproutScanIcon';
import { SproutScanWordmark } from './SproutScanWordmark';

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
    <main className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFAF9 0%, #FFF5F3 40%, #FDE8E4 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === 1 && (
          <div className="text-center max-w-sm">
            {/* Logo */}
            <div className="mb-8">
              <SproutScanWordmark scale={1.1} />
            </div>

            <p className="mb-8" style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              Your trusted companion for pregnancy-safe food choices
            </p>

            <div
              style={{
                background: 'white',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '32px',
                border: '1px solid rgba(232,131,107,0.07)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--green-pale)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Instant Answers</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Scan any barcode, get safety info in seconds</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--green-pale)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Trimester-Specific</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Advice tailored to your stage of pregnancy</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--green-pale)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Clear Explanations</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Understand why, not just what to avoid</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press"
              style={{
                background: 'var(--brand-gradient)',
                boxShadow: 'var(--shadow-button)',
              }}
            >
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center max-w-sm w-full">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'var(--bg-blush)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-coral)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
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
                description="First trimester"
                icon={<SeedlingIcon />}
                selected={trimester === 1}
                onSelect={() => handleTrimesterSelect(1)}
              />
              <TrimesterButton
                trimester={2}
                weeks="Weeks 13-26"
                description="Second trimester"
                icon={<LeafIcon />}
                selected={trimester === 2}
                onSelect={() => handleTrimesterSelect(2)}
              />
              <TrimesterButton
                trimester={3}
                weeks="Weeks 27-40"
                description="Third trimester"
                icon={<TreeIcon />}
                selected={trimester === 3}
                onSelect={() => handleTrimesterSelect(3)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs" style={{ color: 'var(--text-hint)' }}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </main>
  );
}

function SeedlingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="20" x2="12" y2="10" stroke="var(--green-primary)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14c-2-2-5-4-7-6 3-1 6 1 8 4" fill="var(--green-light)" opacity="0.8" />
      <path d="M12 12c2-2 5-5 7-6-1 3-4 5-6 7" fill="var(--green-primary)" opacity="0.7" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3 10-10" stroke="var(--green-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8c2-5-2-8-2-8s-5 3-3 8" stroke="var(--green-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--green-light)" fillOpacity="0.3" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="22" x2="12" y2="13" stroke="var(--green-forest)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3L4 13h16L12 3z" fill="var(--green-light)" fillOpacity="0.4" stroke="var(--green-primary)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 7L6 15h12L12 7z" fill="var(--green-primary)" fillOpacity="0.3" stroke="var(--green-primary)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TrimesterButton({
  trimester,
  weeks,
  icon,
  description,
  selected,
  onSelect,
}: {
  trimester: number;
  weeks: string;
  icon: React.ReactNode;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full p-4 rounded-2xl text-left transition-all btn-press"
      style={{
        border: `2px solid ${selected ? 'var(--brand-coral)' : 'rgba(232,131,107,0.12)'}`,
        background: selected ? 'var(--brand-coral-pale)' : 'white',
        boxShadow: selected ? 'var(--shadow-card)' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: selected ? 'var(--brand-gradient)' : 'var(--bg-blush)',
          }}
        >
          {selected ? <span className="text-white font-bold text-lg">{trimester}</span> : icon}
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
            style={{ background: 'var(--brand-coral)' }}
          >
            {'\u2713'}
          </div>
        )}
      </div>
    </button>
  );
}
