import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://app-seven-sigma-70.vercel.app';
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: now,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: now,
    },
  ];
}
