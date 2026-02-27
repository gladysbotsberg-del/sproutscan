import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SproutScan — Pregnancy Food Safety",
    short_name: "SproutScan",
    description:
      "Scan any food product barcode. Get instant, trimester-specific pregnancy safety guidance backed by medical research.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#E8836B",
    background_color: "#FFFAF9",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
