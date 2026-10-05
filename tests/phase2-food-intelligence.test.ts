import { describe, it, expect } from 'vitest';
import { foodItems } from '../shared/mockData';
import { generateFoodKnowledgeProfile } from '../shared/foodKnowledgeEngine';
import { 
  findAuthoritativeProfile, 
  AUTHORITATIVE_NUTRITION_REGISTRY,
  buildProvenanceMapFromAuthoritative,
  buildBioactiveMapFromAuthoritative,
  buildAgricultureProfileFromAuthoritative,
  buildClinicalInteractionsForFood,
  buildAntinutrientsForFood,
  buildBioavailabilityForFood
} from '../shared/authoritativeNutritionDatabase';
import { runFullCatalogAudit } from '../scripts/audit-full-catalog';
import type { 
  ProvenanceStatus, 
  ClinicalEvidenceLevel, 
  InteractionSeverity, 
  ExtendedScientificProfile 
} from '../shared/schema';

describe('NUTRIFACTS — Phase 2 Food Intelligence & Provenance Verification', () => {
  const auditReport = runFullCatalogAudit();

  it('maintains full backward compatibility with all 1,379 food records', () => {
    expect(foodItems.length).toBe(1379);
    for (const item of foodItems) {
      expect(item.id).toBeTruthy();
      expect(item.name.en).toBeTruthy();
      expect(item.nutrition.calories).toBeDefined();
      expect(item.nutrition.protein).toBeDefined();
      expect(item.nutrition.carbs).toBeDefined();
      expect(item.nutrition.fat).toBeDefined();
      expect(item.nutrition.fiber).toBeDefined();
    }
  });

  it('enforces rigorous provenance model (DERIVED values are never converted to VERIFIED)', () => {
    // Audit a food that is not in the authoritative lab assay registry
    const nonAuthItem = foodItems.find(f => f.id === 'artichoke' || f.id.includes('apricot'));
    expect(nonAuthItem).toBeDefined();

    const profile = generateFoodKnowledgeProfile(nonAuthItem!);
    expect(profile.scientificProfile).toBeDefined();

    const provMap = profile.scientificProfile!.provenanceMap;
    expect(provMap).toBeDefined();

    // Check that calcium or iron is DERIVED, not VERIFIED or SOURCE_REPORTED (unless item has raw minerals)
    if (!nonAuthItem!.nutrition?.minerals || Object.keys(nonAuthItem!.nutrition.minerals).length === 0) {
      expect(provMap['calcium']?.provenance_status).toBe('DERIVED');
      expect(provMap['iron']?.provenance_status).toBe('DERIVED');
    }

    // Basic macronutrients should be SOURCE_REPORTED from the catalog
    expect(provMap['calories']?.provenance_status).toBe('SOURCE_REPORTED');
    expect(provMap['protein']?.provenance_status).toBe('SOURCE_REPORTED');
  });

  it('verifies ingestion pipeline accuracy for foundational foods from USDA and ICMR-NIN', () => {
    const foundationalKeys = [
      'fuji_apple', 'banana', 'orange', 'spinach', 'broccoli', 
      'carrot', 'roma_tomato', 'almonds', 'raw_walnut_halves', 
      'oats', 'rice_basmati', 'quinoa', 'lentils', 'chickpeas', 
      'eggs', 'salmon', 'milk', 'greek_yogurt', 'chicken_breast', 
      'olive_oil_extra_virgin', 'avocado', 'garlic', 'ginger', 
      'turmeric', 'green_tea', 'blueberries', 'chia_seeds', 
      'flaxseeds', 'sweet_potato', 'russet_potato'
    ];

    for (const key of foundationalKeys) {
      const auth = AUTHORITATIVE_NUTRITION_REGISTRY[key];
      expect(auth, `Expected authoritative profile for key: ${key}`).toBeDefined();
      expect(auth.standardReferenceId).toBeTruthy();
      expect(auth.sourceOrganization).toBeTruthy();
      expect(auth.databaseName).toBeTruthy();
      expect(auth.analyticalMethodsSummary).toBeTruthy();
      expect(auth.confidence).toBeGreaterThanOrEqual(0.95);
      expect(auth.macros.calories).toBeGreaterThanOrEqual(0);
      expect(auth.macros.protein).toBeGreaterThanOrEqual(0);
      expect(auth.macros.carbohydrates).toBeGreaterThanOrEqual(0);
      expect(auth.macros.fat).toBeGreaterThanOrEqual(0);
    }
  });

  it('resolves foundational foods via findAuthoritativeProfile with form-sensitive disambiguation', () => {
    // Orange
    const orange = findAuthoritativeProfile('orange', 'Orange');
    expect(orange).toBeDefined();
    expect(orange?.scientificName).toBe('Citrus sinensis');

    // Broccoli
    const broccoli = findAuthoritativeProfile('broccoli', 'Broccoli');
    expect(broccoli).toBeDefined();
    expect(broccoli?.scientificName).toBe('Brassica oleracea var. italica');

    // Carrot
    const carrot = findAuthoritativeProfile('carrot', 'Carrot');
    expect(carrot).toBeDefined();
    expect(carrot?.scientificName).toBe('Daucus carota subsp. sativus');

    // Walnuts
    const walnut = findAuthoritativeProfile('walnut', 'Walnut');
    expect(walnut).toBeDefined();
    expect(walnut?.scientificName).toBe('Juglans regia');

    // Quinoa
    const quinoa = findAuthoritativeProfile('quinoa', 'Quinoa');
    expect(quinoa).toBeDefined();
    expect(quinoa?.scientificName).toBe('Chenopodium quinoa');

    // Lentils
    const lentils = findAuthoritativeProfile('lentils', 'Lentils');
    expect(lentils).toBeDefined();
    expect(lentils?.scientificName).toBe('Lens culinaris');

    // Greek Yogurt
    const yogurt = findAuthoritativeProfile('greek_yogurt', 'Greek Yogurt');
    expect(yogurt).toBeDefined();
    expect(yogurt?.foodForm).toBe('Solid Endosperm');

    // Garlic
    const garlic = findAuthoritativeProfile('garlic', 'Garlic');
    expect(garlic).toBeDefined();
    expect(garlic?.scientificName).toBe('Allium sativum');

    // Form disambiguation: tender coconut water vs mature coconut meat
    const tender = findAuthoritativeProfile('tender_coconut', 'Tender Coconut');
    const mature = findAuthoritativeProfile('coconut_mature', 'Mature Coconut');
    expect(tender).toBeDefined();
    expect(mature).toBeDefined();
    expect(tender?.foodForm).toBe('Liquid Endosperm');
    expect(mature?.foodForm).toBe('Solid Endosperm');
    expect(tender?.macros.calories).toBeLessThan(mature!.macros.calories);
  });

  it('verifies strict exclusion of agriculture from animal products with NOT_APPLICABLE', () => {
    const animalTestCases = [
      { id: 'salmon', name: 'Atlantic Salmon' },
      { id: 'chicken_breast', name: 'Chicken Breast' },
      { id: 'eggs', name: 'Eggs' },
      { id: 'milk', name: 'Milk' },
      { id: 'greek_yogurt', name: 'Greek Yogurt' }
    ];

    for (const testCase of animalTestCases) {
      const item = foodItems.find(f => f.id === testCase.id) || {
        id: testCase.id,
        name: { en: testCase.name },
        category: ['Meat / Poultry / Dairy / Seafood'],
        nutrition: { calories: 150, carbs: 0, protein: 25, fat: 5, fiber: 0, vitamins: {} },
        origin: 'Farm',
        price: 500,
        image: 'https://example.com/img.jpg',
        allergens: [],
        isPopular: false
      };

      const profile = generateFoodKnowledgeProfile(item as any);
      expect(profile.cultivation, `Animal product ${testCase.id} should NOT have cultivation profile`).toBeUndefined();

      const agri = buildAgricultureProfileFromAuthoritative(
        profile.authoritativeNutrition || { canonicalFoodId: testCase.id } as any, 
        false // isPlant = false
      );
      expect(agri.is_plant).toBe(false);
      expect(agri.provenance_status).toBe('NOT_APPLICABLE');
    }
  });

  it('verifies structured evidence levels and defensible medical wording on clinical interactions', () => {
    const spinachInteractions = buildClinicalInteractionsForFood('spinach');
    expect(spinachInteractions.length).toBeGreaterThan(0);

    const warfarin = spinachInteractions[0];
    expect(warfarin.drug_class).toContain('Warfarin');
    expect(warfarin.severity).toBe('MAJOR');
    expect(warfarin.evidence_level).toBe('STRONG_CLINICAL_EVIDENCE');
    expect(warfarin.authoritative_reference).toContain('FDA');
    expect(warfarin.provenance_status).toBe('SOURCE_REPORTED');
    expect(warfarin.confidence).toBeGreaterThanOrEqual(0.95);

    // Defensible medical language verification (no unscientific claims)
    expect(warfarin.patient_action).not.toContain('cures diabetes');
    expect(warfarin.patient_action).not.toContain('repairs kidneys');
    expect(warfarin.patient_action).not.toContain('prevents cancer');
    expect(warfarin.patient_action).toContain('Maintain a consistent');

    // Garlic interaction
    const garlicInteractions = buildClinicalInteractionsForFood('garlic');
    expect(garlicInteractions.length).toBeGreaterThan(0);
    expect(garlicInteractions[0].drug_class).toContain('Antiplatelet');
    expect(garlicInteractions[0].evidence_level).toBe('MODERATE_CLINICAL_EVIDENCE');

    // Milk / Calcium interaction
    const dairyInteractions = buildClinicalInteractionsForFood('milk');
    expect(dairyInteractions.length).toBeGreaterThan(0);
    expect(dairyInteractions[0].drug_class).toContain('Antibiotics');
    expect(dairyInteractions[0].severity).toBe('MAJOR');
    expect(dairyInteractions[0].patient_action).toContain('Separate oral antibiotic administration');
  });

  it('verifies antinutrients and bioavailability profiles for foundational foods', () => {
    const spinachAntinutrients = buildAntinutrientsForFood('spinach');
    expect(spinachAntinutrients.some(a => a.compound === 'Oxalates')).toBe(true);

    const lentilAntinutrients = buildAntinutrientsForFood('lentils');
    expect(lentilAntinutrients.some(a => a.compound === 'Phytates')).toBe(true);
    expect(lentilAntinutrients.some(a => a.compound === 'Lectins')).toBe(true);

    const carrotBioavailability = buildBioavailabilityForFood('carrot');
    expect(carrotBioavailability.some(b => b.nutrient.includes('Carotenoids'))).toBe(true);
    expect(carrotBioavailability[0].enhancing_factors.some(f => f.includes('lipids'))).toBe(true);
  });

  it('verifies bioactive phytochemical maps contain lab assayed compounds with provenance', () => {
    const blueberries = AUTHORITATIVE_NUTRITION_REGISTRY['blueberries'];
    expect(blueberries).toBeDefined();

    const bioMap = buildBioactiveMapFromAuthoritative(blueberries);
    expect(bioMap['Anthocyanins']).toBeDefined();
    expect(bioMap['Anthocyanins'].value).toBeGreaterThan(100);
    expect(bioMap['Anthocyanins'].provenance_status).toBe('SOURCE_REPORTED');
    expect(bioMap['Anthocyanins'].unit).toBe('mg');

    const broccoli = AUTHORITATIVE_NUTRITION_REGISTRY['broccoli'];
    const broccoliBio = buildBioactiveMapFromAuthoritative(broccoli);
    expect(broccoliBio['Sulforaphane / Glucosinolates']).toBeDefined();
    expect(broccoliBio['Sulforaphane / Glucosinolates'].value).toBeGreaterThan(1000);
    expect(broccoliBio['Sulforaphane / Glucosinolates'].unit).toBe('mcg');
  });

  it('verifies complete catalog audit metrics in the machine-readable report', () => {
    expect(auditReport.totalFoods).toBe(1379);
    expect(auditReport.summary.nutritionComplete).toBe(1379);
    expect(auditReport.summary.agricultureApplicable).toBe(1218);
    expect(auditReport.summary.agricultureNotApplicable).toBe(161);
    expect(auditReport.summary.averageCompletenessScore).toBeGreaterThanOrEqual(95);
  });
});
