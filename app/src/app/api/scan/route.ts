import { NextRequest, NextResponse } from 'next/server';
import ingredientsDB from '@/data/ingredients.json';

interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  description: string;
  function: string;
  safetyRating: {
    firstTrimester: string;
    secondTrimester: string;
    thirdTrimester: string;
  };
  concerns: string[];
  safetyNotes: string;
  bottomLine: string;
  sources: string[];
}

interface IngredientsDB {
  metadata: any;
  ingredients: Ingredient[];
}

interface ProductData {
  name: string;
  brand: string;
  image: string | null;
  ingredients: string[];
  barcode: string;
  source: string;
}

// USDA FoodData Central API - PRIMARY SOURCE
async function searchUSDA(barcode: string): Promise<ProductData | null> {
  try {
    console.log(`[MamaSense] USDA: Searching for ${barcode}`);
    
    // Try direct barcode search
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
      // Try to find exact barcode match first
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

// Open Food Facts API - FALLBACK 1
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

// UPCitemdb API - FALLBACK 2 (product ID only, usually no ingredients)
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
        ingredients: [], // UPCitemdb doesn't have ingredients
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
    
    // 1. PRIMARY: USDA FoodData Central
    productData = await searchUSDA(cleanBarcode);
    if (productData) {
      sources.push('USDA');
    }
    
    // 2. FALLBACK 1: Open Food Facts (if USDA didn't have it or no ingredients)
    if (!productData || productData.ingredients.length === 0) {
      const offData = await searchOpenFoodFacts(cleanBarcode);
      
      if (offData) {
        if (!productData) {
          // USDA had nothing, use OFF entirely
          productData = offData;
          sources.push('OpenFoodFacts');
        } else if (offData.ingredients.length > 0 && productData.ingredients.length === 0) {
          // USDA had product but no ingredients, OFF has ingredients - merge
          productData.ingredients = offData.ingredients;
          sources.push('OpenFoodFacts');
          if (offData.image && !productData.image) {
            productData.image = offData.image;
          }
        }
      }
    }
    
    // 3. FALLBACK 2: UPCitemdb (last resort for product identification)
    if (!productData) {
      productData = await searchUPCitemdb(cleanBarcode);
      if (productData) {
        sources.push('UPCitemdb');
      }
    }
    
    // Update source string
    if (productData && sources.length > 0) {
      productData.source = sources.join(' + ');
    }
    
    console.log(`[MamaSense] Final result: ${productData ? productData.name : 'NOT FOUND'}, sources: ${sources.join(', ')}`);
    
    // 4. Not found anywhere
    if (!productData) {
      return NextResponse.json({
        error: 'Product not found',
        message: 'This product isn\'t in our database. Try entering the barcode manually or check the numbers.',
        barcode: cleanBarcode
      }, { status: 404 });
    }
    
    // 5. Found product but no ingredients
    if (productData.ingredients.length === 0) {
      return NextResponse.json({
        product: productData,
        overallSafety: 'unknown',
        flaggedIngredients: [],
        safeIngredients: [],
        unknownIngredients: [],
        noIngredients: true,
        message: `We found "${productData.name}" but couldn't get its ingredient list. Check the package and look for concerning ingredients like artificial sweeteners, preservatives, or caffeine.`
      });
    }

    // 6. Analyze ingredients for pregnancy safety
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
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/contains:?\s*/gi, ',')
    .replace(/\d+%/g, '')
    .replace(/less than \d+% of:?/gi, ',')
    .replace(/and\/or/gi, ',')
    .split(/[,;.]/)
    .map(i => i.trim())
    .filter(i => i.length > 1 && i.length < 50);
}

function analyzeIngredients(ingredients: string[], trimester: number) {
  const flaggedIngredients: any[] = [];
  const safeIngredients: string[] = [];
  const unknownIngredients: string[] = [];

  const db = ingredientsDB as IngredientsDB;
  
  const trimesterKey = trimester === 1 
    ? 'firstTrimester' 
    : trimester === 2 
      ? 'secondTrimester' 
      : 'thirdTrimester';

  for (const ingredient of ingredients) {
    const match = findIngredientMatch(ingredient, db.ingredients);
    
    if (match) {
      const safety = match.safetyRating[trimesterKey];
      
      if (safety === 'avoid') {
        flaggedIngredients.push({
          name: match.name,
          rating: 'avoid',
          concern: match.concerns.join(' '),
          explanation: match.description + ' ' + match.function,
          bottomLine: match.bottomLine,
        });
      } else if (safety === 'caution') {
        flaggedIngredients.push({
          name: match.name,
          rating: 'caution',
          concern: match.concerns.join(' '),
          explanation: match.description + ' ' + match.function,
          bottomLine: match.bottomLine,
        });
      } else {
        safeIngredients.push(match.name);
      }
    } else {
      if (ingredient.length > 2) {
        unknownIngredients.push(ingredient);
      }
    }
  }

  let overallSafety: 'safe' | 'caution' | 'avoid' = 'safe';
  if (flaggedIngredients.some(i => i.rating === 'avoid')) {
    overallSafety = 'avoid';
  } else if (flaggedIngredients.length > 0) {
    overallSafety = 'caution';
  }

  return {
    overallSafety,
    flaggedIngredients,
    safeIngredients,
    unknownIngredients,
  };
}

function findIngredientMatch(ingredientName: string, ingredients: Ingredient[]): Ingredient | null {
  const normalized = ingredientName.toLowerCase().trim();
  
  for (const ingredient of ingredients) {
    if (ingredient.name.toLowerCase() === normalized) {
      return ingredient;
    }
    
    for (const alias of ingredient.aliases) {
      const aliasLower = alias.toLowerCase();
      if (aliasLower === normalized || normalized.includes(aliasLower)) {
        return ingredient;
      }
    }
    
    if (normalized.includes(ingredient.name.toLowerCase())) {
      return ingredient;
    }
  }
  
  return null;
}
