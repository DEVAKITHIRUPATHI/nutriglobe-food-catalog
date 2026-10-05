import { storage } from './storage';
import { isFoodEligibleForIndexing, toCanonicalSlug } from '../shared/canonicalSlug';
import type { FoodItemClient } from '../shared/schema';

export interface FoodQualityAuditResult {
  foodId: string;
  foodName: string;
  canonicalSlug: string;
  qualityScore: number; // 0 to 100
  isIndexable: boolean;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_REVIEW' | 'THIN';
  issues: string[];
}

export interface ContentQualityDashboardSummary {
  totalFoods: number;
  indexableFoods: number;
  reviewRequired: number;
  thinFoods: number;
  duplicateCandidates: number;
  missingImages: number;
  missingNutrition: number;
  missingDescriptions: number;
  averageQualityScore: number;
  unsupportedClaimsCount: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  generatedAt: string;
}

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

/**
 * Runs a complete audit across all food records in the storage catalog.
 */
export async function auditCatalogContentQuality(): Promise<ContentQualityDashboardSummary> {
  const foods = await storage.getAllFoodItems();
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

  for (const food of foods) {
    const { score, issues } = calculateFoodQualityScore(food);
    totalScore += score;

    const gate = isFoodEligibleForIndexing(food);
    if (gate.eligible && score >= 60) {
      indexableCount++;
    } else {
      thinCount++;
      reviewCount++;
    }

    const img = food.image || food.imageUrl;
    if (!img || !img.startsWith('http')) missingImages++;

    if (!food.nutrition || typeof food.nutrition.calories !== 'number') missingNutrition++;

    const desc = typeof food.description === 'string' ? food.description : (food.description?.en || '');
    if (!desc || desc.length < 30) missingDescriptions++;

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
  }

  const averageQualityScore = foods.length > 0 ? Math.round((totalScore / foods.length) * 10) / 10 : 0;

  return {
    totalFoods: foods.length,
    indexableFoods: indexableCount,
    reviewRequired: reviewCount,
    thinFoods: thinCount,
    duplicateCandidates,
    missingImages,
    missingNutrition,
    missingDescriptions,
    averageQualityScore,
    unsupportedClaimsCount: unsupportedClaims,
    status: (unsupportedClaims === 0 && thinCount === 0) ? 'PASS' : (thinCount < 10 ? 'WARNING' : 'FAIL'),
    generatedAt: new Date().toISOString(),
  };
}
