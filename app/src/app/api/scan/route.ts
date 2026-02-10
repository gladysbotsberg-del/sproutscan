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

// Normalize ingredient text for matching
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

// Check if two strings are similar enough
function isSimilar(a: string, b: string): boolean {
  const normA = normalizeIngredient(a);
  const normB = normalizeIngredient(b);
  
  // Exact match after normalization
  if (normA === normB) return true;
  
  // One contains the other (for compound ingredients)
  if (normA.length > 3 && normB.includes(normA)) return true;
  if (normB.length > 3 && normA.includes(normB)) return true;
  
  return false;
}

// USDA FoodData Central API
async function searchUSDA(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[MamaSense] USDA: Searching for ${barcode}`);
    
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${barcode}&dataType=Branded&pageSize=10&api_key=DEMO_KEY`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      console.log(`[MamaSense] USDA: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[MamaSense] USDA: Found ${data.foods?.length || 0} results`);
    
    if (data.foods && data.foods.length > 0) {
      const exactMatch = data.foods.find((f: any) => {
        const upc = f.gtinUpc || '';
        const cleanUpc = upc.replace(/^0+/, '');
        const cleanBarcode = barcode.replace(/^0+/, '');
        return cleanUpc === cleanBarcode || upc === barcode;
      });
      
      const food = exactMatch || data.foods[0];
      
      if (food && food.ingredients) {
        console.log(`[MamaSense] USDA: Using ${exactMatch ? 'exact match' : 'first result'}: ${food.description}`);
        return {
          name: food.description || 'Unknown Product',
          brand: food.brandOwner || food.brandName || '',
          image: null,
          ingredients: parseIngredients(food.ingredients || ''),
          barcode: barcode,
          source: 'USDA FoodData Central'
        };
      }
    }
    
    console.log(`[MamaSense] USDA: No results with ingredients`);
    return null;
  } catch (err) {
    console.error('[MamaSense] USDA API error:', err);
    return null;
  }
}

// Open Food Facts API
async function searchOpenFoodFacts(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[MamaSense] OpenFoodFacts: Searching for ${barcode}`);
    
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      console.log(`[MamaSense] OpenFoodFacts: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      const ingredientsText = product.ingredients_text || product.ingredients_text_en || '';
      
      console.log(`[MamaSense] OpenFoodFacts: Found ${product.product_name}, ingredients: ${ingredientsText.length > 0 ? 'yes' : 'no'}`);
      
      return {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || '',
        image: product.image_front_small_url || product.image_url || null,
        ingredients: parseIngredients(ingredientsText),
        barcode: barcode,
        source: 'Open Food Facts'
      };
    }
    
    console.log(`[MamaSense] OpenFoodFacts: Product not found`);
    return null;
  } catch (err) {
    console.error('[MamaSense] Open Food Facts API error:', err);
    return null;
  }
}

// UPCitemdb API
async function searchUPCitemdb(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[MamaSense] UPCitemdb: Searching for ${barcode}`);
    
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      }
    );
    
    if (!response.ok) {
      console.log(`[MamaSense] UPCitemdb: API returned ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      console.log(`[MamaSense] UPCitemdb: Found ${item.title}`);
      return {
        name: item.title || 'Unknown Product',
        brand: item.brand || '',
        image: item.images?.[0] || null,
        ingredients: [],
        barcode: barcode,
        source: 'UPCitemdb'
      };
    }
    
    console.log(`[MamaSense] UPCitemdb: Product not found`);
    return null;
  } catch (err) {
    console.error('[MamaSense] UPCitemdb API error:', err);
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
  console.log(`\n[MamaSense] ========== SCAN: ${cleanBarcode} ==========`);

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
    
    console.log(`[MamaSense] Final result: ${productData ? productData.name : 'NOT FOUND'}, sources: ${sources.join(', ')}`);
    
    if (!productData) {
      return NextResponse.json({
        error: 'Product not found',
        message: 'This product isn\'t in our database. Try entering the barcode manually or check the numbers.',
        barcode: cleanBarcode
      }, { status: 404 });
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
    console.error('[MamaSense] Error:', error);
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
  const flaggedIngredients: any[] = [];
  const safeIngredients: string[] = [];
  const unknownIngredients: string[] = [];

  const safeDB = ingredientsDB.safeIngredients as SafeIngredient[];
  const concerningDB = ingredientsDB.concerningIngredients as ConcerningIngredient[];

  for (const rawIngredient of ingredients) {
    const ingredient = rawIngredient.trim();
    if (ingredient.length < 2) continue;
    
    // First check concerning ingredients
    const concerningMatch = findConcerningMatch(ingredient, concerningDB);
    if (concerningMatch) {
      if (concerningMatch.rating === 'avoid') {
        flaggedIngredients.push({
          name: concerningMatch.name,
          rating: 'avoid',
          concern: concerningMatch.why,
          explanation: `Category: ${concerningMatch.category}`,
          bottomLine: concerningMatch.why,
        });
      } else if (concerningMatch.rating === 'caution') {
        flaggedIngredients.push({
          name: concerningMatch.name,
          rating: 'caution',
          concern: concerningMatch.why,
          explanation: `Category: ${concerningMatch.category}`,
          bottomLine: concerningMatch.why,
        });
      } else {
        // Rated "safe" in concerning DB (like MSG)
        safeIngredients.push(concerningMatch.name);
      }
      continue;
    }
    
    // Then check safe ingredients
    const safeMatch = findSafeMatch(ingredient, safeDB);
    if (safeMatch) {
      safeIngredients.push(safeMatch.name);
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

  console.log(`[MamaSense] Analysis: ${safeIngredients.length} safe, ${flaggedIngredients.length} flagged, ${unknownIngredients.length} unknown`);

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
