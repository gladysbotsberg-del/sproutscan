'use client';

import { SafetyResult, FlaggedIngredient, ProductData } from '@/app/page';
import { useState } from 'react';

interface ProductResultProps {
  result: SafetyResult;
  onScanAnother: () => void;
}

export default function ProductResult({ result, onScanAnother }: ProductResultProps) {
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const safetyColors: Record<string, string> = {
    safe: 'bg-green-100 border-green-500 text-green-700',
    caution: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    avoid: 'bg-red-100 border-red-500 text-red-700',
    unknown: 'bg-gray-100 border-gray-500 text-gray-700',
  };

  const safetyIcons: Record<string, string> = {
    safe: '✅',
    caution: '⚠️',
    avoid: '🚫',
    unknown: '❓',
  };

  const safetyLabels: Record<string, string> = {
    safe: 'Generally Safe',
    caution: 'Use Caution',
    avoid: 'Avoid',
    unknown: 'No Ingredient Data',
  };

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
        {result.product.image ? (
          <img 
            src={result.product.image} 
            alt={result.product.name}
            className="w-20 h-20 object-contain rounded-lg bg-gray-100"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{result.product.name}</h3>
          {result.product.brand && (
            <p className="text-sm text-gray-500">{result.product.brand}</p>
          )}
        </div>
      </div>

      {/* Overall Safety Rating */}
      <div className={`rounded-xl border-2 p-6 text-center ${safetyColors[result.overallSafety]}`}>
        <div className="text-4xl mb-2">{safetyIcons[result.overallSafety]}</div>
        <div className="text-xl font-bold">{safetyLabels[result.overallSafety]}</div>
        <div className="text-sm mt-2 opacity-80">
          {result.noIngredients 
            ? 'Check the package for ingredients'
            : result.flaggedIngredients.length === 0 
              ? 'No concerning ingredients found'
              : `${result.flaggedIngredients.length} ingredient${result.flaggedIngredients.length > 1 ? 's' : ''} to be aware of`
          }
        </div>
      </div>

      {/* No Ingredients Message */}
      {result.noIngredients && result.message && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 text-sm">{result.message}</p>
        </div>
      )}

      {/* Data Source */}
      {result.product.source && (
        <div className="text-xs text-gray-400 text-center">
          Data from: {result.product.source}
        </div>
      )}

      {/* Flagged Ingredients */}
      {result.flaggedIngredients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-700">Ingredients to Note</h4>
          </div>
          <div className="divide-y">
            {result.flaggedIngredients.map((ingredient) => (
              <IngredientCard
                key={ingredient.name}
                ingredient={ingredient}
                expanded={expandedIngredient === ingredient.name}
                onToggle={() => setExpandedIngredient(
                  expandedIngredient === ingredient.name ? null : ingredient.name
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Safe Ingredients */}
      {result.safeIngredients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-semibold text-gray-700">
              ✅ Safe Ingredients ({result.safeIngredients.length})
            </h4>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">
              {result.safeIngredients.slice(0, 5).join(', ')}
              {result.safeIngredients.length > 5 && ` +${result.safeIngredients.length - 5} more`}
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <strong>Note:</strong> This information is for educational purposes only and is not medical advice. 
        Always consult with your healthcare provider about your specific dietary needs during pregnancy.
      </div>

      {/* Scan Another */}
      <button
        onClick={onScanAnother}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors"
      >
        Scan Another Product
      </button>
    </div>
  );
}

function IngredientCard({ 
  ingredient, 
  expanded, 
  onToggle 
}: { 
  ingredient: FlaggedIngredient; 
  expanded: boolean;
  onToggle: () => void;
}) {
  const ratingColors = {
    caution: 'bg-yellow-100 text-yellow-700',
    avoid: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4">
      <button 
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${ratingColors[ingredient.rating]}`}>
            {ingredient.rating === 'avoid' ? '🚫 Avoid' : '⚠️ Caution'}
          </span>
          <span className="font-medium text-gray-800">{ingredient.name}</span>
        </div>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      
      {expanded && (
        <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">Why it's flagged</div>
            <p className="text-sm text-gray-700">{ingredient.concern}</p>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase mb-1">What you should know</div>
            <p className="text-sm text-gray-700">{ingredient.explanation}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase mb-1">Bottom Line</div>
            <p className="text-sm font-medium text-gray-800">{ingredient.bottomLine}</p>
          </div>
        </div>
      )}
    </div>
  );
}
