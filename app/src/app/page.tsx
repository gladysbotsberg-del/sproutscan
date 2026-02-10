'use client';

import { useState } from 'react';
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
        setError(data.error);
      } else {
        setResult(data);
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

  // Show onboarding if no profile
  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-700">🍼 MamaSense</h1>
          <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Trimester {profile.trimester}
          </span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={resetScan}
              className="mt-3 text-red-600 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing ingredients...</p>
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
          <div className="text-center py-10">
            <div className="mb-8">
              <div className="w-32 h-32 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <span className="text-6xl">📱</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Scan Any Product
              </h2>
              <p className="text-gray-600">
                Point your camera at a barcode to check if it's safe for your pregnancy
              </p>
            </div>

            <button
              onClick={() => setScanning(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Start Scanning
            </button>

            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-xs text-gray-600">Safe</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="text-xs text-gray-600">Caution</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-2xl mb-2">🚫</div>
                <div className="text-xs text-gray-600">Avoid</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
