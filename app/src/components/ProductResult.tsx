'use client';

import { SafetyResult, FlaggedIngredient } from '@/app/page';
import { useState } from 'react';
import SafetyBadge from './SafetyBadge';

interface ProductResultProps {
  result: SafetyResult;
  onScanAnother: () => void;
  onManualIngredients?: (ingredientsText: string) => void;
}

export default function ProductResult({ result, onScanAnother, onManualIngredients }: ProductResultProps) {
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleManualSubmit = async () => {
    if (!manualText.trim() || !onManualIngredients) return;
    setManualLoading(true);
    setManualError(null);
    try {
      await onManualIngredients(manualText.trim());
    } catch {
      setManualError('Failed to analyze. Please try again.');
    } finally {
      setManualLoading(false);
    }
  };

  const safetyConfig: Record<string, { bg: string; icon: string; label: string; color: string; border: string }> = {
    safe: {
      bg: 'var(--safety-safe-bg)',
      icon: '\u2713',
      label: 'Safe to Enjoy',
      color: 'var(--safety-safe-text)',
      border: 'var(--safety-safe-border)',
    },
    caution: {
      bg: 'var(--safety-caution-bg)',
      icon: '!',
      label: 'Use Caution',
      color: 'var(--safety-caution-text)',
      border: 'var(--safety-caution-border)',
    },
    avoid: {
      bg: 'var(--safety-avoid-bg)',
      icon: '\u2717',
      label: 'Best to Avoid',
      color: 'var(--safety-avoid-text)',
      border: 'var(--safety-avoid-border)',
    },
    unknown: {
      bg: 'var(--bg-warm)',
      icon: '?',
      label: 'No Ingredient Data',
      color: 'var(--text-secondary)',
      border: 'rgba(0,0,0,0.08)',
    },
  };

  const config = safetyConfig[result.overallSafety];

  return (
    <div className="space-y-5">
      {/* Product Card */}
      <div
        style={{
          background: 'white',
          borderRadius: '18px',
          padding: '16px',
          border: '1px solid rgba(232,131,107,0.07)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center gap-4">
          {result.product.image ? (
            <img
              src={result.product.image}
              alt={result.product.name}
              className="w-20 h-20 object-contain rounded-xl"
              style={{ background: 'var(--bg-blush)' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-blush)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-lg leading-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {result.product.name}
            </h3>
            {result.product.brand && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {result.product.brand}
              </p>
            )}
            {result.product.source && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-hint)' }}>
                via {result.product.source}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Safety Rating Card */}
      <div
        style={{
          borderRadius: '18px',
          padding: '24px',
          textAlign: 'center',
          background: config.bg,
          border: `1.5px solid ${config.border}`,
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: config.color }}
        >
          {config.icon}
        </div>
        <div
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: config.color }}
        >
          {config.label}
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {result.noIngredients
            ? 'Check the package for ingredients'
            : result.flaggedIngredients.length === 0
              ? 'No concerning ingredients detected'
              : `${result.flaggedIngredients.length} ingredient${result.flaggedIngredients.length > 1 ? 's' : ''} to watch`
          }
        </p>
      </div>

      {/* No Ingredients Message + Manual Entry */}
      {result.noIngredients && (
        <>
          {result.message && !showManualEntry && (
            <div
              style={{
                borderRadius: '18px',
                padding: '16px',
                background: 'var(--safety-caution-bg)',
                border: '1.5px solid var(--safety-caution-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--safety-caution-text)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{result.message}</p>
              </div>
            </div>
          )}

          {!showManualEntry ? (
            <button
              onClick={() => setShowManualEntry(true)}
              className="w-full py-4 rounded-2xl font-bold text-white btn-press"
              style={{
                background: 'var(--brand-gradient)',
                boxShadow: 'var(--shadow-button)',
                border: 'none',
                fontSize: '16px',
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Type Ingredients Manually
              </span>
            </button>
          ) : (
            <div
              style={{
                borderRadius: '18px',
                padding: '20px',
                background: 'white',
                border: '1px solid rgba(232,131,107,0.07)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h4
                className="font-bold mb-3"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '16px' }}
              >
                Enter Ingredients
              </h4>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste or type the ingredient list from the package..."
                autoFocus
                rows={5}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--bg-blush)',
                  fontSize: '14px',
                  fontFamily: 'Inter, system-ui',
                  resize: 'vertical',
                  outline: 'none',
                  lineHeight: 1.5,
                }}
              />
              {manualError && (
                <p className="text-sm mt-2" style={{ color: 'var(--safety-avoid-text)' }}>{manualError}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualText.trim() || manualLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white btn-press"
                  style={{
                    background: manualText.trim() && !manualLoading ? 'var(--brand-gradient)' : '#E0E0E0',
                    border: 'none',
                    fontSize: '15px',
                    cursor: manualText.trim() && !manualLoading ? 'pointer' : 'not-allowed',
                  }}
                >
                  {manualLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Check Ingredients'
                  )}
                </button>
                <button
                  onClick={() => { setShowManualEntry(false); setManualText(''); setManualError(null); }}
                  className="py-3 px-4 font-medium"
                  style={{ color: 'var(--text-muted)', fontSize: '15px', background: 'none', border: 'none' }}
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-hint)' }}>
                Tip: Copy the ingredients list exactly as shown on the package, separated by commas.
              </p>
            </div>
          )}
        </>
      )}

      {/* Flagged Ingredients */}
      {result.flaggedIngredients.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(232,131,107,0.07)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bg-blush)' }}>
            <h4
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Ingredients to Watch
            </h4>
          </div>
          <div>
            {result.flaggedIngredients.map((ingredient, idx) => (
              <IngredientCard
                key={ingredient.name}
                ingredient={ingredient}
                expanded={expandedIngredient === ingredient.name}
                onToggle={() => setExpandedIngredient(
                  expandedIngredient === ingredient.name ? null : ingredient.name
                )}
                isLast={idx === result.flaggedIngredients.length - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Safe Ingredients */}
      {result.safeIngredients.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(232,131,107,0.07)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bg-blush)' }}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
              style={{ background: 'var(--green-primary)' }}
            >
              {'\u2713'}
            </div>
            <h4
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Safe Ingredients
            </h4>
            <span
              className="ml-auto text-sm px-2 py-0.5 rounded-full"
              style={{ background: 'var(--green-pale)', color: 'var(--green-primary)' }}
            >
              {result.safeIngredients.length}
            </span>
          </div>
          <div className="p-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {result.safeIngredients.slice(0, 8).join(', ')}
              {result.safeIngredients.length > 8 && (
                <span style={{ color: 'var(--text-muted)' }}> +{result.safeIngredients.length - 8} more</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Unknown Ingredients (if many) */}
      {result.unknownIngredients.length > 3 && (
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            padding: '16px',
            border: '1px solid rgba(232,131,107,0.07)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {result.unknownIngredients.length} ingredients not in our database
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Common food ingredients — likely safe, but not specifically reviewed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div
        style={{
          borderRadius: '18px',
          padding: '16px',
          background: 'var(--bg-blush)',
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <strong>Note:</strong> This is educational information, not medical advice.
          Always consult your healthcare provider about your specific dietary needs during pregnancy.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onScanAnother}
          className="w-full py-4 rounded-2xl font-bold text-white btn-press"
          style={{
            background: 'var(--brand-gradient)',
            boxShadow: 'var(--shadow-button)',
          }}
        >
          Scan Another Product
        </button>
      </div>
    </div>
  );
}

function IngredientCard({
  ingredient,
  expanded,
  onToggle,
  isLast
}: {
  ingredient: FlaggedIngredient;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  const isAvoid = ingredient.rating === 'avoid';
  const bgColor = isAvoid ? 'var(--safety-avoid-bg)' : 'var(--safety-caution-bg)';
  const textColor = isAvoid ? 'var(--safety-avoid-text)' : 'var(--safety-caution-text)';
  const icon = isAvoid ? '\u2717' : '!';

  return (
    <div style={{ borderBottom: !isLast ? '1px solid var(--bg-blush)' : 'none' }}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center gap-3 btn-press"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: bgColor, color: textColor }}
        >
          {icon}
        </div>
        <span className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
          {ingredient.name}
        </span>
        <SafetyBadge rating={ingredient.rating as 'caution' | 'avoid'} size="sm" />
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div
            style={{
              borderRadius: '12px',
              padding: '12px',
              background: bgColor,
              border: `1px solid ${isAvoid ? 'var(--safety-avoid-border)' : 'var(--safety-caution-border)'}`,
            }}
          >
            <p className="text-sm font-medium flex items-center gap-2" style={{ color: textColor }}>
              {isAvoid ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {ingredient.rating === 'avoid' ? 'Recommended to avoid' : 'Use with caution'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Why it's flagged
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {ingredient.concern}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              What it is
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {ingredient.explanation}
            </p>
          </div>

          <div
            style={{
              borderRadius: '12px',
              padding: '12px',
              background: 'var(--bg-warm)',
            }}
          >
            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>
              Bottom Line
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {ingredient.bottomLine}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
