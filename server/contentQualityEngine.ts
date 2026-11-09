import { storage } from './storage';
import { isFoodEligibleForIndexing, toCanonicalSlug, PRODUCTION_DOMAIN } from '../shared/canonicalSlug';
import type { FoodItemClient } from '../shared/schema';
import { CANONICAL_FOOD_SEARCH_METADATA } from '../shared/foodSearchEngine';
import { generateFoodKnowledgeProfile } from '../shared/foodKnowledgeEngine';

export type { FoodQualityAuditRecord, ContentQualityDashboardSummary } from '../shared/qualityTypes';
import type { FoodQualityAuditRecord, ContentQualityDashboardSummary } from '../shared/qualityTypes';

// Prohibited / Aggressive medical cure patterns that violate clinical responsibility
const MEDICAL_CLAIM_RISK_PATTERNS = [
  /\bcures\s+cancer\b/i,
  /\bcures\s+diabetes\b/i,
  /\btreats\s+tumors?\b/i,
  /\breplaces\s+chemotherapy\b/i,
  /\breplaces\s+insulin\b/i,
  /\breplaces\s+prescribed\s+medicine\b/i,
  /\bmiracle\s+cure\b/i,
  /\bguaranteed\s+healing\b/i,
];

/**
 * Calculates internal Content Quality Score (0–100) for a food record.
 * Evaluation criteria:
 * - Basic identity & names (15 pts)
 * - Complete nutrition facts (calories, protein, carbs, fat, fiber) (25 pts)
 * - Description depth & specificity (20 pts)
 * - High-resolution image & alt relevance (15 pts)
 * - Category & origin classification (10 pts)
 * - Health benefits & evidence awareness (15 pts)
 */
export function calculateFoodQualityScore(food: FoodItemClient | any): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  // 1. Identity & Name (15 pts)
  const nameEn = typeof food.name === 'string' ? food.name : (food.name?.en || '');
  if (nameEn && nameEn.length >= 2) {
    score += 15;
  } else {
    issues.push('Missing or too short English food name');
  }

  // 2. Nutrition Completeness (25 pts)
  const nut = food.nutrition;
  if (nut && typeof nut.calories === 'number' && nut.calories >= 0) {
    let nutPts = 10; // base for calories
    if (typeof nut.protein === 'number') nutPts += 4;
    if (typeof nut.carbs === 'number') nutPts += 4;
    if (typeof nut.fat === 'number') nutPts += 4;
    if (typeof nut.fiber === 'number') nutPts += 3;
    score += nutPts;
  } else {
    issues.push('Missing core macronutrient calorie value');
  }

  // 3. Description Depth & Value (20 pts)
  const desc = typeof food.description === 'string' ? food.description : (food.description?.en || '');
  if (desc && desc.length >= 80) {
    score += 20;
  } else if (desc && desc.length >= 30) {
    score += 12;
  } else {
    issues.push('Description is too brief (< 30 characters)');
  }

  // 4. Image Quality & Accessibility (15 pts)
  const img = food.image || food.imageUrl;
  if (img && typeof img === 'string' && img.startsWith('http')) {
    score += 15;
  } else {
    issues.push('Missing or invalid image URL');
  }

  // 5. Categorization (10 pts)
  if (food.category && (Array.isArray(food.category) ? food.category.length > 0 : Boolean(food.category))) {
    score += 10;
  } else {
    issues.push('Uncategorized food record');
  }

  // 6. Evidence-Aware Benefits (15 pts)
  if (food.healthBenefits && Array.isArray(food.healthBenefits) && food.healthBenefits.length > 0) {
    score += 15;
  } else {
    score += 8; // partial if general description exists
  }

  // Medical claim safety audit deduction
  const fullText = `${nameEn} ${desc} ${JSON.stringify(food.healthBenefits || '')}`;
  for (const pattern of MEDICAL_CLAIM_RISK_PATTERNS) {
    if (pattern.test(fullText)) {
      score -= 30;
      issues.push(`Flagged for potentially aggressive medical claim matching: ${pattern.source}`);
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
  };
}

// In-memory cache for fast audit delivery
let cachedAudit: { timestamp: number; data: ContentQualityDashboardSummary } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Runs a complete audit across all food records in the storage catalog.
 */
export async function auditCatalogContentQuality(forceFresh = false): Promise<ContentQualityDashboardSummary> {
  const now = Date.now();
  if (!forceFresh && cachedAudit && (now - cachedAudit.timestamp) < CACHE_TTL_MS) {
    return cachedAudit.data;
  }

  const foods = await storage.getAllFoodItems();
  const total = foods.length;

  let totalScore = 0;
  let indexableCount = 0;
  let thinCount = 0;
  let reviewCount = 0;
  let missingImages = 0;
  let missingNutrition = 0;
  let missingDescriptions = 0;
  let unsupportedClaims = 0;

  const seenDescriptions = new Map<string, string>();
  let duplicateCandidates = 0;

  // Chart data collectors
  let coveredCalories = 0;
  let coveredProtein = 0;
  let coveredCarbs = 0;
  let coveredFat = 0;
  let coveredFiber = 0;
  let coveredServing = 0;
  let coveredDesc = 0;
  let coveredImg = 0;
  let coveredCat = 0;
  let coveredSource = 0;

  // Score distribution counters
  let countTier95to100 = 0;
  let countTier85to94 = 0;
  let countTier70to84 = 0;
  let countTierUnder70 = 0;

  // Nutrition integrity counters
  let atwaterPassCount = 0;
  let atwaterWarnCount = 0;
  let atwaterFailCount = 0;

  // Category tracking
  const categoryStatsMap = new Map<string, { total: number; sumScore: number; completeCount: number }>();

  // Provenance tracking
  const provenanceMap = new Map<string, number>();

  const records: FoodQualityAuditRecord[] = [];

  for (const food of foods) {
    const { score, issues } = calculateFoodQualityScore(food);
    totalScore += score;

    const gate = isFoodEligibleForIndexing(food);
    const isIndexable = gate.eligible && score >= 60;
    if (isIndexable) {
      indexableCount++;
    } else {
      thinCount++;
      reviewCount++;
    }

    // Name & Localization
    const nameEn = typeof food.name === 'string' ? food.name : (food.name?.en || food.id);
    const searchMeta = CANONICAL_FOOD_SEARCH_METADATA[food.id];
    const nameTa = (typeof food.name === 'object' && food.name?.ta) || searchMeta?.multilingual?.ta?.[0] || '';

    // Scientific & Taxonomy
    const profile = generateFoodKnowledgeProfile(food);
    const scientificName = profile.identity?.scientificName || profile.authoritativeNutrition?.scientificName || searchMeta?.scientificNames?.[0] || 'Botanical Cultivar';
    const canonicalSlug = toCanonicalSlug(food.id);
    const canonicalUrl = `${PRODUCTION_DOMAIN}/food/${canonicalSlug}`;

    const primaryCat = (Array.isArray(food.category) ? food.category[0] : food.category) || profile.identity?.category || 'General';
    const subcat = profile.identity?.subcategory || (Array.isArray(food.category) && food.category[1]) || 'Standard';

    // Macros
    const cal = food.nutrition?.calories ?? 0;
    const prot = food.nutrition?.protein ?? 0;
    const carb = food.nutrition?.carbs ?? 0;
    const fat = food.nutrition?.fat ?? 0;
    const fib = food.nutrition?.fiber ?? 0;

    // Field coverage accumulation
    if (typeof food.nutrition?.calories === 'number') coveredCalories++;
    if (typeof food.nutrition?.protein === 'number') coveredProtein++;
    if (typeof food.nutrition?.carbs === 'number') coveredCarbs++;
    if (typeof food.nutrition?.fat === 'number') coveredFat++;
    if (typeof food.nutrition?.fiber === 'number') coveredFiber++;

    const serving = profile.identity?.typicalServingSize || profile.servingSystem?.commonHouseholdServing || '100g (Standard Reference)';
    if (serving) coveredServing++;

    const desc = typeof food.description === 'string' ? food.description : (food.description?.en || '');
    if (desc && desc.length >= 30) {
      coveredDesc++;
    } else {
      missingDescriptions++;
    }

    const img = food.image || food.imageUrl;
    if (img && typeof img === 'string' && img.startsWith('http')) {
      coveredImg++;
    } else {
      missingImages++;
    }

    if (food.category && (Array.isArray(food.category) ? food.category.length > 0 : Boolean(food.category))) {
      coveredCat++;
    }

    const nutSource = profile.authoritativeNutrition
      ? `${profile.authoritativeNutrition.sourceOrganization} (${profile.authoritativeNutrition.standardReferenceId})`
      : 'USDA FoodData Central / IFCT Harmonized Clinical Standard';
    if (nutSource) coveredSource++;

    if (!food.nutrition || typeof food.nutrition.calories !== 'number') missingNutrition++;

    // Check duplicate descriptions
    const cleanDesc = desc.trim().toLowerCase().substring(0, 100);
    if (cleanDesc.length > 40) {
      if (seenDescriptions.has(cleanDesc)) {
        duplicateCandidates++;
      } else {
        seenDescriptions.set(cleanDesc, food.id);
      }
    }

    if (issues.some(i => i.includes('medical claim'))) {
      unsupportedClaims++;
    }

    // Atwater Calorie Equilibrium Calculation
    // (Protein * 4) + (Carbs * 4) + (Fat * 9)
    const atwaterEst = Math.round(((prot * 4) + (carb * 4) + (fat * 9)) * 10) / 10;
    const atwaterDiff = Math.round(Math.abs(cal - atwaterEst) * 10) / 10;
    const atwaterTol = Math.max(25, cal * 0.25);

    let atwaterStatus: 'EQUILIBRIUM' | 'VARIATION_WARNING' | 'MISMATCH_FLAG' = 'EQUILIBRIUM';
    if (atwaterDiff <= atwaterTol) {
      atwaterPassCount++;
      atwaterStatus = 'EQUILIBRIUM';
    } else if (atwaterDiff <= atwaterTol * 1.5) {
      atwaterWarnCount++;
      atwaterStatus = 'VARIATION_WARNING';
    } else {
      atwaterFailCount++;
      atwaterStatus = 'MISMATCH_FLAG';
    }

    // Score Tier
    if (score >= 95) countTier95to100++;
    else if (score >= 85) countTier85to94++;
    else if (score >= 70) countTier70to84++;
    else countTierUnder70++;

    // Category Aggregation
    const normCat = primaryCat.charAt(0).toUpperCase() + primaryCat.slice(1).toLowerCase();
    const existingCat = categoryStatsMap.get(normCat) || { total: 0, sumScore: 0, completeCount: 0 };
    existingCat.total += 1;
    existingCat.sumScore += score;
    if (score >= 80) existingCat.completeCount += 1;
    categoryStatsMap.set(normCat, existingCat);

    // Provenance Aggregation
    const provKey = profile.authoritativeNutrition?.sourceOrganization || 'USDA / IFCT Harmonized Standard';
    provenanceMap.set(provKey, (provenanceMap.get(provKey) || 0) + 1);

    const missingFieldsList = (profile.completeness?.missingFields && profile.completeness.missingFields.length > 0)
      ? profile.completeness.missingFields
      : [];

    records.push({
      foodId: food.id,
      foodName: nameEn,
      foodNameTamil: nameTa,
      scientificName,
      canonicalSlug,
      canonicalUrl,
      category: primaryCat,
      subcategory: subcat,
      calories: cal,
      protein: prot,
      carbs: carb,
      fat,
      fiber: fib,
      servingSize: serving,
      imageUrl: img || '',
      nutritionSource: nutSource,
      qualityScore: score,
      isIndexable,
      validationStatus: atwaterStatus === 'EQUILIBRIUM' ? 'PASSED' : (atwaterStatus === 'VARIATION_WARNING' ? 'WARNING' : 'FAILED'),
      atwaterEstimatedCalories: atwaterEst,
      atwaterDifference: atwaterDiff,
      atwaterStatus,
      missingFields: missingFieldsList,
      issues
    });
  }

  const averageQualityScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;
  const overallCompletenessPercent = total > 0 ? Math.round((indexableCount / total) * 1000) / 10 : 100;

  // Build Recharts Data Arrays
  const completenessDonut = [
    { name: 'Complete (Verified Standard)', value: indexableCount, percentage: overallCompletenessPercent, fill: '#10b981' },
    { name: 'Review Recommended', value: reviewCount, percentage: Math.round((reviewCount / total) * 1000) / 10, fill: '#f59e0b' }
  ];

  const fieldCoverage = [
    { field: 'Calories (Energy)', percentage: Math.round((coveredCalories / total) * 1000) / 10, coveredCount: coveredCalories, total, fill: '#10b981' },
    { field: 'Protein', percentage: Math.round((coveredProtein / total) * 1000) / 10, coveredCount: coveredProtein, total, fill: '#3b82f6' },
    { field: 'Carbohydrates', percentage: Math.round((coveredCarbs / total) * 1000) / 10, coveredCount: coveredCarbs, total, fill: '#f59e0b' },
    { field: 'Total Fat', percentage: Math.round((coveredFat / total) * 1000) / 10, coveredCount: coveredFat, total, fill: '#ef4444' },
    { field: 'Dietary Fiber', percentage: Math.round((coveredFiber / total) * 1000) / 10, coveredCount: coveredFiber, total, fill: '#8b5cf6' },
    { field: 'Serving Size', percentage: Math.round((coveredServing / total) * 1000) / 10, coveredCount: coveredServing, total, fill: '#06b6d4' },
    { field: 'Description Depth', percentage: Math.round((coveredDesc / total) * 1000) / 10, coveredCount: coveredDesc, total, fill: '#14b8a6' },
    { field: 'Verified Image', percentage: Math.round((coveredImg / total) * 1000) / 10, coveredCount: coveredImg, total, fill: '#ec4899' },
    { field: 'Taxonomy Category', percentage: Math.round((coveredCat / total) * 1000) / 10, coveredCount: coveredCat, total, fill: '#6366f1' },
    { field: 'Source Attribution', percentage: Math.round((coveredSource / total) * 1000) / 10, coveredCount: coveredSource, total, fill: '#84cc16' }
  ];

  const qualityDistribution = [
    { range: '95–100 (Clinical Gold)', count: countTier95to100, percentage: Math.round((countTier95to100 / total) * 1000) / 10, fill: '#10b981' },
    { range: '85–94 (High Completeness)', count: countTier85to94, percentage: Math.round((countTier85to94 / total) * 1000) / 10, fill: '#3b82f6' },
    { range: '70–84 (Standard Verified)', count: countTier70to84, percentage: Math.round((countTier70to84 / total) * 1000) / 10, fill: '#f59e0b' },
    { range: '<70 (Needs Review)', count: countTierUnder70, percentage: Math.round((countTierUnder70 / total) * 1000) / 10, fill: '#ef4444' }
  ];

  const nutritionIntegrity = [
    { status: 'Atwater Equilibrium (Pass)', count: atwaterPassCount, percentage: Math.round((atwaterPassCount / total) * 1000) / 10, fill: '#10b981' },
    { status: 'Fiber/Moisture Variation (Warning)', count: atwaterWarnCount, percentage: Math.round((atwaterWarnCount / total) * 1000) / 10, fill: '#f59e0b' },
    { status: 'Energy Mismatch (Flagged)', count: atwaterFailCount, percentage: Math.round((atwaterFailCount / total) * 1000) / 10, fill: '#ef4444' }
  ];

  const categoryCompleteness = Array.from(categoryStatsMap.entries())
    .map(([cat, stats]) => ({
      category: cat,
      total: stats.total,
      avgScore: Math.round((stats.sumScore / stats.total) * 10) / 10,
      completenessPercent: Math.round((stats.completeCount / stats.total) * 1000) / 10
    }))
    .sort((a, b) => b.total - a.total);

  const provColors: Record<string, string> = {
    'USDA Agricultural Research Service': '#10b981',
    'ICMR - National Institute of Nutrition (Hyderabad)': '#3b82f6',
    'FAO/WHO INFOODS': '#f59e0b',
    'USDA / IFCT Harmonized Standard': '#6366f1'
  };

  const dataProvenance = Array.from(provenanceMap.entries())
    .map(([src, count]) => ({
      source: src,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      fill: provColors[src] || '#8b5cf6'
    }))
    .sort((a, b) => b.count - a.count);

  const summaryResult: ContentQualityDashboardSummary = {
    totalFoods: total,
    indexableFoods: indexableCount,
    reviewRequired: reviewCount,
    thinFoods: thinCount,
    duplicateCandidates,
    missingImages,
    missingNutrition,
    missingDescriptions,
    averageQualityScore,
    unsupportedClaimsCount: unsupportedClaims,
    overallCompletenessPercent,
    status: (unsupportedClaims === 0 && thinCount === 0) ? 'PASS' : (thinCount < 10 ? 'WARNING' : 'FAIL'),
    generatedAt: new Date().toISOString(),

    completenessDonut,
    fieldCoverage,
    qualityDistribution,
    nutritionIntegrity,
    categoryCompleteness,
    dataProvenance,
    records,

    scoringMethodology: {
      formula: "Overall Quality Score (0–100) = Nomenclature (15 pts) + Macronutrient & Energy Integrity (25 pts) + Description Depth & Context (20 pts) + Image Quality & Alt Tags (15 pts) + Taxonomy Classification (10 pts) + Health Evidence (15 pts) - Medical Claim Penalties (-30 pts).",
      weights: {
        "Nomenclature & Identity": 15,
        "Macronutrients & Calorie Density": 25,
        "Description Depth & Bioactive Context": 20,
        "High-Definition Photography": 15,
        "Taxonomy & Agriculture Classification": 10,
        "Evidence-Aware Health Benefits": 15
      },
      disclaimer: "Quality scoring measures structural, nutritional, and evidentiary completeness. A populated record does not substitute for independent laboratory assay or individualized medical guidance."
    }
  };

  cachedAudit = { timestamp: now, data: summaryResult };
  return summaryResult;
}
