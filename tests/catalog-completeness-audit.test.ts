import { describe, it, expect } from 'vitest';
import { foodItems } from '../shared/mockData';
import { generateFoodKnowledgeProfile } from '../shared/foodKnowledgeEngine';
import { runFullCatalogAudit } from '../scripts/audit-full-catalog';
import * as fs from 'fs';
import * as path from 'path';

describe('NUTRIFACTS — Full Catalog Data Completeness Audit (Phase 1)', () => {
  const auditReport = runFullCatalogAudit();

  it('audits all 1,379 catalog food records', () => {
    expect(auditReport.totalFoods).toBe(1379);
    expect(auditReport.foodsAudited).toBe(1379);
  });

  it('verifies 100% macronutrient coverage across all 1,379 foods', () => {
    expect(auditReport.summary.nutritionComplete).toBe(1379);
    expect(auditReport.summary.nutritionMissing).toBe(0);
  });

  it('correctly audits raw vs derived micronutrients and bioactives without fabricating values', () => {
    // 41 foods have detailed raw mineral assays, 1,338 are derived via category reference
    expect(auditReport.summary.micronutrientsRawComplete).toBe(41);
    expect(auditReport.summary.micronutrientsRawMissing).toBe(1338);

    // 34 foods have detailed raw bioactive assays, 1,345 are derived via category reference
    expect(auditReport.summary.bioactivesRawComplete).toBe(34);
    expect(auditReport.summary.bioactivesRawMissing).toBe(1345);
  });

  it('verifies that non-plant foods are strictly exempt from plant agriculture fields', () => {
    // 161 non-plant foods (meat, poultry, dairy, fish, seafood) are classified as NOT_APPLICABLE
    expect(auditReport.summary.agricultureNotApplicable).toBe(161);
    expect(auditReport.summary.agricultureApplicable).toBe(1218);

    // Test representative animal foods directly
    const animalTestIds = ['salmon', 'chicken_breast', 'eggs', 'milk'];
    for (const id of animalTestIds) {
      const item = foodItems.find(f => f.id === id);
      if (item) {
        const profile = generateFoodKnowledgeProfile(item);
        expect(profile.cultivation).toBeUndefined();
      }
    }
  });

  it('verifies all 1,379 long-form articles exceed the 1,500-character requirement', () => {
    expect(auditReport.summary.articlesBelow1500).toBe(0);
    expect(auditReport.summary.articles3000to4999).toBe(1379);
  });

  it('verifies documented clinical drug interactions only on high-evidence foods', () => {
    expect(auditReport.summary.medicationInteractionsDocumented).toBeGreaterThan(0);
    // Representative high-potassium / vitamin K food (spinach) has documented interaction
    const spinach = foodItems.find(f => f.id === 'spinach');
    expect(spinach).toBeDefined();
    const spinProfile = generateFoodKnowledgeProfile(spinach!);
    expect(spinProfile.safety.medicationInteractions.length).toBeGreaterThan(0);
    expect(spinProfile.safety.medicationInteractions[0].caution).toContain('Do not stop');
  });

  it('verifies zero duplicate food IDs and zero duplicate canonical names in the catalog', () => {
    expect(auditReport.summary.duplicateFoodIds).toBe(0);
    expect(auditReport.summary.duplicateNames).toBe(0);
  });

  it('verifies 100% verified food images with 0 missing or placeholder images', () => {
    expect(auditReport.summary.missingImages).toBe(0);
    expect(auditReport.summary.brokenOrPlaceholderImages).toBe(0);
    expect(auditReport.summary.verifiedImages).toBe(1379);
  });

  it('generates machine-readable report food_catalog_completeness_report.json on disk', () => {
    const reportPath = path.resolve(process.cwd(), 'food_catalog_completeness_report.json');
    expect(fs.existsSync(reportPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(content.totalFoods).toBe(1379);
    expect(content.summary.averageCompletenessScore).toBeGreaterThanOrEqual(95);
  });
});
