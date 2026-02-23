import { Stage, stageLabel } from '@/app/page';
import SafetyBadge from './SafetyBadge';

interface ResultCardProps {
  productName: string;
  brand?: string;
  rating: 'safe' | 'caution' | 'avoid' | 'unknown';
  category?: string;
  stage?: Stage;
  explanation?: string;
  image?: string | null;
}

export default function ResultCard({
  productName,
  brand,
  rating,
  category,
  stage,
  explanation,
  image,
}: ResultCardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid rgba(232,131,107,0.07)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        {image ? (
          <img
            src={image}
            alt={productName}
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              borderRadius: '14px',
              background: 'var(--bg-warm)',
            }}
          />
        ) : (
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: 'var(--bg-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '17px',
                color: 'var(--text-primary)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {productName}
            </h3>
            <SafetyBadge rating={rating} size="sm" />
          </div>
          {brand && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{brand}</p>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {category && (
              <span style={{ fontSize: '11px', color: 'var(--text-hint)', background: 'var(--bg-warm)', padding: '2px 8px', borderRadius: '6px' }}>
                {category}
              </span>
            )}
            {stage && (
              <span style={{ fontSize: '11px', color: 'var(--text-hint)', background: 'var(--bg-warm)', padding: '2px 8px', borderRadius: '6px' }}>
                {stageLabel(stage)}
              </span>
            )}
          </div>
        </div>
      </div>
      {explanation && (
        <div style={{ padding: '0 16px 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {explanation}
        </div>
      )}
    </div>
  );
}
