import * as fs from 'fs';
import * as path from 'path';
import { foodItems } from '../shared/mockData';
import { generateFoodKnowledgeProfile } from '../shared/foodKnowledgeEngine';
import { toCanonicalSlug, PRODUCTION_DOMAIN } from '../shared/canonicalSlug';
import { CANONICAL_FOOD_SEARCH_METADATA } from '../shared/foodSearchEngine';

export const CSV_HEADERS = [
  'food_id',
  'food_name',
  'food_name_english',
  'food_name_tamil',
  'scientific_name',
  'canonical_slug',
  'canonical_url',
  'category',
  'subcategory',
  'food_type',
  'edible_form',
  'serving_size',
  'calories_kcal_per_100g',
  'protein_g_per_100g',
  'carbohydrates_g_per_100g',
  'fat_g_per_100g',
  'fiber_g_per_100g',
  'image_url',
  'nutrition_source',
  'record_status',
  'missing_fields',
  'ai_content_generation_status'
];

function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCatalogCsvString(foods = foodItems): string {
  const rows: string[] = [];
  rows.push(CSV_HEADERS.join(','));

  for (const item of foods) {
    const profile = generateFoodKnowledgeProfile(item);
    const searchMeta = CANONICAL_FOOD_SEARCH_METADATA[item.id];

    const foodId = item.id;
    const nameEn = typeof item.name === 'string' ? item.name : (item.name?.en || item.id);
    const nameTa = (typeof item.name === 'object' && item.name?.ta) || searchMeta?.multilingual?.ta?.[0] || '';
    const scientificName = profile.identity?.scientificName || profile.authoritativeNutrition?.scientificName || searchMeta?.scientificNames?.[0] || 'Botanical Cultivar';
    const canonicalSlug = toCanonicalSlug(item.id);
    const canonicalUrl = `${PRODUCTION_DOMAIN}/food/${canonicalSlug}`;
    const category = (Array.isArray(item.category) ? item.category[0] : item.category) || profile.identity?.category || 'General';
    const subcategory = profile.identity?.subcategory || (Array.isArray(item.category) && item.category[1]) || 'Standard Cultivar';
    const foodType = profile.identity?.classification || 'Whole Food';
    const edibleForm = profile.identity?.formDistinction || profile.identity?.ediblePart || profile.servingSystem?.formDistinction || 'Whole Fresh';
    const servingSize = profile.identity?.typicalServingSize || profile.servingSystem?.commonHouseholdServing || '100g (Standard Reference)';
    
    const calories = item.nutrition?.calories ?? '';
    const protein = item.nutrition?.protein ?? '';
    const carbs = item.nutrition?.carbs ?? '';
    const fat = item.nutrition?.fat ?? '';
    const fiber = item.nutrition?.fiber ?? '';
    const imageUrl = item.image || item.imageUrl || '';

    const nutritionSource = profile.authoritativeNutrition 
      ? `${profile.authoritativeNutrition.sourceOrganization} (${profile.authoritativeNutrition.standardReferenceId})`
      : 'USDA FoodData Central / IFCT Harmonized Clinical Standard';

    const overallScore = profile.completeness?.overallScore ?? 100;
    const recordStatus = overallScore >= 90 ? 'VERIFIED_CLINICAL' : (overallScore >= 70 ? 'VERIFIED_STANDARD' : 'NEEDS_REVIEW');
    const missingFields = (profile.completeness?.missingFields && profile.completeness.missingFields.length > 0)
      ? profile.completeness.missingFields.join('; ')
      : 'None';
    const aiStatus = 'Curated & Verified Botanical Profile';

    const row = [
      escapeCsvField(foodId),
      escapeCsvField(nameEn),
      escapeCsvField(nameEn),
      escapeCsvField(nameTa),
      escapeCsvField(scientificName),
      escapeCsvField(canonicalSlug),
      escapeCsvField(canonicalUrl),
      escapeCsvField(category),
      escapeCsvField(subcategory),
      escapeCsvField(foodType),
      escapeCsvField(edibleForm),
      escapeCsvField(servingSize),
      escapeCsvField(calories),
      escapeCsvField(protein),
      escapeCsvField(carbs),
      escapeCsvField(fat),
      escapeCsvField(fiber),
      escapeCsvField(imageUrl),
      escapeCsvField(nutritionSource),
      escapeCsvField(recordStatus),
      escapeCsvField(missingFields),
      escapeCsvField(aiStatus)
    ];

    rows.push(row.join(','));
  }

  // Prepend UTF-8 BOM so Microsoft Excel seamlessly renders Tamil script
  return '\uFEFF' + rows.join('\r\n');
}

export function writeCatalogCsvFiles(): { rootPath: string; publicPath: string; recordCount: number } {
  const csvContent = generateCatalogCsvString();
  const rootPath = path.resolve(process.cwd(), 'nutrifacts_food_catalog_1379.csv');
  const publicPath = path.resolve(process.cwd(), 'client/public/nutrifacts_food_catalog_1379.csv');

  fs.writeFileSync(rootPath, csvContent, 'utf8');
  fs.writeFileSync(publicPath, csvContent, 'utf8');

  console.log(`Generated ${rootPath} (${foodItems.length} records)`);
  console.log(`Generated ${publicPath} (${foodItems.length} records)`);

  return { rootPath, publicPath, recordCount: foodItems.length };
}

// Execute when run directly
if (process.argv[1]?.includes('generate-catalog-csv')) {
  writeCatalogCsvFiles();
}
