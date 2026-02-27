import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  themeColor: "#E8836B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://app-seven-sigma-70.vercel.app"),
  title: "SproutScan — Pregnancy Food Safety",
  description: "Scan any food product barcode. Get instant, trimester-specific pregnancy safety guidance backed by medical research.",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SproutScan",
  },
  openGraph: {
    title: "SproutScan — Pregnancy Food Safety",
    description: "Scan any food product barcode. Get instant, trimester-specific pregnancy safety guidance backed by medical research.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
