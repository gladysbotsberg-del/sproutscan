'use client';

import { SafetyResult, FlaggedIngredient } from '@/app/page';
import { useState } from 'react';

interface ProductResultProps {
  result: SafetyResult;
  onScanAnother: () => void;
}

export default function ProductResult({ result, onScanAnother }: ProductResultProps) {
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const safetyConfig: Record<string, { bg: string; icon: string; label: string; color: string }> = {
    safe: { 
      bg: 'var(--safe-green-light)', 
      icon: '✓', 
      label: 'Safe to Enjoy',
      color: 'var(--safe-green)'
    },
    caution: { 
      bg: 'var(--caution-amber-light)', 
      icon: '!', 
      label: 'Use Caution',
      color: 'var(--caution-amber)'
    },
    avoid: { 
      bg: 'var(--avoid-red-light)', 
      icon: '✗', 
      label: 'Best to Avoid',
      color: 'var(--avoid-red)'
    },
    unknown: { 
      bg: 'var(--border-light)', 
      icon: '?', 
      label: 'No Ingredient Data',
      color: 'var(--text-secondary)'
    },
  };

  const config = safetyConfig[result.overallSafety];

  return (
    <div className="space-y-5">
      {/* Product Card */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-4">
          {result.product.image ? (
            <img 
              src={result.product.image} 
              alt={result.product.name}
              className="w-20 h-20 object-contain rounded-xl"
              style={{ background: 'var(--mama-peach)' }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--mama-peach)' }}
            >
              <span className="text-3xl">📦</span>
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
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                via {result.product.source}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Safety Rating Card */}
      <div 
        className="rounded-2xl p-6 text-center"
        style={{ background: config.bg }}
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

      {/* No Ingredients Message */}
      {result.noIngredients && result.message && (
        <div 
          className="rounded-2xl p-4"
          style={{ background: 'var(--caution-amber-light)' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{result.message}</p>
          </div>
        </div>
      )}

      {/* Flagged Ingredients */}
      {result.flaggedIngredients.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
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
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
              style={{ background: 'var(--safe-green)' }}
            >
              ✓
            </div>
            <h4 
              className="font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              Safe Ingredients
            </h4>
            <span 
              className="ml-auto text-sm px-2 py-0.5 rounded-full"
              style={{ background: 'var(--safe-green-light)', color: 'var(--safe-green)' }}
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
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔬</span>
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
        className="rounded-2xl p-4"
        style={{ background: 'var(--mama-coral-light)' }}
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
          style={{ background: 'linear-gradient(135deg, var(--mama-coral) 0%, #E8927A 100%)' }}
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
  const bgColor = isAvoid ? 'var(--avoid-red-light)' : 'var(--caution-amber-light)';
  const textColor = isAvoid ? 'var(--avoid-red)' : 'var(--caution-amber)';
  const icon = isAvoid ? '✗' : '!';

  return (
    <div 
      className={!isLast ? 'border-b' : ''}
      style={{ borderColor: 'var(--border-light)' }}
    >
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
            className="rounded-xl p-3"
            style={{ background: bgColor }}
          >
            <p className="text-sm font-medium" style={{ color: textColor }}>
              {ingredient.rating === 'avoid' ? '🚫 ' : '⚠️ '}
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
            className="rounded-xl p-3"
            style={{ background: 'var(--mama-peach)' }}
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
