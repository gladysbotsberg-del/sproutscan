import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SproutScan — Pregnancy Food Safety",
  description: "Scan any food product barcode. Get instant, trimester-specific pregnancy safety guidance backed by medical research.",
  icons: {
    icon: "/favicon.svg",
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
        {children}
      </body>
    </html>
  );
}
