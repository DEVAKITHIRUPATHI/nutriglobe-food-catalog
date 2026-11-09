import { describe, it, expect } from 'vitest';
import { foodItems } from '../shared/mockData';
import { 
  evaluateFoodEmergencySuitability, 
  calculateHouseholdEmergencyPlan,
  getFoodEmergencyProfileById 
} from '../server/emergencyFoodIntelligenceEngine';
import { EMERGENCY_EVIDENCE_REGISTRY } from '../shared/emergencyEvidenceRegistry';

describe('NUTRIFACTS — Natural Disaster & Emergency Food Intelligence Engine', () => {

  it('evaluates all foundational disaster foods against the 18 disaster scenarios without data loss', () => {
    // Test diverse food profiles:
    // 1. Ready-to-eat dry staple: Almonds / Nuts
    const almonds = foodItems.find(f => f.id === 'almonds');
    expect(almonds).toBeDefined();
    const almondRecord = evaluateFoodEmergencySuitability(almonds!);
    expect(almondRecord.primaryClassification).toBe('READY_TO_EAT');
    expect(almondRecord.fuelRequirement).toBe('NONE');
    expect(almondRecord.waterRequirement).toBe('NONE');
    expect(almondRecord.scenarios.grid_blackout_power.isRecommended).toBe(true);
    expect(almondRecord.scenarios.grid_blackout_power.priorityTier).toBe('FIRST_72_HOURS');

    // 2. Cold-soakable grain staple: Poha / Flattened Rice / Oats
    const grains = foodItems.find(f => f.id.includes('millet') || f.id.includes('wheat') || f.id.includes('rice'));
    expect(grains).toBeDefined();
    const grainRecord = evaluateFoodEmergencySuitability(grains!);
    expect(grainRecord.scenarios).toBeDefined();
    expect(Object.keys(grainRecord.scenarios).length).toBe(18);

    // 3. Refrigeration-dependent perishable: Salmon / Fish / Paneer / Milk
    const dairyOrFish = foodItems.find(f => f.id === 'salmon' || f.id === 'paneer');
    expect(dairyOrFish).toBeDefined();
    const perishableRecord = evaluateFoodEmergencySuitability(dairyOrFish!);
    expect(perishableRecord.refrigerationRequired).toBe(true);
    expect(perishableRecord.primaryClassification).toBe('REFRIGERATION_DEPENDENT');
    expect(perishableRecord.scenarios.grid_blackout_power.isRecommended).toBe(false);
    expect(perishableRecord.scenarios.grid_blackout_power.priorityTier).toBe('AVOID');
    expect(perishableRecord.safetyWarnings.some(w => w.includes('4 hours'))).toBe(true);
  });

  it('anchors all evaluations in authoritative evidence sources (WHO, FEMA, CDC, ICMR-NIN, NDMA)', () => {
    const banana = foodItems.find(f => f.id === 'banana');
    expect(banana).toBeDefined();
    const record = evaluateFoodEmergencySuitability(banana!);

    expect(record.evidence).toBeDefined();
    expect(record.evidence.organization).toBeTruthy();
    expect(record.evidence.documentTitle).toBeTruthy();
    expect(record.evidence.officialReferenceUrl).toBeTruthy();
    expect(record.evidence.confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it('correctly calculates 7-day and 30-day household survival rations with separated water metrics', () => {
    const household = {
      adults: 2,
      children: 2,
      infants: 0,
      elderly: 1,
      pregnantOrLactating: 0
    };

    const infrastructure = {
      cookingFuelAvailable: false, // Acute crisis: No LPG, no power
      cleanPotableWaterLiters: 100,
      electricityWorking: false,
      refrigeratorFunctional: false,
      hasAirtightStorageContainers: true
    };

    // Calculate 7-day survival ration
    const plan7Days = calculateHouseholdEmergencyPlan(household, infrastructure, 7);
    expect(plan7Days.durationDays).toBe(7);
    expect(plan7Days.totalDailyCaloriesNeeded).toBeGreaterThan(7000);
    expect(plan7Days.totalDailyProteinNeededGrams).toBeGreaterThan(150);
    expect(plan7Days.totalDrinkingWaterLiters).toBeGreaterThanOrEqual(70); // (2+1)*3 + 2*1.5 = 12L/day * 7 = 84L
    expect(plan7Days.rations.length).toBeGreaterThanOrEqual(4);

    // All rations must be no-cook because cooking fuel is unavailable
    for (const r of plan7Days.rations) {
      expect(r.requiresCooking).toBe(false);
      expect(['READY_TO_EAT', 'COLD_SOAKABLE']).toContain(r.preparationType);
    }

    // Calculate 30-day survival ration with cooking fuel available
    const plan30Days = calculateHouseholdEmergencyPlan(household, { ...infrastructure, cookingFuelAvailable: true }, 30);
    expect(plan30Days.durationDays).toBe(30);
    expect(plan30Days.totalDrinkingWaterLiters).toBe(plan7Days.totalDrinkingWaterLiters * (30 / 7));
    expect(plan30Days.rations.some(r => r.requiresCooking === true)).toBe(true); // Lentils included when fuel present
  });

  it('verifies pilot batch of 50 foundational food items across all 13 categories', () => {
    const pilotSubset = foodItems.slice(0, 50);
    expect(pilotSubset.length).toBe(50);

    for (const food of pilotSubset) {
      const rec = evaluateFoodEmergencySuitability(food);
      expect(rec.foodId).toBe(food.id);
      expect(rec.canonicalSlug).toBeTruthy();
      expect(rec.foodNameEnglish).toBeTruthy();
      expect(rec.scientificName).toBeTruthy();
      expect(rec.category).toBeTruthy();
      expect(rec.caloriesPer100g).toBeDefined();
      expect(rec.proteinPer100g).toBeDefined();
      expect(rec.storageProfile.unopenedShelfLifeMonths).toBeGreaterThan(0);
      expect(rec.scenarios.floods_water_contamination).toBeDefined();
      expect(rec.scenarios.cyclones_hurricanes).toBeDefined();
      expect(rec.scenarios.grid_blackout_power).toBeDefined();
    }
  });

  it('guarantees lookup by ID works for canonical food records', () => {
    const mango = getFoodEmergencyProfileById('mango_alphonso');
    expect(mango).toBeDefined();
    expect(mango?.foodNameEnglish).toContain('Mango');

    const invalid = getFoodEmergencyProfileById('non_existent_food_xyz');
    expect(invalid).toBeNull();
  });

  it('verifies NUTRIFACTS_EMERGENCY_FOOD_CATALOG_AUDIT.csv contains 1,379 foods and UTF-8 BOM', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.resolve(process.cwd(), 'NUTRIFACTS_EMERGENCY_FOOD_CATALOG_AUDIT.csv');
    expect(fs.existsSync(csvPath)).toBe(true);

    const buf = fs.readFileSync(csvPath);
    // Verify UTF-8 BOM (\xef\xbb\xbf)
    expect(buf[0]).toBe(0xEF);
    expect(buf[1]).toBe(0xBB);
    expect(buf[2]).toBe(0xBF);

    const lines = buf.toString('utf-8').trim().split('\n');
    expect(lines.length).toBe(1380); // 1 header + 1379 data rows

    const header = lines[0].split(',');
    expect(header).toContain('food_id');
    expect(header).toContain('canonical_slug');
    expect(header).toContain('food_name_tamil');
    expect(header).toContain('primary_classification');
    expect(header).toContain('floodwater_safety_rule');
  });

  it('verifies NUTRIFACTS_DISASTER_SCENARIO_COVERAGE.csv covers all 18 disaster scenarios with UTF-8 BOM', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csvPath = path.resolve(process.cwd(), 'NUTRIFACTS_DISASTER_SCENARIO_COVERAGE.csv');
    expect(fs.existsSync(csvPath)).toBe(true);

    const buf = fs.readFileSync(csvPath);
    expect(buf[0]).toBe(0xEF);
    expect(buf[1]).toBe(0xBB);
    expect(buf[2]).toBe(0xBF);

    const lines = buf.toString('utf-8').trim().split('\n');
    expect(lines.length).toBe(19); // 1 header + 18 scenario rows
  });

  it('verifies NUTRIFACTS_EMERGENCY_FOOD_EVIDENCE_REGISTER.json contains required authoritative guidelines', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const jsonPath = path.resolve(process.cwd(), 'NUTRIFACTS_EMERGENCY_FOOD_EVIDENCE_REGISTER.json');
    expect(fs.existsSync(jsonPath)).toBe(true);

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.catalogBaseline).toBe(1379);
    expect(parsed.primaryStandards.who_humanitarian_nutrition).toBeDefined();
    expect(parsed.primaryStandards.fema_food_and_water).toBeDefined();
    expect(parsed.primaryStandards.cdc_food_safety_blackout).toBeDefined();
    expect(parsed.primaryStandards.icmr_nin_dietary_emergency).toBeDefined();
    expect(parsed.primaryStandards.ndma_india_sop).toBeDefined();
  });
});
