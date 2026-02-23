'use client';

import { useState } from 'react';
import { Trimester, Stage, UserProfile, DietaryRestriction } from '@/app/page';
import { SproutScanWordmark } from './SproutScanWordmark';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const TOTAL_STEPS = 4;

function calculateTrimesterFromDueDate(dueDateStr: string): { trimester: Trimester; weeks: number } {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const gestationalDays = 280 - daysUntilDue;
  const gestationalWeeks = Math.max(1, Math.min(40, Math.floor(gestationalDays / 7)));

  let trimester: Trimester = 1;
  if (gestationalWeeks > 26) trimester = 3;
  else if (gestationalWeeks > 12) trimester = 2;

  return { trimester, weeks: gestationalWeeks };
}

const DIETARY_OPTIONS: { id: DietaryRestriction; label: string; icon: React.ReactNode }[] = [
  { id: 'vegetarian', label: 'Vegetarian', icon: <DietIcon d="M12 2C8 7 4 10 4 14a8 8 0 0016 0c0-4-4-7-8-12z" /> },
  { id: 'vegan', label: 'Vegan', icon: <DietIcon d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3 10-10M17 8c2-5-2-8-2-8s-5 3-3 8" /> },
  { id: 'gluten-free', label: 'Gluten-Free', icon: <DietIcon d="M12 2v20M8 6l4 4 4-4M8 12l4 4 4-4" stroke /> },
  { id: 'dairy-free', label: 'Dairy-Free', icon: <DietIcon d="M8 2h8l1 6v8a4 4 0 01-4 4h-2a4 4 0 01-4-4V8z" stroke /> },
  { id: 'nut-allergy', label: 'Nut Allergy', icon: <DietIcon d="M12 4c-3 0-6 3-6 7s3 8 6 8 6-4 6-8-3-7-6-7zM12 2v2" stroke /> },
  { id: 'soy-allergy', label: 'Soy Allergy', icon: <DietIcon d="M12 6c-2 0-4 2-4 5 0 4 2 7 4 7s4-3 4-7c0-3-2-5-4-5zM10 4c0-1 1-2 2-2s2 1 2 2" stroke /> },
  { id: 'egg-allergy', label: 'Egg Allergy', icon: <DietIcon d="M12 3C8 3 5 8 5 13s3 8 7 8 7-3 7-8-3-10-7-10z" stroke /> },
  { id: 'shellfish-allergy', label: 'Shellfish', icon: <DietIcon d="M6 16c0-3 2-6 6-8 4 2 6 5 6 8M8 16c1 3 3 4 4 4s3-1 4-4M12 8V4" stroke /> },
  { id: 'lactose-intolerant', label: 'Lactose Intolerant', icon: <DietIcon d="M12 3v18M7 7l10 10M17 7L7 17" stroke /> },
  { id: 'gestational-diabetes', label: 'Gest. Diabetes', icon: <GestDiabetesIcon /> },
];

function DietIcon({ d, stroke }: { d: string; stroke?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={stroke ? 'none' : 'currentColor'} stroke={stroke ? 'currentColor' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function GestDiabetesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19.5 12.572l-7.5 7.428-7.5-7.428A5 5 0 1112 6.006a5 5 0 017.5 6.566z" />
      <line x1="12" y1="10" x2="12" y2="16" />
      <line x1="9" y1="13" x2="15" y2="13" />
    </svg>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState<Stage | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([]);

  const handleStageSelect = (s: Stage) => {
    setStage(s);
    // Breastfeeding doesn't need a due date — skip to dietary restrictions
    if (s === 'breastfeeding') {
      setTimeout(() => setStep(4), 300);
    } else {
      setTimeout(() => setStep(3), 300);
    }
  };

  const handleDueDateContinue = () => {
    if (dueDate) {
      const { trimester: calc } = calculateTrimesterFromDueDate(dueDate);
      setStage(calc);
    }
    setStep(4);
  };

  const toggleRestriction = (id: DietaryRestriction) => {
    setDietaryRestrictions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    if (!stage) return;
    onComplete({
      stage,
      dueDate: dueDate || undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
    });
  };

  const dueDateInfo = dueDate ? calculateTrimesterFromDueDate(dueDate) : null;

  // Min date: ~2 weeks ago, Max date: ~40 weeks from now
  const today = new Date();
  const minDate = new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 280 * 86400000).toISOString().split('T')[0];

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFAF9 0%, #FFF5F3 40%, #FDE8E4 100%)' }}>
      {/* Back button */}
      {step > 1 && (
        <button
          onClick={() => setStep(step - 1)}
          className="btn-press"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'white',
            border: '1px solid rgba(232,131,107,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className={`flex-1 flex flex-col items-center px-6 py-12 ${step === 4 ? 'justify-start overflow-y-auto pt-16' : 'justify-center'}`}>
        {/* Progress bar — steps 2-4 only */}
        {step > 1 && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
            {[1, 2, 3].map((seg) => {
              const adjustedStep = step - 1;
              const isActive = seg <= adjustedStep;
              return (
                <div
                  key={seg}
                  style={{
                    width: isActive ? '32px' : '12px',
                    height: '6px',
                    borderRadius: '3px',
                    background: isActive ? 'var(--brand-coral)' : 'var(--bg-blush)',
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center max-w-sm step-enter" key="step1">
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
                <FeatureRow
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
                  title="Instant Answers"
                  subtitle="Scan any barcode, get safety info in seconds"
                />
                <FeatureRow
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
                  title="Trimester-Specific"
                  subtitle="Advice tailored to your stage of pregnancy"
                />
                <FeatureRow
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
                  title="Clear Explanations"
                  subtitle="Understand why, not just what to avoid"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press"
              style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-button)' }}
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Stage selector */}
        {step === 2 && (
          <div className="text-center max-w-sm w-full step-enter" key="step2">
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
              What&apos;s your stage?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              This helps us give you the most relevant safety information
            </p>

            <div className="space-y-3">
              <StageButton
                stage={1}
                detail="Weeks 1-12"
                label="First trimester"
                icon={<SeedlingIcon />}
                selected={stage === 1}
                onSelect={() => handleStageSelect(1)}
              />
              <StageButton
                stage={2}
                detail="Weeks 13-26"
                label="Second trimester"
                icon={<LeafIcon />}
                selected={stage === 2}
                onSelect={() => handleStageSelect(2)}
              />
              <StageButton
                stage={3}
                detail="Weeks 27-40"
                label="Third trimester"
                icon={<TreeIcon />}
                selected={stage === 3}
                onSelect={() => handleStageSelect(3)}
              />
              <StageButton
                stage="breastfeeding"
                detail="Postpartum"
                label="Breastfeeding"
                icon={<BreastfeedingIcon />}
                selected={stage === 'breastfeeding'}
                onSelect={() => handleStageSelect('breastfeeding')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Due Date */}
        {step === 3 && (
          <div className="text-center max-w-sm w-full step-enter" key="step3">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'var(--bg-blush)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-coral)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <circle cx="12" cy="16" r="2" fill="var(--brand-coral)" stroke="none" />
              </svg>
            </div>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              When is your due date?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              This helps us track your trimester automatically
            </p>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={minDate}
              max={maxDate}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                border: '2px solid rgba(232,131,107,0.12)',
                fontSize: '18px',
                fontFamily: 'Inter, system-ui',
                color: 'var(--text-primary)',
                background: 'white',
                textAlign: 'center',
                outline: 'none',
                marginBottom: '12px',
              }}
            />

            {dueDateInfo && (
              <p
                style={{
                  color: 'var(--green-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  padding: '10px 16px',
                  background: 'var(--green-pale)',
                  borderRadius: '10px',
                }}
              >
                You&apos;re in your {dueDateInfo.trimester === 1 ? '1st' : dueDateInfo.trimester === 2 ? '2nd' : '3rd'} trimester &mdash; week {dueDateInfo.weeks}
              </p>
            )}

            <button
              onClick={handleDueDateContinue}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press"
              style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-button)', marginBottom: '12px' }}
            >
              Continue
            </button>

            <button
              onClick={() => setStep(4)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* Step 4: Dietary Restrictions */}
        {step === 4 && (
          <div className="text-center max-w-sm w-full step-enter" key="step4">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'var(--bg-blush)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-coral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Any dietary needs?
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Select all that apply — we&apos;ll keep this in mind
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {DIETARY_OPTIONS.map((option) => {
                const isSelected = dietaryRestrictions.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleRestriction(option.id)}
                    className="btn-press"
                    style={{
                      padding: '14px 8px',
                      borderRadius: '14px',
                      border: `2px solid ${isSelected ? 'var(--brand-coral)' : 'rgba(232,131,107,0.12)'}`,
                      background: isSelected ? 'var(--brand-coral-pale)' : 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--brand-coral)' : 'var(--text-muted)' }}>
                      {option.icon}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isSelected ? 'var(--brand-coral)' : 'var(--text-secondary)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press"
              style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-button)', marginBottom: '12px' }}
            >
              {dietaryRestrictions.length > 0
                ? `Continue with ${dietaryRestrictions.length} selected`
                : 'Continue'
              }
            </button>

            <button
              onClick={handleComplete}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '15px',
                fontWeight: 600,
                padding: '12px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Skip for now
            </button>
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

/* ─── Sub-components ─── */

function FeatureRow({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--green-pale)' }}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
      </div>
    </div>
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

function StageButton({
  stage,
  detail,
  icon,
  label,
  selected,
  onSelect,
}: {
  stage: Stage;
  detail: string;
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const badgeText = typeof stage === 'number' ? String(stage) : '\u2661';

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
          style={{ background: selected ? 'var(--brand-gradient)' : 'var(--bg-blush)' }}
        >
          {selected ? <span className="text-white font-bold text-lg">{badgeText}</span> : icon}
        </div>
        <div>
          <div className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {label}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{detail}</div>
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

function BreastfeedingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--brand-coral-light)" />
      <circle cx="12" cy="10" r="3" fill="var(--brand-coral)" opacity="0.6" />
    </svg>
  );
}
