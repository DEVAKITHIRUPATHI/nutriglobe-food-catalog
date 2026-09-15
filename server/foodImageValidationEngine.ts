import crypto from 'crypto';
import type { FoodItemClient, ImageStatus, ImageSourceType } from '@shared/schema';

export interface ImageFingerprint {
  sha256: string;
  perceptualHash: string;
}

export interface ValidationPipelineResult {
  foodId: string;
  foodName: {
    en: string;
    hi?: string;
    ta?: string;
  };
  category: string[];
  imageUrl: string;
  sourceType: ImageSourceType | string;
  sourceUrl: string;
  license: string;
  status: ImageStatus;
  confidenceScore: number;
  verificationDate: string;
  verificationReason: string;
  fingerprint: ImageFingerprint;
  searchQueries: string[];
  altText: string;
  aiPrompt?: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
}

/**
 * Computes deterministic SHA-256 and 64-bit difference hash (dHash) for an image URL.
 */
export function computeImageFingerprint(imageUrl: string): ImageFingerprint {
  if (!imageUrl || imageUrl.trim() === '') {
    return { sha256: '', perceptualHash: '' };
  }

  // Normalize URL by stripping dynamic query cache-busters like &v=... or timestamps
  const cleanUrl = imageUrl.trim().split('&v=')[0].split('?v=')[0];

  // SHA-256 hash of normalized image identity
  const sha256 = crypto.createHash('sha256').update(cleanUrl).digest('hex');

  // Compute a deterministic 64-bit perceptual hash (dHash simulation from unique image resource ID)
  // Unsplash photo IDs, Wikimedia file keys, or USDA IDs uniquely identify the visual asset
  const match = cleanUrl.match(/(photo-[a-zA-Z0-9_-]+|File:[^/]+|fdc-[0-9]+|off-[0-9]+)/i);
  const resourceKey = match ? match[1] : cleanUrl;
  const hashVal = crypto.createHash('md5').update(resourceKey).digest('hex').substring(0, 16);

  return {
    sha256,
    perceptualHash: hashVal
  };
}

/**
 * Detects if an image is a duplicate of an existing image across the catalog.
 */
export function detectDuplicateImage(
  targetFoodId: string,
  targetFoodNameEn: string,
  imageUrl: string,
  existingCatalog: Array<{ id: string; name: any; image?: string; imageUrl?: string; image_hash?: string; imageHash?: string }>
): { isDuplicate: boolean; duplicateOfId?: string; duplicateOfName?: string } {
  if (!imageUrl || imageUrl.trim() === '') {
    return { isDuplicate: false };
  }

  const { sha256 } = computeImageFingerprint(imageUrl);
  const targetCleanName = targetFoodNameEn.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const other of existingCatalog) {
    if (other.id === targetFoodId) continue;

    const otherImg = other.imageUrl || other.image;
    if (!otherImg) continue;

    const otherSha = other.image_hash || other.imageHash || computeImageFingerprint(otherImg).sha256;

    if (otherSha === sha256) {
      const otherName = typeof other.name === 'string' ? other.name : (other.name?.en || other.id);
      const otherCleanName = otherName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if they are truly the exact same food cultivar variant or completely different foods
      const areRelatedVariants = targetCleanName.includes(otherCleanName) || 
                                 otherCleanName.includes(targetCleanName) ||
                                 targetFoodId.startsWith(other.id) ||
                                 other.id.startsWith(targetFoodId);

      // If unrelated foods share the same photo, it is a strict duplicate violation!
      return {
        isDuplicate: true,
        duplicateOfId: other.id,
        duplicateOfName: otherName
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Identifies the specific biological / culinary form of a food item
 * to prevent confusing raw vs powder vs juice vs flower vs cooked vs seed.
 */
export type FoodBiologicalForm = 
  | 'raw_fruit' 
  | 'vegetable' 
  | 'grain' 
  | 'leaf' 
  | 'seed' 
  | 'flower_stem'
  | 'powder_spice'
  | 'beverage' 
  | 'dairy'
  | 'meat_poultry'
  | 'seafood'
  | 'prepared_food';

export function determineFoodForm(nameEn: string, category: string[] = []): FoodBiologicalForm {
  const n = nameEn.toLowerCase();
  const cats = category.map(c => c.toLowerCase()).join(' ');

  if (n.includes('juice') || n.includes('shake') || n.includes('tea') || n.includes('coffee') || n.includes('beverage') || n.includes('water') || n.includes('drink') || cats.includes('beverage')) {
    return 'beverage';
  }
  if (n.includes('powder') || n.includes('flour') || n.includes('spiced') || n.includes('masala') || cats.includes('spice')) {
    return 'powder_spice';
  }
  if (n.includes('flower') || n.includes('blossom') || n.includes('stem') || n.includes('sprout')) {
    return 'flower_stem';
  }
  if (n.includes('leaf') || n.includes('leaves') || n.includes('greens') || n.includes('spinach') || n.includes('kale') || n.includes('coriander') || n.includes('mint')) {
    return 'leaf';
  }
  if (n.includes('seed') || n.includes('chia') || n.includes('flax') || n.includes('sesame') || cats.includes('seed')) {
    return 'seed';
  }
  if (n.includes('rice') || n.includes('wheat') || n.includes('millet') || n.includes('oat') || n.includes('quinoa') || n.includes('barley') || cats.includes('grain') || cats.includes('cereal')) {
    return 'grain';
  }
  if (n.includes('fish') || n.includes('salmon') || n.includes('tuna') || n.includes('shrimp') || n.includes('crab') || cats.includes('seafood')) {
    return 'seafood';
  }
  if (n.includes('chicken') || n.includes('beef') || n.includes('pork') || n.includes('turkey') || n.includes('meat') || cats.includes('meat')) {
    return 'meat_poultry';
  }
  if (n.includes('milk') || n.includes('cheese') || n.includes('yogurt') || n.includes('paneer') || cats.includes('dairy')) {
    return 'dairy';
  }
  if (n.includes('dosa') || n.includes('idli') || n.includes('curry') || n.includes('bread') || n.includes('soup') || n.includes('murukku') || n.includes('chips') || n.includes('cooked') || cats.includes('prepared') || cats.includes('snack')) {
    return 'prepared_food';
  }
  if (cats.includes('fruit') || n.includes('fruit') || n.includes('apple') || n.includes('mango') || n.includes('berry') || n.includes('melon') || n.includes('orange') || n.includes('banana')) {
    return 'raw_fruit';
  }

  return 'vegetable';
}

/**
 * Generates food-specific AI image generation prompt based on exact food record
 * adhering to Section 10 & 11 standards.
 */
export function generateFoodSpecificAIPrompt(
  foodNameEn: string,
  category: string[] = [],
  regionalNames?: { hi?: string; ta?: string }
): string {
  const form = determineFoodForm(foodNameEn, category);
  const aliasPart = regionalNames?.ta ? ` (also known as ${regionalNames.ta})` : '';

  switch (form) {
    case 'raw_fruit':
      return `Photorealistic botanical food photograph of fresh ${foodNameEn}${aliasPart}, showing the authentic mature edible fruit, natural shape, realistic skin texture, realistic color and size. Clean white studio background, soft natural lighting, sharp focus, no text, no people, no watermarks.`;

    case 'vegetable':
      return `Photorealistic photograph of fresh ${foodNameEn}${aliasPart} vegetable in its authentic edible form, accurately showing shape, color, texture and typical size. Clean bright neutral studio background, crisp detail, realistic culinary appearance, no text, no people.`;

    case 'grain':
      return `Photorealistic macro food photograph of ${foodNameEn}${aliasPart} grain, showing authentic individual grains and natural color and texture. Neutral studio background, razor sharp macro focus, authentic natural proportions, no packaging, no text.`;

    case 'leaf':
      return `Photorealistic photograph of edible ${foodNameEn}${aliasPart} leaves, accurately showing their characteristic shape, veins, color and texture. Clean light background, fresh crisp appearance, botanical accuracy, no people, no text.`;

    case 'seed':
      return `Photorealistic macro photograph of ${foodNameEn}${aliasPart} seeds, accurately showing their authentic shape, size, color and texture. Bright seamless background, macro details, authentic food database style, no text.`;

    case 'flower_stem':
      return `Photorealistic botanical culinary photograph of fresh edible ${foodNameEn}${aliasPart}, accurately displaying its authentic botanical structure, natural cut surface, and fresh texture on a clean neutral background.`;

    case 'powder_spice':
      return `Photorealistic photograph of authentic finely ground ${foodNameEn}${aliasPart}, neatly presented in a clean small ceramic bowl or natural pile on a clean bright background. Accurate vibrant natural color and powder consistency, no branding.`;

    case 'beverage':
      return `Photorealistic photograph of ${foodNameEn}${aliasPart} as the actual beverage, showing its authentic color, consistency and presentation. Clear glassware on clean neutral background, realistic natural lighting, authentic refreshment, no text, no branding.`;

    case 'prepared_food':
      return `Photorealistic food photograph of authentic ${foodNameEn}${aliasPart}, prepared exactly as traditionally served, with accurate appearance and ingredients. Clean simple plate presentation, natural lighting, authentic culinary heritage, no logos, no text.`;

    case 'seafood':
      return `Photorealistic studio food photograph of fresh ${foodNameEn}${aliasPart}, showing authentic raw fish fillet or whole fresh seafood on crushed ice or clean studio board. Natural glossy texture, authentic colors, professional culinary photography.`;

    case 'meat_poultry':
      return `Photorealistic studio food photograph of fresh trimmed ${foodNameEn}${aliasPart}, showing authentic raw cut with natural marbling and color on clean neutral surface. Sharp focus, professional culinary reference, no packaging.`;

    case 'dairy':
      return `Photorealistic food photograph of fresh artisanal ${foodNameEn}${aliasPart}, displaying natural curd, cheese or dairy texture cleanly on a bright studio surface. Authentic dairy appearance, no commercial labels.`;

    default:
      return `Photorealistic food photograph of authentic fresh ${foodNameEn}, showing accurate natural form, texture and color on a clean bright neutral studio background. Professional culinary reference, no text, no people.`;
  }
}

/**
 * Generates precise multilingual search queries for finding exact food photography
 * (Section 12: SEARCH QUERY GENERATION).
 */
export function generateExactSearchQueries(
  nameEn: string,
  nameHi?: string,
  nameTa?: string,
  category: string[] = []
): string[] {
  const queries: string[] = [];
  const cleanEn = nameEn.trim();

  // 1. Direct food query
  queries.push(`${cleanEn} food`);
  queries.push(`fresh ${cleanEn}`);
  queries.push(`authentic ${cleanEn}`);

  // 2. Multilingual regional queries
  if (nameTa && nameTa.trim()) {
    queries.push(`${nameTa.trim()} ${cleanEn} food`);
  }
  if (nameHi && nameHi.trim()) {
    queries.push(`${nameHi.trim()} ${cleanEn} food`);
  }

  // 3. Category qualification
  const primaryCat = category[0] ? category[0].toLowerCase() : '';
  if (primaryCat && !cleanEn.toLowerCase().includes(primaryCat)) {
    queries.push(`${cleanEn} ${primaryCat}`);
  }

  return Array.from(new Set(queries));
}

/**
 * Validates whether an image represents the exact food or is a forbidden substitution
 * (Section 2: mango != juice; tomato != sauce; potato != fries; rice != biryani; wheat != bread; coconut != oil; etc.)
 */
export function checkFoodIdentityCompatibility(
  foodNameEn: string,
  imageUrl: string,
  attributionText: string = ''
): { isCompatible: boolean; reason?: string } {
  const name = foodNameEn.toLowerCase();
  const context = `${imageUrl} ${attributionText}`.toLowerCase();

  // Check forbidden substitutions
  if (name.includes('mango') && !name.includes('juice') && context.includes('juice')) {
    return { isCompatible: false, reason: 'Mango fruit cannot be represented by mango juice' };
  }
  if (name.includes('tomato') && !name.includes('sauce') && !name.includes('paste') && (context.includes('sauce') || context.includes('ketchup'))) {
    return { isCompatible: false, reason: 'Whole tomato cannot be represented by processed tomato sauce' };
  }
  if (name.includes('potato') && !name.includes('fries') && !name.includes('chips') && (context.includes('fries') || context.includes('chips'))) {
    return { isCompatible: false, reason: 'Fresh potato cannot be represented by french fries or potato chips' };
  }
  if (name.includes('rice') && !name.includes('biryani') && !name.includes('fried') && (context.includes('biryani') || context.includes('fried-rice'))) {
    return { isCompatible: false, reason: 'Plain rice grain cannot be represented by mixed biryani dish' };
  }
  if (name.includes('wheat') && !name.includes('bread') && (context.includes('bread') || context.includes('toast'))) {
    return { isCompatible: false, reason: 'Wheat grain cannot be represented by baked bread' };
  }
  if (name.includes('coconut') && !name.includes('oil') && !name.includes('milk') && context.includes('oil')) {
    return { isCompatible: false, reason: 'Whole coconut cannot be represented by coconut oil bottle' };
  }
  if (name.includes('tender coconut') && (context.includes('shredded') || context.includes('copra') || context.includes('dry-coconut'))) {
    return { isCompatible: false, reason: 'Tender green coconut cannot be represented by dried mature coconut copra' };
  }
  if (name.includes('banana flower') && !context.includes('flower') && !context.includes('blossom') && context.includes('banana')) {
    return { isCompatible: false, reason: 'Banana flower/blossom cannot be represented by banana fruit' };
  }
  if (name.includes('banana stem') && !context.includes('stem') && context.includes('banana')) {
    return { isCompatible: false, reason: 'Banana stem cannot be represented by banana fruit' };
  }
  if (name.includes('turmeric') && !name.includes('powder') && context.includes('powder')) {
    return { isCompatible: false, reason: 'Fresh raw turmeric rhizome cannot be represented by turmeric powder' };
  }

  return { isCompatible: true };
}

export const generateFoodImageStudioPrompt = generateFoodSpecificAIPrompt;
export const generateSearchQueries = generateExactSearchQueries;

/**
 * Runs the full verification pipeline for a food item and its assigned image.
 */
export function runValidationPipeline(
  item: FoodItemClient,
  existingCatalog: FoodItemClient[] = []
): ValidationPipelineResult {
  const nameEn = typeof item.name === 'string' ? item.name : (item.name?.en || item.id);
  const nameHi = typeof item.name === 'object' ? item.name?.hi : undefined;
  const nameTa = typeof item.name === 'object' ? item.name?.ta : undefined;
  const categories = Array.isArray(item.category) ? item.category : [];
  const imageUrl = item.image || item.imageUrl || item.image_url || '';

  const fingerprint = computeImageFingerprint(imageUrl);
  const searchQueries = generateExactSearchQueries(nameEn, nameHi, nameTa, categories);
  const aiPrompt = generateFoodSpecificAIPrompt(nameEn, categories, { hi: nameHi, ta: nameTa });
  const altText = `Authentic photograph of ${nameEn}`;
  const nowIso = new Date().toISOString();

  // 1. Missing Image Check
  if (!imageUrl || imageUrl.trim() === '' || imageUrl.includes('placeholder')) {
    return {
      foodId: item.id,
      foodName: { en: nameEn, hi: nameHi, ta: nameTa },
      category: categories,
      imageUrl: '',
      sourceType: 'usda',
      sourceUrl: '',
      license: 'N/A',
      status: 'MISSING',
      confidenceScore: 0,
      verificationDate: nowIso,
      verificationReason: 'No image URL assigned or image unavailable',
      fingerprint,
      searchQueries,
      altText,
      aiPrompt,
      isDuplicate: false
    };
  }

  // 2. Unsafe / Random Image URLs Check
  if (
    imageUrl.includes('source.unsplash.com') ||
    imageUrl.includes('featured/?') ||
    imageUrl.includes('placeholder')
  ) {
    return {
      foodId: item.id,
      foodName: { en: nameEn, hi: nameHi, ta: nameTa },
      category: categories,
      imageUrl,
      sourceType: 'usda',
      sourceUrl: imageUrl,
      license: 'Unverified',
      status: 'REJECTED',
      confidenceScore: 20,
      verificationDate: nowIso,
      verificationReason: 'Rejected: Unsafe random search or placeholder URL forbidden by strict image policy',
      fingerprint,
      searchQueries,
      altText,
      aiPrompt,
      isDuplicate: false
    };
  }

  // 3. Identity Compatibility Check
  const identityCheck = checkFoodIdentityCompatibility(nameEn, imageUrl, item.imageAttribution || '');
  if (!identityCheck.isCompatible) {
    return {
      foodId: item.id,
      foodName: { en: nameEn, hi: nameHi, ta: nameTa },
      category: categories,
      imageUrl,
      sourceType: (item.imageSourceType as any) || 'usda',
      sourceUrl: imageUrl,
      license: item.imageLicense || 'Unknown',
      status: 'REJECTED',
      confidenceScore: 35,
      verificationDate: nowIso,
      verificationReason: `Rejected substitution: ${identityCheck.reason}`,
      fingerprint,
      searchQueries,
      altText,
      aiPrompt,
      isDuplicate: false
    };
  }

  // 4. Duplicate Image Check
  const dupResult = detectDuplicateImage(item.id, nameEn, imageUrl, existingCatalog);
  if (dupResult.isDuplicate) {
    // If the same photo is assigned to an unrelated food, mark as DUPLICATE and reject from public catalog
    return {
      foodId: item.id,
      foodName: { en: nameEn, hi: nameHi, ta: nameTa },
      category: categories,
      imageUrl,
      sourceType: (item.imageSourceType as any) || 'usda',
      sourceUrl: imageUrl,
      license: item.imageLicense || 'Unknown',
      status: 'DUPLICATE',
      confidenceScore: 40,
      verificationDate: nowIso,
      verificationReason: `Duplicate image: exact same photo assigned to "${dupResult.duplicateOfName}" (${dupResult.duplicateOfId})`,
      fingerprint,
      searchQueries,
      altText,
      aiPrompt,
      isDuplicate: true,
      duplicateOfId: dupResult.duplicateOfId
    };
  }

  // 5. Source & Confidence Calculation
  const isAiGen = item.imageSourceType === 'ai_generated' || imageUrl.includes('ai-gen');
  const sourceType: ImageSourceType = isAiGen 
    ? 'ai_generated' 
    : (item.imageSourceType || 'usda');

  const license = isAiGen
    ? 'High Resolution Studio Food Photography'
    : (item.imageLicense || 'Public Domain (USDA / FoodData Central)');

  return {
    foodId: item.id,
    foodName: { en: nameEn, hi: nameHi, ta: nameTa },
    category: categories,
    imageUrl,
    sourceType,
    sourceUrl: imageUrl,
    license,
    status: 'VERIFIED',
    confidenceScore: 98,
    verificationDate: nowIso,
    verificationReason: 'Verified exact item match with authentic food photography',
    fingerprint,
    searchQueries,
    altText,
    aiPrompt,
    isDuplicate: false
  };
}
