export const SproutScanIcon = ({ size = 48 }: { size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size}>
    <defs>
      <linearGradient id="lf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ECF7A" /><stop offset="100%" stopColor="#3DA85C" />
      </linearGradient>
      <linearGradient id="cr" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E8836B" /><stop offset="100%" stopColor="#D4567A" />
      </linearGradient>
      <linearGradient id="ht" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F4A89A" /><stop offset="100%" stopColor="#D4567A" />
      </linearGradient>
    </defs>
    {/* Stem */}
    <line x1="32" y1="50" x2="32" y2="14" stroke="#3DA85C" strokeWidth="4" strokeLinecap="round" />
    {/* Left leaf */}
    <path d="M32,26 C26,22 18,14 14,6 C22,6 30,16 34,24" fill="url(#lf)" />
    {/* Right leaf */}
    <path d="M32,20 C38,14 46,8 52,6 C52,14 44,22 36,28" fill="url(#lf)" opacity="0.8" />
    {/* Ground */}
    <path d="M22,50 C26,48 38,48 42,50" stroke="#3DA85C" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.35" />
    {/* Scan line */}
    <line x1="13" y1="36" x2="51" y2="36" stroke="url(#cr)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    {/* Heart on left */}
    <path d="M7,34 C7,32.5 5.5,31 4,31 C2,31 1,32.5 1,34 C1,37.5 7,41 7,41 C7,41 13,37.5 13,34 C13,32.5 12,31 10,31 C8.5,31 7,32.5 7,34 Z" fill="url(#ht)" opacity="0.85" />
    {/* Apple on right */}
    <circle cx="57" cy="37.5" r="5" fill="#E85D4A" opacity="0.8" />
    <path d="M57,33 Q58.2,29.5 59.5,31" stroke="#3DA85C" strokeWidth="1.2" fill="none" opacity="0.9" />
  </svg>
);
