import { SproutScanIcon } from './SproutScanIcon';

export const SproutScanWordmark = ({ scale = 1 }: { scale?: number }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 * scale }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 * scale }}>
      <SproutScanIcon size={36 * scale} />
      <div style={{ fontFamily: 'var(--font-display, system-ui)', fontWeight: 800, fontSize: 26 * scale, letterSpacing: '-0.5px', lineHeight: 1 }}>
        <span style={{ color: 'var(--text-primary)' }}>Sprout</span>
        <span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scan</span>
      </div>
    </div>
    <span style={{ fontFamily: 'var(--font-body, system-ui)', fontWeight: 500, fontSize: 8.5 * scale, color: '#9B8585', letterSpacing: '2.5px' }}>
      PREGNANCY FOOD SAFETY
    </span>
  </div>
);
