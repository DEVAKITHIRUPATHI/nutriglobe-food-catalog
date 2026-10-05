import { describe, it, expect } from 'vitest';
import {
  getISODateString,
  formatDayLabel,
  getDayOfWeekShort,
  generateRealisticSample7DayLogs,
  DailyNutritionLog,
  LoggedMealEntry,
  UserNutritionProfile,
  validateAtwaterCalories,
  calculateDailyNutritionScore,
  calculateAMDRStatus,
  generate7DayInsights,
  compare7DayPeriods,
  generatePrintable7DayReport
} from '../client/src/lib/idb';

describe('Daily Macronutrient Intake Trends & Logging Engine', () => {
  const mockProfile: UserNutritionProfile = {
    id: 'current-profile',
    displayName: 'Clinical Nutrition Explorer',
    calorieTarget: 2200,
    proteinTarget: 80,
    carbsTarget: 260,
    fatTarget: 70,
    fiberTarget: 32,
    dietaryFocus: 'balanced',
    healthGoals: ['Optimize recovery', 'Improve gut microbiome'],
    allergens: [],
    updatedAt: Date.now()
  };

  it('generates valid ISO date strings for current, past, and future offsets', () => {
    const today = getISODateString(0);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const yesterday = getISODateString(-1);
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today).not.toBe(yesterday);

    const sixDaysAgo = getISODateString(-6);
    expect(sixDaysAgo).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const sevenDaysPrior = getISODateString(-7);
    expect(sevenDaysPrior).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const futureDay = getISODateString(1);
    expect(futureDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats day labels and short day strings correctly', () => {
    const label = formatDayLabel('2026-10-01');
    expect(label).toBeDefined();
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);

    const shortDay = getDayOfWeekShort('2026-10-01');
    expect(shortDay).toBeDefined();
    expect(typeof shortDay).toBe('string');
    expect(shortDay.length).toBeLessThanOrEqual(5);

    // Handles fallback for malformed date string gracefully
    expect(formatDayLabel('invalid')).toBe('invalid');
  });

  it('generates a complete 7-day realistic nutrition diary calibrated to user targets', () => {
    const logs = generateRealisticSample7DayLogs(mockProfile);

    expect(logs).toHaveLength(7);

    logs.forEach(day => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.entries.length).toBeGreaterThanOrEqual(3);
      expect(day.totalCalories).toBeGreaterThan(1200);
      expect(day.totalCalories).toBeLessThan(3500);
      expect(day.totalProtein).toBeGreaterThan(40);
      expect(day.totalCarbs).toBeGreaterThan(100);
      expect(day.totalFat).toBeGreaterThan(30);
      expect(day.totalFiber).toBeGreaterThan(15);

      // Verify Atwater factor consistency: Energy kcal ≈ (P * 4) + (C * 4) + (F * 9)
      const atwater = validateAtwaterCalories(day.totalCalories, day.totalProtein, day.totalCarbs, day.totalFat);
      expect(atwater.isValid).toBe(true);
    });
  });

  it('validates Atwater factor calorie calculations with biochemical assay tolerance', () => {
    // Exact match: 20g P (80), 50g C (200), 10g F (90) = 370 kcal
    const exact = validateAtwaterCalories(370, 20, 50, 10);
    expect(exact.isValid).toBe(true);
    expect(exact.expectedKcal).toBe(370);
    expect(exact.diff).toBe(0);

    // Rounded assay value within 10% tolerance (e.g. reported 360 kcal vs calculated 370 kcal)
    const rounded = validateAtwaterCalories(360, 20, 50, 10);
    expect(rounded.isValid).toBe(true);
    expect(rounded.diff).toBe(10);

    // Egregious mismatch (e.g. reported 150 kcal when calculated is 370 kcal)
    const mismatch = validateAtwaterCalories(150, 20, 50, 10);
    expect(mismatch.isValid).toBe(false);
    expect(mismatch.diff).toBe(220);

    // Zero-calorie items (e.g. water, green tea)
    const zeroCal = validateAtwaterCalories(0, 0, 0, 0);
    expect(zeroCal.isValid).toBe(true);
    expect(zeroCal.expectedKcal).toBe(0);
  });

  it('calculates accurate Daily Nutrition Scores and categories according to defined weights', () => {
    // 1. Empty Day -> Score 0, 'Needs Attention'
    const emptyDay: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      updatedAt: Date.now()
    };
    const emptyScore = calculateDailyNutritionScore(emptyDay, mockProfile);
    expect(emptyScore.score).toBe(0);
    expect(emptyScore.status).toBe('Needs Attention');
    expect(emptyScore.breakdown.caloriesScore).toBe(0);

    // 2. Near-perfect adherence day
    // Target: 2200 kcal, 80g P, 260g C, 70g F, 32g Fib
    // P=80 (320 kcal), C=260 (1040 kcal), F=70 (630 kcal) -> Total = 1990 kcal (~90% target)
    // Fiber = 30g
    // AMDR: P = 16%, C = 52%, F = 32% (all within 10-35%, 45-65%, 20-35%)
    const optimalDay: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [],
      totalCalories: 2150,
      totalProtein: 82,
      totalCarbs: 255,
      totalFat: 68,
      totalFiber: 31,
      updatedAt: Date.now()
    };
    const optimalScore = calculateDailyNutritionScore(optimalDay, mockProfile);
    expect(optimalScore.score).toBeGreaterThanOrEqual(85);
    expect(['Excellent', 'Good']).toContain(optimalScore.status);
    expect(optimalScore.breakdown.caloriesScore).toBe(25);
    expect(optimalScore.breakdown.proteinScore).toBe(20);
    expect(optimalScore.breakdown.amdrScore).toBe(10);

    // 3. Imbalanced day with severe protein deficit
    const imbalancedDay: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [],
      totalCalories: 1100, // far below 2200
      totalProtein: 15,   // far below 80g
      totalCarbs: 200,
      totalFat: 20,
      totalFiber: 8,
      updatedAt: Date.now()
    };
    const imbalancedScore = calculateDailyNutritionScore(imbalancedDay, mockProfile);
    expect(imbalancedScore.score).toBeLessThan(65);
    expect(['Needs Improvement', 'Needs Attention']).toContain(imbalancedScore.status);
  });

  it('correctly evaluates AMDR energy distribution benchmarks', () => {
    // Standard balanced day: 20% Protein, 50% Carbs, 30% Fat
    // P = 100g (400 kcal), C = 250g (1000 kcal), F = 67g (600 kcal) -> Total = 2000 kcal
    const balancedDay: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [],
      totalCalories: 2000,
      totalProtein: 100,
      totalCarbs: 250,
      totalFat: 67,
      totalFiber: 28,
      updatedAt: Date.now()
    };
    const amdr = calculateAMDRStatus(balancedDay);
    expect(amdr.isProteinWithinRange).toBe(true);
    expect(amdr.isCarbsWithinRange).toBe(true);
    expect(amdr.isFatWithinRange).toBe(true);
    expect(amdr.isOverallWithinRange).toBe(true);
    expect(amdr.summary).toContain('Within Clinical AMDR Range');

    // Extreme high-fat keto-style day: 15% Protein, 5% Carbs, 80% Fat
    const highFatDay: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [],
      totalCalories: 2000,
      totalProtein: 75, // 300 kcal (15%)
      totalCarbs: 25,  // 100 kcal (5% - below 45%)
      totalFat: 178,   // 1600 kcal (80% - above 35%)
      totalFiber: 10,
      updatedAt: Date.now()
    };
    const highFatAmdr = calculateAMDRStatus(highFatDay);
    expect(highFatAmdr.isCarbsWithinRange).toBe(false);
    expect(highFatAmdr.isFatWithinRange).toBe(false);
    expect(highFatAmdr.isOverallWithinRange).toBe(false);
  });

  it('generates clinical insights with responsible observational tone', () => {
    const logs = generateRealisticSample7DayLogs(mockProfile);
    const insights = generate7DayInsights(logs, mockProfile);

    expect(insights.length).toBeGreaterThanOrEqual(3);
    const categories = insights.map(i => i.category);
    expect(categories).toContain('protein');
    expect(categories).toContain('fiber');
    expect(categories).toContain('energy');

    // Ensure insights avoid unsupported clinical cure words
    insights.forEach(item => {
      const lower = item.text.toLowerCase();
      expect(lower).not.toContain('cure');
      expect(lower).not.toContain('reverses disease');
      expect(lower).not.toContain('guaranteed');
    });
  });

  it('compares 7-day current vs previous periods with accurate delta percentages', () => {
    const current = generateRealisticSample7DayLogs(mockProfile);
    // Create previous logs with slightly lower intake
    const previous = current.map(d => ({
      ...d,
      totalCalories: Math.round(d.totalCalories * 0.9),
      totalProtein: Math.round(d.totalProtein * 0.85),
      totalFiber: Math.round(d.totalFiber * 0.8)
    }));

    const comparison = compare7DayPeriods(current, previous);
    expect(comparison.caloriesDeltaPct).toBeGreaterThan(0);
    expect(comparison.proteinDeltaPct).toBeGreaterThan(0);
    expect(comparison.fiberDeltaPct).toBeGreaterThan(0);
    expect(comparison.summary).toBeDefined();
    expect(typeof comparison.summary).toBe('string');
  });

  it('generates a clean, formatted printable 7-day intake audit report', () => {
    const logs = generateRealisticSample7DayLogs(mockProfile);
    const report = generatePrintable7DayReport(logs, mockProfile);

    expect(report).toContain('NUTRIFACTS CLINICAL NUTRITION ENGINE');
    expect(report).toContain(mockProfile.displayName);
    expect(report).toContain('Daily Calories:');
    expect(report).toContain('Protein Intake:');
    expect(report).toContain('AMDR Compliance:');
    expect(report).toContain('Atwater Consistency:');
  });

  it('handles edge cases: fractional servings, large servings, and missing targets', () => {
    // Profile with missing/zero targets fallback safely
    const fallbackProfile: UserNutritionProfile = {
      id: 'fallback-user',
      displayName: 'Fallback Explorer',
      calorieTarget: 0,
      proteinTarget: 0,
      carbsTarget: 0,
      fatTarget: 0,
      fiberTarget: 0,
      dietaryFocus: 'balanced',
      healthGoals: [],
      allergens: [],
      updatedAt: Date.now()
    };

    const day: DailyNutritionLog = {
      date: '2026-10-01',
      dayLabel: 'Thu, Oct 1',
      entries: [
        {
          id: 'fractional-meal',
          foodId: 'apple',
          foodName: 'Apple',
          mealType: 'snack',
          servings: 0.33,
          servingGrams: 33,
          calories: 18,
          protein: 0.1,
          carbs: 4.6,
          fat: 0.1,
          fiber: 0.8,
          loggedAt: Date.now()
        },
        {
          id: 'large-meal',
          foodId: 'rice',
          foodName: 'Brown Rice',
          mealType: 'dinner',
          servings: 4.5,
          servingGrams: 450,
          calories: 540,
          protein: 11.7,
          carbs: 112.5,
          fat: 4.1,
          fiber: 8.1,
          loggedAt: Date.now()
        }
      ],
      totalCalories: 558,
      totalProtein: 11.8,
      totalCarbs: 117.1,
      totalFat: 4.2,
      totalFiber: 8.9,
      updatedAt: Date.now()
    };

    // calculateDailyNutritionScore must not crash on 0 targets (falls back to defaults)
    const score = calculateDailyNutritionScore(day, fallbackProfile);
    expect(score).toBeDefined();
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);

    const insights = generate7DayInsights([day], fallbackProfile);
    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });
});
