import { NextRequest, NextResponse } from 'next/server';
import ingredientsDB from '@/data/ingredients-comprehensive.json';

interface SafeIngredient {
  name: string;
  aliases: string[];
  category: string;
  why: string;
  note?: string;
}

interface ConcerningIngredient {
  name: string;
  aliases: string[];
  rating: string;
  category: string;
  why: string;
  avoid_if?: string;
}

interface ProductData {
  name: string;
  brand: string;
  image: string | null;
  ingredients: string[];
  barcode: string;
  source: string;
}

// Common prefixes to strip for fuzzy matching
const STRIP_PREFIXES = [
  'organic', 'natural', 'pure', 'raw', 'fresh', 'dried', 'dehydrated',
  'powdered', 'ground', 'whole', 'enriched', 'fortified', 'unbleached',
  'bleached', 'refined', 'unrefined', 'virgin', 'extra virgin', 'cold pressed',
  'expeller pressed', 'hydrogenated', 'cultured', 'pasteurized', 'homogenized',
  'low fat', 'lowfat', 'nonfat', 'non-fat', 'fat free', 'reduced fat',
  'light', 'lite', 'unsalted', 'salted', 'roasted', 'toasted', 'blanched',
  'freeze dried', 'freeze-dried', 'sun dried', 'sun-dried', 'air dried',
  'smoked', 'cured', 'fermented', 'sprouted', 'malted', 'instant',
  'quick', 'old fashioned', 'steel cut', 'rolled', 'flaked', 'cracked',
  'stone ground', 'stone-ground', 'farm raised', 'wild caught', 'grass fed',
  'cage free', 'free range', 'pasture raised', 'certified', 'non-gmo',
  'gmo free', 'gluten free', 'gluten-free', 'sugar free', 'sugar-free',
  'unsweetened', 'sweetened', 'lightly', 'heavily', 'partially', 'fully',
  'concentrated', 'reconstituted', 'from concentrate'
];

// Normalize ingredient text for matching (with prefix stripping for product ingredients)
function normalizeIngredient(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Remove parenthetical content
  normalized = normalized.replace(/\([^)]*\)/g, '').trim();

  // Remove common prefixes
  for (const prefix of STRIP_PREFIXES) {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    normalized = normalized.replace(regex, '');
  }

  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

// Basic normalization for DB entry names/aliases — NO prefix stripping.
// Prefixes like "raw", "cured", "pasteurized" are safety-critical qualifiers
// in DB entries (e.g. "raw milk" ≠ "milk") and must not be stripped.
function normalizeDBEntry(text: string): string {
  let normalized = text.toLowerCase().trim();
  normalized = normalized.replace(/\([^)]*\)/g, '').trim();
  normalized = normalized.replace(/\s+/g, ' ').trim();
  return normalized;
}

// Levenshtein edit distance for typo tolerance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Strip trailing s/es for basic plural tolerance
function depluralize(word: string): string {
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

// Check if needle appears as a complete word/phrase in haystack (word-boundary match)
function containsWholeWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`).test(haystack);
}

// Check if product ingredient `a` matches DB entry name/alias `b`
function isSimilar(a: string, b: string): boolean {
  const normA = normalizeIngredient(a);   // product ingredient — strip prefixes
  const rawA = normalizeDBEntry(a);        // product ingredient — unstripped (for exact alias matching)
  const normB = normalizeDBEntry(b);       // DB entry — preserve all qualifiers

  // Exact match — check both stripped and unstripped product text.
  // Stripped:   "organic wheat flour" → "wheat flour" === "wheat flour" ✓
  // Unstripped: "raw milk" → "raw milk" === "raw milk" ✓ (stripped would be just "milk")
  if (normA === normB || rawA === normB) return true;

  // Depluralized match
  if (depluralize(normA) === depluralize(normB)) return true;
  if (rawA !== normA && depluralize(rawA) === depluralize(normB)) return true;

  // Product ingredient contains DB entry as a whole word/phrase
  // Only this direction: DB entry IN product ingredient (not reverse)
  // e.g. product "soy lecithin" contains DB "lecithin" ✓
  // but product "salt" does NOT match DB alias "curing salt" ✗
  if (normB.length > 3 && (containsWholeWord(normA, normB) || containsWholeWord(rawA, normB))) return true;

  // Token overlap: all tokens from DB entry appear as whole words in product ingredient
  // e.g. DB "hydrogenated oil" → tokens ["hydrogenated","oil"] both in product "hydrogenated soybean oil" ✓
  // but DB "unpasteurized milk" → "unpasteurized" NOT in product "milk" ✗
  const tokensA = normA.split(/\s+/);
  const tokensB = normB.split(/\s+/);
  if (tokensB.length > 1) {
    const allMatch = tokensB.every(token =>
      token.length > 2 && (containsWholeWord(normA, token) || containsWholeWord(rawA, token))
    );
    if (allMatch) return true;
  }

  // Levenshtein edit distance — only for single-word comparisons to avoid
  // false positives like "sodium citrate" ≈ "sodium nitrite"
  // Min length 6 to avoid short-word collisions like "salt" ≈ "salp"
  if (tokensA.length === 1 && tokensB.length === 1) {
    const depA = depluralize(normA);
    const depB = depluralize(normB);
    const maxLen = Math.max(depA.length, depB.length);
    const minLen = Math.min(depA.length, depB.length);

    if (Math.abs(depA.length - depB.length) <= 2 && minLen >= 6) {
      const dist = levenshtein(depA, depB);
      const threshold = maxLen <= 7 ? 1 : 2;
      if (dist <= threshold) return true;
    }
  }

  return false;
}

// USDA FoodData Central text search by product name (fallback)
async function searchUSDAByName(productName: string): Promise<string[]> {
  try {
    console.log(`[SproutScan] USDA name search: "${productName}"`);

    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(productName)}&dataType=Branded&pageSize=5&api_key=DEMO_KEY`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      console.log(`[SproutScan] USDA name search: API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log(`[SproutScan] USDA name search: Found ${data.foods?.length || 0} results`);

    if (data.foods && data.foods.length > 0) {
      const withIngredients = data.foods.find((f: any) => f.ingredients && f.ingredients.length > 0);
      if (withIngredients) {
        console.log(`[SproutScan] USDA name search: Using "${withIngredients.description}" ingredients`);
        return parseIngredients(withIngredients.ingredients);
      }
    }

    console.log(`[SproutScan] USDA name search: No results with ingredients`);
    return [];
  } catch (err) {
    console.error('[SproutScan] USDA name search error:', err);
    return [];
  }
}

// USDA FoodData Central API
async function searchUSDA(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[SproutScan] USDA: Searching for ${barcode}`);
    
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&dataType=Branded&pageSize=10&api_key=DEMO_KEY`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      console.log(`[SproutScan] USDA: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[SproutScan] USDA: Found ${data.foods?.length || 0} results`);
    
    if (data.foods && data.foods.length > 0) {
      const cleanBarcode = barcode.replace(/^0+/, '');
      const exactMatch = data.foods.find((f: any) => {
        const upc = f.gtinUpc || '';
        const cleanUpc = upc.replace(/^0+/, '');
        return cleanUpc === cleanBarcode || upc === barcode;
      });

      // Only use exact barcode matches — falling back to foods[0] returns
      // unrelated products (e.g. deli meat for a snack mix barcode)
      if (exactMatch && exactMatch.ingredients) {
        console.log(`[SproutScan] USDA: Exact barcode match: ${exactMatch.description}`);
        return {
          name: exactMatch.description || 'Unknown Product',
          brand: exactMatch.brandOwner || exactMatch.brandName || '',
          image: null,
          ingredients: parseIngredients(exactMatch.ingredients || ''),
          barcode: barcode,
          source: 'USDA FoodData Central'
        };
      }
    }

    console.log(`[SproutScan] USDA: No exact barcode match`);
    return null;
  } catch (err) {
    console.error('[SproutScan] USDA API error:', err);
    return null;
  }
}

// Open Food Facts API
async function searchOpenFoodFacts(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[SproutScan] OpenFoodFacts: Searching for ${barcode}`);
    
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      console.log(`[SproutScan] OpenFoodFacts: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
      
      console.log(`[SproutScan] OpenFoodFacts: Found ${product.product_name}, ingredients: ${ingredientsText.length > 0 ? 'yes' : 'no'}`);
      
      return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || '',
        image: product.image_front_small_url || product.image_url || null,
        ingredients: parseIngredients(ingredientsText),
        barcode: barcode,
        source: 'Open Food Facts'
      };
    }
    
    console.log(`[SproutScan] OpenFoodFacts: Product not found`);
    return null;
  } catch (err) {
    console.error('[SproutScan] Open Food Facts API error:', err);
    return null;
  }
}

// Non-food category prefixes from Google Product Taxonomy (used by UPCitemdb)
const NON_FOOD_CATEGORIES = [
  'apparel', 'clothing', 'shoes', 'jewelry', 'accessories',
  'electronics', 'computers', 'software', 'cameras',
  'home & garden', 'furniture', 'office', 'hardware',
  'toys', 'games', 'sporting', 'vehicles', 'automotive',
  'arts & entertainment', 'media', 'books', 'music',
  'baby & toddler', 'mature',
  'business & industrial', 'luggage',
  'health & beauty', 'personal care',
];

// Title keywords that strongly indicate a non-food product
const NON_FOOD_TITLE_KEYWORDS = [
  'dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'blouse', 'sweater',
  'shoe', 'boot', 'sandal', 'sneaker', 'heel',
  'phone', 'laptop', 'tablet', 'charger', 'cable', 'adapter', 'battery',
  'toy', 'doll', 'figurine', 'puzzle',
  'shampoo', 'conditioner', 'lotion', 'perfume', 'cologne', 'deodorant',
  'necklace', 'bracelet', 'earring', 'ring',
  'mattress', 'pillow', 'curtain', 'rug',
  'maxi', 'tunic', 'legging', 'hoodie', 'cardigan',
];

function isLikelyFoodProduct(item: { title?: string; category?: string }): boolean {
  const category = (item.category || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  // If category exists, check it
  if (category.length > 0) {
    // Positive: category explicitly mentions food/beverages/grocery
    if (/food|beverage|grocery|snack|candy|cereal|condiment|spice|dairy|meat|bakery/.test(category)) {
      return true;
    }
    // Negative: category matches a known non-food prefix
    if (NON_FOOD_CATEGORIES.some(prefix => category.startsWith(prefix))) {
      return false;
    }
  }

  // No category or ambiguous category — check title keywords as a fallback heuristic
  const titleWords = title.split(/[\s,\-\/]+/);
  if (NON_FOOD_TITLE_KEYWORDS.some(kw => titleWords.includes(kw))) {
    return false;
  }

  // No strong signal either way — allow it through (better to show than miss a food item)
  return true;
}

// UPCitemdb API
async function searchUPCitemdb(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[SproutScan] UPCitemdb: Searching for ${barcode}`);

    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) {
      console.log(`[SproutScan] UPCitemdb: API returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`[SproutScan] UPCitemdb: Found ${item.title} (category: ${item.category || 'none'})`);

      if (!isLikelyFoodProduct(item)) {
        console.log(`[SproutScan] UPCitemdb: Skipping non-food product "${item.title}"`);
        return null;
      }

      return {
        name: item.title || 'Unknown Product',
        brand: item.brand || '',
        image: item.images?.[0] || null,
        ingredients: [],
        barcode: barcode,
        source: 'UPCitemdb'
      };
    }

    console.log(`[SproutScan] UPCitemdb: Product not found`);
    return null;
  } catch (err) {
    console.error('[SproutScan] UPCitemdb API error:', err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const barcode = searchParams.get('barcode');
  const trimester = parseInt(searchParams.get('trimester') || '2');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  const cleanBarcode = barcode.replace(/[\s-]/g, '');
  console.log(`\n[SproutScan] ========== SCAN: ${cleanBarcode} ==========`);

  try {
    let productData: ProductData | null = null;
    let sources: string[] = [];
    
    // 1. USDA FoodData Central
    productData = await searchUSDA(cleanBarcode);
    if (productData) sources.push('USDA');
    
    // 2. Open Food Facts
    if (!productData || productData.ingredients.length === 0) {
      const offData = await searchOpenFoodFacts(cleanBarcode);
      if (offData) {
        if (!productData) {
          productData = offData;
          sources.push('OpenFoodFacts');
        } else if (offData.ingredients.length > 0 && productData.ingredients.length === 0) {
          productData.ingredients = offData.ingredients;
          sources.push('OpenFoodFacts');
          if (offData.image && !productData.image) productData.image = offData.image;
        }
      }
    }
    
    // 3. UPCitemdb
    if (!productData) {
      productData = await searchUPCitemdb(cleanBarcode);
      if (productData) sources.push('UPCitemdb');
    }
    
    if (productData && sources.length > 0) {
      productData.source = sources.join(' + ');
    }
    
    console.log(`[SproutScan] Final result: ${productData ? productData.name : 'NOT FOUND'}, sources: ${sources.join(', ')}`);
    
    if (!productData) {
      return NextResponse.json({
        error: 'Product not found',
        message: 'This product isn\'t in our database. Try entering the barcode manually or check the numbers.',
        barcode: cleanBarcode
      }, { status: 404 });
    }
    
    // Fallback: try USDA text search by product name
    if (productData.ingredients.length === 0 && productData.name) {
      const fallbackIngredients = await searchUSDAByName(productData.name);
      if (fallbackIngredients.length > 0) {
        productData.ingredients = fallbackIngredients;
        productData.source += ' + USDA (name search)';
      }
    }

    if (productData.ingredients.length === 0) {
      return NextResponse.json({
        product: productData,
        overallSafety: 'unknown',
        flaggedIngredients: [],
        safeIngredients: [],
        unknownIngredients: [],
        noIngredients: true,
        message: `We found "${productData.name}" but couldn't get its ingredient list. Check the package.`
      });
    }

    const safetyResult = analyzeIngredients(productData.ingredients, trimester);

    return NextResponse.json({
      product: productData,
      ...safetyResult,
    });
  } catch (error) {
    console.error('[SproutScan] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product information. Please try again.' },
      { status: 500 }
    );
  }
}

function parseIngredients(ingredientsText: string): string[] {
  if (!ingredientsText) return [];
  
  return ingredientsText
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')  // Remove parenthetical content
    .replace(/\[[^\]]*\]/g, ' ') // Remove bracketed content
    .replace(/contains:?\s*/gi, ',')
    .replace(/\d+%/g, '')
    .replace(/less than \d+% of:?/gi, ',')
    .replace(/and\/or/gi, ',')
    .replace(/\*/g, '')  // Remove asterisks
    .split(/[,;.]/)
    .map(i => i.trim())
    .filter(i => i.length > 1 && i.length < 60);
}

function analyzeIngredients(ingredients: string[], trimester: number) {
  // TODO: Breastfeeding mode — when `trimester` is replaced with a stage identifier,
  // add breastfeeding-specific safety rules here. Key differences from pregnancy:
  //  - Alcohol transfers to breast milk (flag even small amounts)
  //  - High-mercury fish should still be limited
  //  - Caffeine limit is similar (~300mg/day) but less strict than pregnancy
  //  - Most pregnancy-avoid ingredients (deli meats, soft cheese, etc.) are safe again
  //  - Some herbs (sage, peppermint in large amounts) can reduce milk supply
  //  - Fenugreek, brewer's yeast are galactagogues (could flag as beneficial)

  const flaggedIngredients: any[] = [];
  const flaggedNames = new Set<string>();
  const safeIngredients: string[] = [];
  const safeNames = new Set<string>();
  const unknownIngredients: string[] = [];

  const safeDB = ingredientsDB.safeIngredients as SafeIngredient[];
  const concerningDB = ingredientsDB.concerningIngredients as ConcerningIngredient[];

  for (const rawIngredient of ingredients) {
    const ingredient = rawIngredient.trim();
    if (ingredient.length < 2) continue;

    // First check concerning ingredients
    const concerningMatch = findConcerningMatch(ingredient, concerningDB);
    if (concerningMatch) {
      if ((concerningMatch.rating === 'avoid' || concerningMatch.rating === 'caution') && !flaggedNames.has(concerningMatch.name)) {
        flaggedNames.add(concerningMatch.name);
        flaggedIngredients.push({
          name: concerningMatch.name,
          rating: concerningMatch.rating,
          concern: concerningMatch.why,
          explanation: `Category: ${concerningMatch.category}`,
          bottomLine: concerningMatch.why,
        });
      } else if (concerningMatch.rating !== 'avoid' && concerningMatch.rating !== 'caution') {
        // Rated "safe" in concerning DB (like MSG)
        if (!safeNames.has(concerningMatch.name)) {
          safeNames.add(concerningMatch.name);
          safeIngredients.push(concerningMatch.name);
        }
      }
      continue;
    }

    // Then check safe ingredients
    const safeMatch = findSafeMatch(ingredient, safeDB);
    if (safeMatch) {
      if (!safeNames.has(safeMatch.name)) {
        safeNames.add(safeMatch.name);
        safeIngredients.push(safeMatch.name);
      }
      continue;
    }

    // Unknown
    if (ingredient.length > 2) {
      unknownIngredients.push(ingredient);
    }
  }

  let overallSafety: 'safe' | 'caution' | 'avoid' = 'safe';
  if (flaggedIngredients.some(i => i.rating === 'avoid')) {
    overallSafety = 'avoid';
  } else if (flaggedIngredients.length > 0) {
    overallSafety = 'caution';
  }

  console.log(`[SproutScan] Analysis: ${safeIngredients.length} safe, ${flaggedIngredients.length} flagged, ${unknownIngredients.length} unknown`);

  return {
    overallSafety,
    flaggedIngredients,
    safeIngredients,
    unknownIngredients,
  };
}

function findConcerningMatch(ingredientText: string, db: ConcerningIngredient[]): ConcerningIngredient | null {
  const normalized = normalizeIngredient(ingredientText);
  
  for (const item of db) {
    // Check main name
    if (isSimilar(ingredientText, item.name)) return item;
    
    // Check aliases
    for (const alias of item.aliases) {
      if (isSimilar(ingredientText, alias)) return item;
    }
  }
  
  return null;
}

function findSafeMatch(ingredientText: string, db: SafeIngredient[]): SafeIngredient | null {
  const normalized = normalizeIngredient(ingredientText);

  for (const item of db) {
    // Check main name
    if (isSimilar(ingredientText, item.name)) return item;

    // Check aliases
    for (const alias of item.aliases) {
      if (isSimilar(ingredientText, alias)) return item;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, trimester = 2, product } = body;

    if (!ingredients || typeof ingredients !== 'string') {
      return NextResponse.json({ error: 'Ingredients text is required' }, { status: 400 });
    }

    const parsed = parseIngredients(ingredients);
    if (parsed.length === 0) {
      return NextResponse.json({ error: 'No ingredients could be parsed from the text' }, { status: 400 });
    }

    console.log(`[SproutScan] Manual entry: ${parsed.length} ingredients parsed`);

    const safetyResult = analyzeIngredients(parsed, trimester);

    return NextResponse.json({
      product: product || { name: 'Manual Entry', brand: '', image: null, barcode: '', source: 'Manual' },
      ...safetyResult,
    });
  } catch (error) {
    console.error('[SproutScan] Manual entry error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze ingredients. Please try again.' },
      { status: 500 }
    );
  }
}
