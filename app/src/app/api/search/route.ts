import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRetryAfter } from '@/lib/rate-limit';

const SEARCH_LIMIT = 40;
const SEARCH_WINDOW = 60_000; // 1 minute

interface SearchResult {
  name: string;
  brand: string;
  barcode: string;
  image: string | null;
  source: string;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  const { success, remaining } = rateLimit(ip, SEARCH_LIMIT, SEARCH_WINDOW);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(getRetryAfter(ip)) } }
    );
  }

  const q = request.nextUrl.searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [offResult, usdaResult] = await Promise.allSettled([
    searchOFFByName(q),
    searchUSDAByName(q),
  ]);

  const offItems = offResult.status === 'fulfilled' ? offResult.value : [];
  const usdaItems = usdaResult.status === 'fulfilled' ? usdaResult.value : [];

  // Deduplicate by normalized barcode (strip leading zeros), prefer OFF (has images)
  const seen = new Set<string>();
  const results: SearchResult[] = [];

  for (const item of [...offItems, ...usdaItems]) {
    const key = item.barcode.replace(/^0+/, '') || item.barcode;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
    if (results.length >= 15) break;
  }

  return NextResponse.json({ results });
}

async function searchOFFByName(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.products) return [];

    return data.products
      .filter((p: any) => p.code && p.product_name)
      .map((p: any) => ({
        name: p.product_name || p.product_name_en || 'Unknown',
        brand: p.brands || '',
        barcode: p.code,
        image: p.image_front_small_url || p.image_url || null,
        source: 'Open Food Facts',
      }));
  } catch {
    return [];
  }
}

async function searchUSDAByName(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=Branded&pageSize=10&api_key=DEMO_KEY`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.foods) return [];

    return data.foods
      .filter((f: any) => f.gtinUpc && f.description)
      .map((f: any) => ({
        name: f.description || 'Unknown',
        brand: f.brandOwner || f.brandName || '',
        barcode: f.gtinUpc,
        image: null,
        source: 'USDA',
      }));
  } catch {
    return [];
  }
}
