export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFAF9] px-6 text-center">
      <span className="text-6xl mb-6">🌱</span>
      <h1 className="text-2xl font-bold text-[#4A3B2A] mb-3">
        You&apos;re offline
      </h1>
      <p className="text-[#8B7355] max-w-sm mb-8">
        SproutScan needs an internet connection to look up food safety data.
        Check your connection and try again.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-[#E8836B] text-white rounded-full font-medium hover:bg-[#d4725c] transition-colors"
      >
        Try again
      </a>
    </div>
  );
}
