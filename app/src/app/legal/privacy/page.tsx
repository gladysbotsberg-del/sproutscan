import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header
        className="bg-white/80 backdrop-blur-md sticky top-0 z-10"
        style={{ borderBottom: '1px solid rgba(232,131,107,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
            Sprout<span style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scan</span>
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '32px' }}>
          Last Updated: February 2026
        </p>

        <div className="space-y-6" style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. Overview
            </h2>
            <p>
              SproutScan is designed with your privacy in mind. We believe in transparency about how your information is handled. The short version: we collect virtually nothing, and your data stays on your device.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Information We Don&apos;t Collect
            </h2>
            <p>
              SproutScan does <strong>not</strong> require user accounts and does not collect personal information. We do not use tracking cookies, analytics services, or any form of user tracking. We do not collect your name, email address, location, or any other personally identifiable information.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Local Storage
            </h2>
            <p>
              SproutScan uses your browser&apos;s localStorage to save your onboarding preferences (such as trimester and dietary restrictions) and your recent scan history. This data is stored entirely on your device and is <strong>never transmitted</strong> to any server. You can clear this data at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. Camera & Photos
            </h2>
            <p>
              SproutScan accesses your camera for barcode scanning and ingredient list OCR. All photo processing happens entirely client-side in your browser. Photos are <strong>never uploaded</strong> to any server, and no images are stored beyond the immediate processing session.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              5. Third-Party Services
            </h2>
            <p>
              When you scan a barcode or search for a product, the barcode number is sent to OpenFoodFacts and/or USDA FoodData Central APIs to retrieve product information. No personal information is included in these requests. The Tesseract.js OCR library downloads language data files from the jsDelivr CDN for text recognition processing.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              6. Data Retention
            </h2>
            <p>
              All data is stored in your browser&apos;s localStorage. We do not retain any data on our servers. You can clear all stored data at any time by clearing your browser&apos;s site data or localStorage through your browser settings.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              7. Children&apos;s Privacy
            </h2>
            <p>
              SproutScan is not directed at children under 13 years of age. We do not knowingly collect any information from children under 13.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              8. Changes to Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be reflected by updating the &ldquo;Last Updated&rdquo; date at the top of this page. Continued use of SproutScan after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <div style={{ borderTop: '1px solid var(--bg-blush)', paddingTop: '20px', marginTop: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
              See also our{' '}
              <Link href="/legal/terms" style={{ color: 'var(--brand-coral)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
