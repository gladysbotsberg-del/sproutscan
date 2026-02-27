'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Scanner from '@/components/Scanner';
import ProductResult from '@/components/ProductResult';
import Onboarding from '@/components/Onboarding';
import { SproutScanIcon } from '@/components/SproutScanIcon';
import { SproutScanWordmark } from '@/components/SproutScanWordmark';
import SafetyBadge from '@/components/SafetyBadge';

export type Trimester = 1 | 2 | 3;

// Stage extends Trimester with postpartum stages.
// TODO: When breastfeeding mode is built, add breastfeeding-specific safety rules
// and update the API to accept stage directly instead of converting to trimester.
export type Stage = Trimester | 'breastfeeding';

export type DietaryRestriction =
  | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free'
  | 'nut-allergy' | 'soy-allergy' | 'egg-allergy' | 'shellfish-allergy'
  | 'gestational-diabetes' | 'lactose-intolerant';

export interface UserProfile {
  stage: Stage;
  dueDate?: string;
  dietaryRestrictions?: DietaryRestriction[];
}

/** Convert a Stage to a trimester number for the API (breastfeeding defaults to 3/postpartum). */
export function stageToTrimester(stage: Stage): number {
  return typeof stage === 'number' ? stage : 3;
}

/** Human-readable label for the header pill. */
export function stageLabel(stage: Stage): string {
  if (stage === 'breastfeeding') return 'Breastfeeding';
  return `Trimester ${stage}`;
}

export interface ProductData {
  name: string;
  brand: string;
  image?: string;
  ingredients: string[];
  barcode: string;
  source?: string;
}

export interface SafetyResult {
  product: ProductData;
  overallSafety: 'safe' | 'caution' | 'avoid' | 'unknown';
  flaggedIngredients: FlaggedIngredient[];
  safeIngredients: string[];
  unknownIngredients: string[];
  infoIngredients?: InfoIngredient[];
  noIngredients?: boolean;
  message?: string;
}

export interface FlaggedIngredient {
  name: string;
  rating: 'caution' | 'avoid';
  concern: string;
  explanation: string;
  bottomLine: string;
}

export interface InfoIngredient {
  name: string;
  note: string;
}

export interface ScanHistoryEntry {
  result: SafetyResult;
  scannedAt: string; // ISO timestamp
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanHistoryEntry[]>([]);
  const [manualSearch, setManualSearch] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('sproutscan_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      // Migrate old profiles that used `trimester` instead of `stage`
      if (parsed.trimester && !parsed.stage) {
        parsed.stage = parsed.trimester;
        delete parsed.trimester;
        localStorage.setItem('sproutscan_profile', JSON.stringify(parsed));
      }
      setProfile(parsed);
    }
    const savedScans = localStorage.getItem('sproutscan_recent');
    if (savedScans) {
      const parsed: unknown[] = JSON.parse(savedScans);
      const migrated: ScanHistoryEntry[] = parsed.map((item: unknown) => {
        const entry = item as Record<string, unknown>;
        if (entry.scannedAt && entry.result) return entry as unknown as ScanHistoryEntry;
        return { result: entry as unknown as SafetyResult, scannedAt: new Date().toISOString() };
      });
      setRecentScans(migrated.slice(0, 50));
      localStorage.setItem('sproutscan_recent', JSON.stringify(migrated.slice(0, 50)));
    }
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('sproutscan_profile', JSON.stringify(newProfile));
  };

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setError(null);
    setScanning(false);
    setManualSearch(false);

    try {
      const response = await fetch(`/api/scan?barcode=${barcode}&trimester=${stageToTrimester(profile?.stage || 2)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.message || data.error);
      } else {
        setResult(data);
        const entry: ScanHistoryEntry = { result: data, scannedAt: new Date().toISOString() };
        const updated = [entry, ...recentScans.filter(s => s.result.product.barcode !== data.product.barcode)].slice(0, 50);
        setRecentScans(updated);
        localStorage.setItem('sproutscan_recent', JSON.stringify(updated));
      }
    } catch {
      setError('Failed to analyze product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualIngredients = async (ingredientsText: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientsText,
          trimester: stageToTrimester(profile?.stage || 2),
          product: result?.product,
        }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
        const entry: ScanHistoryEntry = { result: data, scannedAt: new Date().toISOString() };
        const updated = [entry, ...recentScans.filter(s => s.result.product.barcode !== data.product.barcode)].slice(0, 50);
        setRecentScans(updated);
        localStorage.setItem('sproutscan_recent', JSON.stringify(updated));
      }
    } catch {
      setError('Failed to analyze ingredients. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError(null);
  };

  const goHome = () => {
    setResult(null);
    setError(null);
    setScanning(false);
    setManualSearch(false);
    setShowHistory(false);
  };

  const isHome = !scanning && !loading && !result && !error && !manualSearch && !showHistory;

  const changeStage = () => {
    setProfile(null);
    localStorage.removeItem('sproutscan_profile');
  };

  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-md sticky top-0 z-10"
        style={{ borderBottom: '1px solid rgba(232,131,107,0.07)' }}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isHome && (
              <button
                onClick={goHome}
                className="p-1.5 -ml-1.5 rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Back to home"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <button
              onClick={goHome}
              className="flex items-center gap-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label="Go to home"
            >
              <SproutScanIcon size={32} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>
                Sprout<span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scan</span>
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {recentScans.length > 0 && isHome && (
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Scan history"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </button>
            )}
            <button
              onClick={changeStage}
              className="text-sm px-3 py-1.5 rounded-full font-medium transition-colors"
              style={{ background: 'var(--brand-coral-pale)', color: 'var(--brand-coral)' }}
            >
              {stageLabel(profile.stage)}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--safety-avoid-bg)', border: '1px solid var(--safety-avoid-border)' }}>
            <div className="flex items-start gap-3">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--safety-avoid-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--safety-avoid-text)" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Product not found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            </div>
            <button
              onClick={resetScan}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold transition-colors btn-press"
              style={{ background: 'white', color: 'var(--safety-avoid-text)' }}
            >
              Try Another Product
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--bg-blush)' }}></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--brand-coral)', borderTopColor: 'transparent' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <SproutScanIcon size={32} />
              </div>
            </div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Analyzing ingredients...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Checking safety databases</p>
          </div>
        )}

        {/* Result View */}
        {result && !loading && (
          <ProductResult result={result} onScanAnother={resetScan} onManualIngredients={handleManualIngredients} />
        )}

        {/* Scanner View */}
        {scanning && !loading && !result && (
          <Scanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}

        {/* Manual Search Modal */}
        {manualSearch && !loading && !result && !scanning && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>Search by Barcode</h3>
                <button onClick={() => setManualSearch(false)} style={{ color: 'var(--text-muted)', fontSize: '24px', lineHeight: 1 }}>&times;</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (searchBarcode.trim()) handleScan(searchBarcode.trim()); }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={searchBarcode}
                  onChange={(e) => setSearchBarcode(e.target.value)}
                  placeholder="e.g., 049000006346"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--bg-blush)',
                    fontSize: '16px',
                    outline: 'none',
                    marginBottom: '12px',
                    fontFamily: 'Inter, system-ui',
                  }}
                />
                <button
                  type="submit"
                  disabled={!searchBarcode.trim()}
                  className="btn-press"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    background: searchBarcode.trim() ? 'linear-gradient(135deg, #E8836B, #D4567A)' : '#E0E0E0',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px',
                    border: 'none',
                    cursor: searchBarcode.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Check Product
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-hint)', textAlign: 'center', marginTop: '12px' }}>
                  The barcode is usually on the back or bottom of the package
                </p>
              </form>
            </div>
          </div>
        )}

        {/* History View */}
        {showHistory && !loading && !result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
                  Scan History
                </h2>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--brand-coral-pale)', color: 'var(--brand-coral)' }}
                >
                  {recentScans.length}
                </span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close history"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No scans yet</p>
                <p style={{ color: 'var(--text-hint)', fontSize: '13px', marginTop: '4px' }}>Scan a product to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentScans.map((entry, i) => (
                  <button
                    key={entry.result.product.barcode + i}
                    onClick={() => { setResult(entry.result); setShowHistory(false); }}
                    className="w-full rounded-2xl p-3 flex items-center gap-3 card-hover text-left"
                    style={{ background: 'white', border: '1px solid rgba(232,131,107,0.07)', boxShadow: 'var(--shadow-card)' }}
                  >
                    {entry.result.product.image ? (
                      <img src={entry.result.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5">
                          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{entry.result.product.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{entry.result.product.brand}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-hint)', whiteSpace: 'nowrap' }}>{timeAgo(entry.scannedAt)}</span>
                      </div>
                    </div>
                    <SafetyBadge rating={entry.result.overallSafety} size="sm" />
                  </button>
                ))}
              </div>
            )}

            {recentScans.length > 0 && (
              <div className="text-center pt-2 pb-4">
                <button
                  onClick={() => {
                    setRecentScans([]);
                    localStorage.removeItem('sproutscan_recent');
                    setShowHistory(false);
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-hint)' }}
                >
                  Clear History
                </button>
              </div>
            )}
          </div>
        )}

        {/* Home View */}
        {!scanning && !loading && !result && !error && !manualSearch && !showHistory && (
          <div className="space-y-7">
            {/* Wordmark */}
            <div className="text-center pt-6 pb-2">
              <div className="flex justify-center">
                <SproutScanWordmark scale={1.15} />
              </div>
            </div>

            {/* Hero Illustration — 3-step flow */}
            <div className="flex items-center justify-center gap-2 py-4">
              {/* Step 1: Scan */}
              <div className="flex flex-col items-center">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-coral-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand-coral)" strokeWidth="2">
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.5" />
                  </svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '6px' }}>Scan</span>
              </div>

              {/* Arrow */}
              <svg width="24" height="12" viewBox="0 0 24 12" style={{ marginBottom: 16 }}>
                <line x1="0" y1="6" x2="18" y2="6" stroke="var(--brand-coral-light)" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M16 2l4 4-4 4" stroke="var(--brand-coral-light)" strokeWidth="2" fill="none" />
              </svg>

              {/* Step 2: Check */}
              <div className="flex flex-col items-center">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--brand-coral-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--brand-coral)" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '6px' }}>Check</span>
              </div>

              {/* Arrow */}
              <svg width="24" height="12" viewBox="0 0 24 12" style={{ marginBottom: 16 }}>
                <line x1="0" y1="6" x2="18" y2="6" stroke="var(--brand-coral-light)" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M16 2l4 4-4 4" stroke="var(--brand-coral-light)" strokeWidth="2" fill="none" />
              </svg>

              {/* Step 3: Nourish */}
              <div className="flex flex-col items-center">
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="22" x2="12" y2="8" stroke="var(--green-forest)" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M12,12 C9,10 5,6 3,2 C8,2 11,8 13,11" fill="var(--green-primary)" />
                    <path d="M12,9 C15,6 19,3 21,2 C21,7 17,11 14,13" fill="var(--green-primary)" opacity="0.75" />
                  </svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '6px' }}>Nourish</span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Know what&apos;s safe
                <br />
                <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  for you & baby
                </span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '10px', lineHeight: 1.5 }}>
                Scan any food product. Get instant, trimester-specific safety guidance backed by medical research.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={() => setScanning(true)}
                className="w-full py-4 font-bold text-lg text-white btn-press scan-pulse"
                style={{ background: 'linear-gradient(135deg, #E8836B, #D4567A)', borderRadius: '14px', boxShadow: 'var(--shadow-button)', border: 'none' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                  </svg>
                  Scan a Product
                </span>
              </button>
              <button
                onClick={() => { setManualSearch(true); setSearchBarcode(''); }}
                className="w-full py-4 font-bold text-base btn-press"
                style={{ background: 'transparent', border: '2px solid var(--brand-coral)', borderRadius: '14px', color: 'var(--brand-coral)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Search by Name
                </span>
              </button>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3">
              <FeatureCard
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
                    <line x1="7" y1="12" x2="17" y2="12" />
                  </svg>
                }
                iconBg="var(--brand-coral)"
                title="Scan Any Barcode"
                description="Point your camera at any food product barcode for instant analysis"
              />
              <FeatureCard
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                }
                iconBg="var(--brand-rose)"
                title="Trimester-Specific"
                description="Safety guidance tailored to your current stage of pregnancy"
              />
              <FeatureCard
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
                iconBg="var(--green-primary)"
                title="415 Ingredients Checked"
                description="Comprehensive database backed by FDA, ACOG, and WHO guidelines"
              />
            </div>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '10px', paddingLeft: '2px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                    Recent Scans
                  </h3>
                  {recentScans.length > 5 && (
                    <button
                      onClick={() => setShowHistory(true)}
                      className="text-sm font-semibold transition-colors"
                      style={{ color: 'var(--brand-coral)' }}
                    >
                      See All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {recentScans.slice(0, 5).map((entry, i) => (
                    <button
                      key={entry.result.product.barcode + i}
                      onClick={() => setResult(entry.result)}
                      className="w-full rounded-2xl p-3 flex items-center gap-3 card-hover text-left"
                      style={{ background: 'white', border: '1px solid rgba(232,131,107,0.07)', boxShadow: 'var(--shadow-card)' }}
                    >
                      {entry.result.product.image ? (
                        <img src={entry.result.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{entry.result.product.name}</p>
                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{entry.result.product.brand}</p>
                      </div>
                      <SafetyBadge rating={entry.result.overallSafety} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Footer */}
            <div className="text-center pt-2 pb-8">
              <p style={{ fontSize: '12px', color: 'var(--text-hint)' }}>
                Based on guidelines from ACOG, FDA, and WHO
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-hint)', marginTop: '6px' }}>
                <Link href="/legal/terms" style={{ textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--text-hint)' }}>
                  Terms of Service
                </Link>
                {' · '}
                <Link href="/legal/privacy" style={{ textDecoration: 'underline', textUnderlineOffset: '3px', color: 'var(--text-hint)' }}>
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeatureCard({ icon, iconBg, title, description }: { icon: React.ReactNode; iconBg: string; title: string; description: string }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '18px',
        border: '1px solid rgba(232,131,107,0.07)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{description}</div>
      </div>
    </div>
  );
}
