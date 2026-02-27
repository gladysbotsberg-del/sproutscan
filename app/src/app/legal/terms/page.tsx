import Link from 'next/link';

export default function TermsOfService() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-hint)', marginBottom: '32px' }}>
          Last Updated: February 2026
        </p>

        <div className="space-y-6" style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using SproutScan, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Informational Purpose Only
            </h2>
            <p>
              SproutScan provides general informational content about food ingredient safety during pregnancy. This information is <strong>not medical advice</strong> and is not intended to replace professional medical guidance. Always consult your healthcare provider about your specific dietary needs and concerns during pregnancy or breastfeeding.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Data Sources & Accuracy
            </h2>
            <p>
              SproutScan retrieves product and ingredient data from third-party sources including OpenFoodFacts and USDA FoodData Central. While we strive to provide accurate, up-to-date information, this data may not be 100% accurate, complete, or current. Product formulations may change without notice, and database entries may contain errors or omissions.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. OCR Feature
            </h2>
            <p>
              The &ldquo;Snap Ingredient List&rdquo; feature uses Tesseract.js to perform optical character recognition (OCR) entirely on your device. Photos you take are processed client-side in your browser and are <strong>never uploaded</strong> to any server. OCR accuracy may vary depending on image quality, lighting, and text formatting.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              5. No Warranty
            </h2>
            <p>
              SproutScan is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the information provided will be error-free or uninterrupted.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              6. User Responsibility
            </h2>
            <p>
              You are solely responsible for any decisions you make based on the information provided by SproutScan. Always verify ingredient safety with your healthcare provider, especially if you have specific allergies, medical conditions, or dietary restrictions. Check physical product labels for the most current ingredient information.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, SproutScan and its creators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the application, or from any information provided by the application.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              8. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be reflected by updating the &ldquo;Last Updated&rdquo; date at the top of this page. Continued use of SproutScan after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <div style={{ borderTop: '1px solid var(--bg-blush)', paddingTop: '20px', marginTop: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-hint)' }}>
              See also our{' '}
              <Link href="/legal/privacy" style={{ color: 'var(--brand-coral)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
