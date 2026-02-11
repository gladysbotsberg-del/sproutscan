interface SafetyBadgeProps {
  rating: 'safe' | 'caution' | 'avoid' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  safe: {
    bg: 'var(--safety-safe-bg)',
    text: 'var(--safety-safe-text)',
    border: 'var(--safety-safe-border)',
    icon: '\u2713',
    label: 'Safe',
  },
  caution: {
    bg: 'var(--safety-caution-bg)',
    text: 'var(--safety-caution-text)',
    border: 'var(--safety-caution-border)',
    icon: '!',
    label: 'Caution',
  },
  avoid: {
    bg: 'var(--safety-avoid-bg)',
    text: 'var(--safety-avoid-text)',
    border: 'var(--safety-avoid-border)',
    icon: '\u2715',
    label: 'Avoid',
  },
  unknown: {
    bg: '#F5F5F5',
    text: 'var(--text-secondary)',
    border: '#E0E0E0',
    icon: '?',
    label: 'Unknown',
  },
};

const sizeStyles = {
  sm: { padding: '3px 10px', fontSize: '12px', gap: '4px', iconSize: '12px' },
  md: { padding: '5px 14px', fontSize: '14px', gap: '6px', iconSize: '14px' },
  lg: { padding: '8px 20px', fontSize: '16px', gap: '8px', iconSize: '16px' },
};

export default function SafetyBadge({ rating, size = 'md' }: SafetyBadgeProps) {
  const c = config[rating];
  const s = sizeStyles[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        padding: s.padding,
        borderRadius: '999px',
        fontSize: s.fontSize,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1.5px solid ${c.border}`,
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: s.iconSize, fontWeight: 700 }}>{c.icon}</span>
      {c.label}
    </span>
  );
}
