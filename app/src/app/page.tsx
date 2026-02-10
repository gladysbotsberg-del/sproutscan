'use client';

import { useState, useEffect } from 'react';
import Scanner from '@/components/Scanner';
import ProductResult from '@/components/ProductResult';
import Onboarding from '@/components/Onboarding';

export type Trimester = 1 | 2 | 3;

export interface UserProfile {
  trimester: Trimester;
  dueDate?: string;
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

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<SafetyResult[]>([]);

  // Load profile and recent scans from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('mamasense_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    const savedScans = localStorage.getItem('mamasense_recent');
    if (savedScans) {
      setRecentScans(JSON.parse(savedScans).slice(0, 5));
    }
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('mamasense_profile', JSON.stringify(newProfile));
  };

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setError(null);
    setScanning(false);
    
    try {
      const response = await fetch(`/api/scan?barcode=${barcode}&trimester=${profile?.trimester || 2}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.message || data.error);
      } else {
        setResult(data);
        // Save to recent scans
        const updated = [data, ...recentScans.filter(s => s.product.barcode !== data.product.barcode)].slice(0, 5);
        setRecentScans(updated);
        localStorage.setItem('mamasense_recent', JSON.stringify(updated));
      }
    } catch (err) {
      setError('Failed to analyze product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setError(null);
  };

  const changeTrimester = () => {
    setProfile(null);
    localStorage.removeItem('mamasense_profile');
  };

  // Show onboarding if no profile
  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--mama-cream)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--mama-coral-light)' }}>
              <span className="text-xl">🤰</span>
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              MamaSense
            </span>
          </div>
          <button 
            onClick={changeTrimester}
            className="text-sm px-3 py-1.5 rounded-full font-medium transition-colors"
            style={{ background: 'var(--mama-coral-light)', color: 'var(--mama-coral)' }}
          >
            Trimester {profile.trimester}
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--avoid-red-light)' }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">😕</span>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Product not found</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            </div>
            <button 
              onClick={resetScan}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold transition-colors btn-press"
              style={{ background: 'white', color: 'var(--avoid-red)' }}
            >
              Try Another Product
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--mama-coral)', borderTopColor: 'transparent' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>Analyzing ingredients...</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Checking safety databases</p>
          </div>
        )}

        {/* Result View */}
        {result && !loading && (
          <ProductResult result={result} onScanAnother={resetScan} />
        )}

        {/* Scanner View */}
        {scanning && !loading && !result && (
          <Scanner onScan={handleScan} onClose={() => setScanning(false)} />
        )}

        {/* Home View */}
        {!scanning && !loading && !result && !error && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center pt-6 pb-4">
              <div 
                className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--mama-coral-light) 0%, white 100%)' }}
              >
                <span className="text-5xl">📷</span>
              </div>
              <h2 
                className="text-2xl font-bold mb-2" 
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                Know what's safe
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Scan any product to check if it's safe during your pregnancy
              </p>
            </div>

            {/* Scan Button */}
            <button
              onClick={() => setScanning(true)}
              className="w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl btn-press scan-pulse"
              style={{ background: 'linear-gradient(135deg, var(--mama-coral) 0%, #E8927A 100%)' }}
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan Product
              </span>
            </button>

            {/* Safety Legend */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm card-hover">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: 'var(--safe-green-light)' }}
                >
                  <span className="text-xl">✓</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--safe-green)' }}>Safe</span>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm card-hover">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: 'var(--caution-amber-light)' }}
                >
                  <span className="text-xl">!</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--caution-amber)' }}>Caution</span>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center shadow-sm card-hover">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: 'var(--avoid-red-light)' }}
                >
                  <span className="text-xl">✗</span>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--avoid-red)' }}>Avoid</span>
              </div>
            </div>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div>
                <h3 
                  className="font-bold mb-3 px-1" 
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  Recent Scans
                </h3>
                <div className="space-y-2">
                  {recentScans.map((scan, i) => (
                    <button
                      key={scan.product.barcode + i}
                      onClick={() => setResult(scan)}
                      className="w-full bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm card-hover text-left"
                    >
                      {scan.product.image ? (
                        <img 
                          src={scan.product.image} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--border-light)' }}
                        >
                          <span className="text-xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {scan.product.name}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                          {scan.product.brand}
                        </p>
                      </div>
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          scan.overallSafety === 'safe' ? 'badge-safe' : 
                          scan.overallSafety === 'caution' ? 'badge-caution' : 
                          'badge-avoid'
                        }`}
                      >
                        {scan.overallSafety === 'safe' ? '✓' : scan.overallSafety === 'caution' ? '!' : '✗'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Footer */}
            <div className="text-center pt-4 pb-8">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Data from USDA FoodData Central & Open Food Facts
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Based on FDA, NIH & ACOG guidelines
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
