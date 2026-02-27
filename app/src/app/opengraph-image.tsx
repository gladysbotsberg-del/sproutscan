import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SproutScan — Pregnancy Food Safety';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #E8836B 0%, #E06B80 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 8 }}>🌱</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
          }}
        >
          SproutScan
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 600,
            textAlign: 'center',
          }}
        >
          Scan any food product. Get instant pregnancy safety guidance.
        </div>
      </div>
    ),
    { ...size }
  );
}
