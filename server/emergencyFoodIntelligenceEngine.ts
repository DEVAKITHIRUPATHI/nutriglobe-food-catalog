/**
 * NUTRIFACTS — EMERGENCY FOOD INTELLIGENCE ENGINE
 * 
 * Maps and evaluates the 1,379 canonical foods against:
 * - 18 Disaster Scenarios (floods, cyclones, earthquakes, blackouts, fuel cuts)
 * - Preparation Requirements (ready-to-eat, cold soak, minimal boil, full cook)
 * - Storage & Moisture Vulnerabilities
 * - Authoritative Evidence Attribution (WHO, FEMA, CDC, ICMR-NIN, NDMA)
 * - Household Survival Ration Planning
 */

import { foodItems } from '../shared/mockData';
import { toCanonicalSlug } from '../shared/canonicalSlug';
import { CANONICAL_FOOD_SEARCH_METADATA } from '../shared/foodSearchEngine';
import { generateFoodKnowledgeProfile } from '../shared/foodKnowledgeEngine';
import { EMERGENCY_EVIDENCE_REGISTRY } from '../shared/emergencyEvidenceRegistry';
import type { FoodItemClient } from '../shared/schema';
import type { 
  EmergencyPreparationType,
  WaterRequirementLevel,
  FuelRequirementLevel,
  DisasterScenarioId,
  EmergencyFoodSuitabilityRecord,
  HouseholdMemberRoster,
  HouseholdInfrastructureStatus,
  HouseholdEmergencyPlan,
  EmergencyRationItemRequirement
} from '../shared/emergencyFoodSchema';

// Foundational pilot categories & emergency heuristics
const READY_TO_EAT_KEYWORDS = [
  'date', 'almond', 'walnut', 'peanut', 'cashew', 'raisin', 'fig', 'banana', 'biscuit', 
  'chickpea_roasted', 'puffed_rice', 'flattened_rice', 'jaggery', 'honey', 'sesame'
];

const COLD_SOAKABLE_KEYWORDS = [
  'poha', 'flattened_rice', 'aval', 'oat', 'sattu', 'chia', 'pori', 'puffed_rice'
];

const REFRIGERATION_DEPENDENT_KEYWORDS = [
  'milk', 'paneer', 'cheese', 'yogurt', 'curd', 'fish', 'salmon', 'chicken', 'meat', 
  'egg', 'beef', 'prawn', 'shrimp', 'crab', 'mutton'
];

const SHELF_STABLE_LONG_TERM_KEYWORDS = [
  'rice', 'millet', 'wheat', 'dal', 'lentil', 'pea', 'gram', 'sugar', 'salt', 'oil', 'ghee'
];

/**
 * Evaluates an individual food item for disaster and emergency preparedness.
 */
export function evaluateFoodEmergencySuitability(food: FoodItemClient): EmergencyFoodSuitabilityRecord {
  const foodId = food.id.toLowerCase();
  const nameEn = typeof food.name === 'string' ? food.name : (food.name?.en || food.id);
  const searchMeta = CANONICAL_FOOD_SEARCH_METADATA[food.id];
  const nameTa = (typeof food.name === 'object' && food.name?.ta) || searchMeta?.multilingual?.ta?.[0] || '';
  const canonicalSlug = toCanonicalSlug(food.id);
  
  const profile = generateFoodKnowledgeProfile(food);
  const scientificName = profile.identity?.scientificName || profile.authoritativeNutrition?.scientificName || searchMeta?.scientificNames?.[0] || 'Botanical Cultivar';
  const category = (Array.isArray(food.category) ? food.category[0] : food.category) || 'General';

  const cal = food.nutrition?.calories ?? 0;
  const prot = food.nutrition?.protein ?? 0;
  const carbs = food.nutrition?.carbs ?? 0;
  const fat = food.nutrition?.fat ?? 0;
  const fiber = food.nutrition?.fiber ?? 0;

  // Determine Primary & Secondary Classifications
  let primaryClassification: EmergencyPreparationType = 'DATA_PENDING';
  const secondaryClassifications: EmergencyPreparationType[] = [];
  let waterReq: WaterRequirementLevel = 'LOW';
  let waterMl = 50;
  let fuelReq: FuelRequirementLevel = 'NONE';
  let cookingTime = 0;
  let canEatRaw = false;
  let canSoakCold = false;
  let refrigerationRequired = false;

  const cleanTokens = `${foodId} ${nameEn.toLowerCase()} ${category.toLowerCase()}`;

  if (REFRIGERATION_DEPENDENT_KEYWORDS.some(kw => cleanTokens.includes(kw))) {
    primaryClassification = 'REFRIGERATION_DEPENDENT';
    refrigerationRequired = true;
    canEatRaw = false;
    fuelReq = 'STANDARD';
    cookingTime = 15;
    waterReq = 'MODERATE';
    waterMl = 250;
  } else if (COLD_SOAKABLE_KEYWORDS.some(kw => cleanTokens.includes(kw))) {
    primaryClassification = 'COLD_SOAKABLE';
    secondaryClassifications.push('READY_TO_EAT');
    canEatRaw = true;
    canSoakCold = true;
    waterReq = 'LOW';
    waterMl = 120;
    fuelReq = 'NONE';
    cookingTime = 0;
  } else if (READY_TO_EAT_KEYWORDS.some(kw => cleanTokens.includes(kw))) {
    primaryClassification = 'READY_TO_EAT';
    canEatRaw = true;
    waterReq = 'NONE';
    waterMl = 0;
    fuelReq = 'NONE';
    cookingTime = 0;
  } else if (category.toLowerCase().includes('fruit') || category.toLowerCase().includes('vegetable')) {
    primaryClassification = 'READY_TO_EAT_AFTER_WASH';
    canEatRaw = true;
    waterReq = 'LOW';
    waterMl = 80;
    fuelReq = 'NONE';
    cookingTime = 0;
  } else if (category.toLowerCase().includes('legume') || category.toLowerCase().includes('pulse') || cleanTokens.includes('dal') || cleanTokens.includes('lentil')) {
    primaryClassification = cleanTokens.includes('split') || cleanTokens.includes('red_lentil') ? 'MINIMAL_BOIL' : 'FULL_COOK_REQUIRED';
    secondaryClassifications.push('SHELF_STABLE_LONG_TERM');
    waterReq = 'HIGH';
    waterMl = 350;
    fuelReq = primaryClassification === 'MINIMAL_BOIL' ? 'MINIMAL' : 'STANDARD';
    cookingTime = primaryClassification === 'MINIMAL_BOIL' ? 7 : 25;
  } else if (SHELF_STABLE_LONG_TERM_KEYWORDS.some(kw => cleanTokens.includes(kw))) {
    primaryClassification = 'FULL_COOK_REQUIRED';
    secondaryClassifications.push('SHELF_STABLE_LONG_TERM');
    waterReq = 'HIGH';
    waterMl = 300;
    fuelReq = 'STANDARD';
    cookingTime = 20;
  } else {
    // Default safe fallback based on macros
    primaryClassification = 'SHELF_STABLE_LONG_TERM';
    waterReq = 'MODERATE';
    waterMl = 200;
    fuelReq = 'MINIMAL';
    cookingTime = 10;
  }

  // Determine Storage Profile
  const storageProfile = {
    unopenedShelfLifeMonths: refrigerationRequired ? 0.2 : (primaryClassification === 'SHELF_STABLE_LONG_TERM' ? 18 : 6),
    openedShelfLifeDays: refrigerationRequired ? 0.2 : (primaryClassification === 'READY_TO_EAT' ? 30 : 7),
    moistureSensitivity: (primaryClassification === 'COLD_SOAKABLE' || cleanTokens.includes('flour') || cleanTokens.includes('powder')) 
      ? ('EXTREME_MOLD_RISK' as const) 
      : ('MODERATE' as const),
    heatToleranceCelsius: refrigerationRequired ? 4 : 38,
    rodentPestVulnerability: (primaryClassification === 'SHELF_STABLE_LONG_TERM' || cleanTokens.includes('grain')) 
      ? ('HIGH' as const) 
      : ('MODERATE' as const),
    recommendedPackaging: refrigerationRequired 
      ? 'Insulated ice box with freeze gel packs (urgent consumption within 4 hours if power cut)'
      : 'Airtight food-grade HDPE container or heat-sealed Mylar bag with oxygen absorber',
    refrigerationRequiredAfterOpening: refrigerationRequired
  };

  // Determine Complementary Pairings (e.g., Grains + Pulses for complete amino acids)
  const pairings: string[] = [];
  if (category.toLowerCase().includes('grain') || category.toLowerCase().includes('millet')) {
    pairings.push('Moong Dal', 'Roasted Bengal Gram (Pottukadalai)', 'Lentils');
  } else if (category.toLowerCase().includes('legume') || category.toLowerCase().includes('pulse')) {
    pairings.push('Millets (Ragi/Kodo)', 'Rice / Flattened Rice (Aval)', 'Puffed Rice (Pori)');
  } else if (category.toLowerCase().includes('nut') || cleanTokens.includes('peanut')) {
    pairings.push('Jaggery (Vellam)', 'Dates (Pericham Pazham)', 'Puffed Rice');
  }

  // Determine Disaster Scenario Suitability for all 18 Scenarios
  const scenarioIds: DisasterScenarioId[] = [
    'floods_water_contamination', 'cyclones_hurricanes', 'earthquakes_structural',
    'tsunamis_coastal', 'drought_water_shortage', 'wildfires_evacuation',
    'landslides_isolation', 'extreme_heatwave', 'severe_cold_storm',
    'monsoon_heavy_rainfall', 'grid_blackout_power', 'drinking_water_cutoff',
    'cooking_gas_fuel_shortage', 'supply_chain_disruption', 'food_shortage_inflation',
    'evacuation_displacement', 'emergency_shelter', 'community_relief_camp'
  ];

  const scenarios: Record<DisasterScenarioId, any> = {} as any;

  for (const sId of scenarioIds) {
    let isRecommended = true;
    let priorityTier = 'FIRST_72_HOURS';
    let rationale = '';

    if (refrigerationRequired) {
      if (sId === 'grid_blackout_power' || sId === 'floods_water_contamination' || sId === 'cyclones_hurricanes') {
        isRecommended = false;
        priorityTier = 'AVOID';
        rationale = 'High food poisoning risk: Spoils within 2-4 hours when refrigeration is compromised. Do not store.';
      } else {
        isRecommended = false;
        priorityTier = 'RESTRICTED';
        rationale = 'Requires active cold storage. Consume immediately if power is unstable.';
      }
    } else if (primaryClassification === 'READY_TO_EAT' || primaryClassification === 'COLD_SOAKABLE') {
      isRecommended = true;
      priorityTier = 'FIRST_72_HOURS';
      rationale = 'Top disaster choice: Zero cooking gas or power required; highly stable and immediately energizing.';
    } else if (primaryClassification === 'MINIMAL_BOIL') {
      isRecommended = true;
      priorityTier = 'DAYS_4_TO_7';
      rationale = 'Excellent secondary ration: Ready with less than 5 minutes of hot water or brief boiling.';
    } else {
      isRecommended = (sId !== 'cooking_gas_fuel_shortage' && sId !== 'drinking_water_cutoff');
      priorityTier = 'LONG_TERM_RATION';
      rationale = 'Pantry staple: Provides foundational bulk calories for 15-30 day survival reserves when fuel and water are available.';
    }

    scenarios[sId] = {
      scenarioId: sId,
      scenarioName: sId.replace(/_/g, ' ').toUpperCase(),
      isRecommended,
      priorityTier,
      clinicalRationale: rationale
    };
  }

  // Safety Warnings & Rules
  const safetyWarnings: string[] = [];
  if (refrigerationRequired) {
    safetyWarnings.push('CRITICAL: Discard if held above 4°C (40°F) for longer than 4 hours during power outages.');
  }
  if (storageProfile.moistureSensitivity === 'EXTREME_MOLD_RISK') {
    safetyWarnings.push('Vulnerable to fungal aflatoxins if damp: Keep in double-sealed polythene or metal tins during monsoons.');
  }
  if (cal < 50 && waterReq === 'NONE') {
    safetyWarnings.push('Low caloric density: Pair with energy-dense rations (nuts, jaggery, or oil) during acute survival rationing.');
  }

  const floodwaterContaminationRule = refrigerationRequired
    ? 'Discard immediately if floodwaters breach the home or refrigerator.'
    : 'If packaged in cardboard, paper, or screw-top jars, discard if contacted by floodwater. Metal hermetic cans may be sanitized with a 1-tbsp-per-gallon bleach rinse.';

  // Select Authoritative Evidence
  const evidenceSource = refrigerationRequired 
    ? EMERGENCY_EVIDENCE_REGISTRY.cdc_food_safety_blackout.source
    : (cleanTokens.includes('poha') || cleanTokens.includes('millet') || cleanTokens.includes('gram') 
        ? EMERGENCY_EVIDENCE_REGISTRY.icmr_nin_dietary_emergency.source 
        : EMERGENCY_EVIDENCE_REGISTRY.who_humanitarian_nutrition.source);

  return {
    foodId: food.id,
    canonicalSlug,
    foodNameEnglish: nameEn,
    foodNameTamil: nameTa,
    scientificName,
    category,
    primaryClassification,
    secondaryClassifications,
    waterRequirement: waterReq,
    waterMlPer100g: waterMl,
    fuelRequirement: fuelReq,
    cookingTimeMinutes: cookingTime,
    canEatRaw,
    canSoakCold,
    refrigerationRequired,
    storageProfile,
    caloriesPer100g: cal,
    proteinPer100g: prot,
    carbsPer100g: carbs,
    fatPer100g: fat,
    fiberPer100g: fiber,
    isCaloricDense: cal >= 300,
    isHighProtein: prot >= 10,
    thirstInducingSodiumRisk: food.allergens?.includes('high_sodium') || cleanTokens.includes('pickle') || cleanTokens.includes('salted'),
    complementaryPairings: pairings,
    scenarios,
    safetyWarnings,
    floodwaterContaminationRule,
    evidence: evidenceSource,
    lastReviewedDate: '2026-11-09'
  };
}

/**
 * Calculates a complete Household Survival Food and Water Plan for 3, 7, 15, or 30 days.
 */
export function calculateHouseholdEmergencyPlan(
  household: HouseholdMemberRoster,
  infrastructure: HouseholdInfrastructureStatus,
  durationDays: 3 | 7 | 15 | 30 = 7
): HouseholdEmergencyPlan {
  // WHO / ICMR-NIN baseline daily caloric requirements
  const adultCalories = 2100;
  const childCalories = 1500;
  const infantCalories = 750;
  const elderlyCalories = 1800;
  const pregnantCalories = 2500;

  const totalDailyCalories = 
    (household.adults * adultCalories) +
    (household.children * childCalories) +
    (household.infants * infantCalories) +
    (household.elderly * elderlyCalories) +
    (household.pregnantOrLactating * pregnantCalories);

  // Protein targets (10-12% total energy = approx 1.0g per kg or ~55g per adult)
  const totalDailyProtein = Math.round(
    (household.adults * 55) +
    (household.children * 30) +
    (household.infants * 15) +
    (household.elderly * 50) +
    (household.pregnantOrLactating * 70)
  );

  // Water requirements: Minimum 3.0L drinking water per adult/elderly, 1.5L per child/infant
  const dailyDrinkingWaterLiters = 
    ((household.adults + household.elderly + household.pregnantOrLactating) * 3.0) +
    ((household.children + household.infants) * 1.5);

  const totalDrinkingWater = Math.round(dailyDrinkingWaterLiters * durationDays);

  // Food selection based on fuel availability
  const isNoCooking = !infrastructure.cookingFuelAvailable;

  const rations: EmergencyRationItemRequirement[] = [
    // 1. Ready-to-eat / Cold-soak Grain Staple: Flattened Rice (Aval / Poha)
    {
      foodId: 'poha_flattened_rice',
      foodName: 'Flattened Rice (Aval / Poha)',
      foodNameTamil: 'அவல் (Flattened Rice)',
      category: 'Grains & Millets',
      dailyServingGrams: Math.round((household.adults + household.children) * 150),
      totalGramsForPeriod: Math.round((household.adults + household.children) * 150 * durationDays),
      totalCalories: Math.round(((household.adults + household.children) * 150 * durationDays * 345) / 100),
      totalProteinGrams: Math.round(((household.adults + household.children) * 150 * durationDays * 6.8) / 100),
      preparationType: 'COLD_SOAKABLE',
      requiresCooking: false,
      waterRequiredLiters: Math.round(((household.adults + household.children) * 150 * durationDays * 0.15) / 100)
    },
    // 2. Ready-to-eat Protein Core: Roasted Bengal Gram (Pottukadalai)
    {
      foodId: 'roasted_gram_pottukadalai',
      foodName: 'Roasted Bengal Gram (Pottukadalai)',
      foodNameTamil: 'பொட்டுக்கடலை (Roasted Gram)',
      category: 'Pulses & Legumes',
      dailyServingGrams: Math.round((household.adults + household.children) * 60),
      totalGramsForPeriod: Math.round((household.adults + household.children) * 60 * durationDays),
      totalCalories: Math.round(((household.adults + household.children) * 60 * durationDays * 369) / 100),
      totalProteinGrams: Math.round(((household.adults + household.children) * 60 * durationDays * 22.5) / 100),
      preparationType: 'READY_TO_EAT',
      requiresCooking: false,
      waterRequiredLiters: 0
    },
    // 3. Compact Caloric & Mineral Reserve: Jaggery (Vellam)
    {
      foodId: 'jaggery_vellam',
      foodName: 'Jaggery (Vellam / Iron Rich)',
      foodNameTamil: 'வெல்லம் (Jaggery)',
      category: 'Natural Sweeteners',
      dailyServingGrams: Math.round((household.adults + household.children) * 40),
      totalGramsForPeriod: Math.round((household.adults + household.children) * 40 * durationDays),
      totalCalories: Math.round(((household.adults + household.children) * 40 * durationDays * 383) / 100),
      totalProteinGrams: Math.round(((household.adults + household.children) * 40 * durationDays * 0.4) / 100),
      preparationType: 'READY_TO_EAT',
      requiresCooking: false,
      waterRequiredLiters: 0
    },
    // 4. Lipid & Essential Fatty Acids: Raw Peanuts (Groundnuts)
    {
      foodId: 'peanuts_groundnuts',
      foodName: 'Shelled Peanuts / Groundnuts',
      foodNameTamil: 'நிலக்கடலை (Peanuts)',
      category: 'Nuts & Seeds',
      dailyServingGrams: Math.round((household.adults + household.children) * 50),
      totalGramsForPeriod: Math.round((household.adults + household.children) * 50 * durationDays),
      totalCalories: Math.round(((household.adults + household.children) * 50 * durationDays * 567) / 100),
      totalProteinGrams: Math.round(((household.adults + household.children) * 50 * durationDays * 25.8) / 100),
      preparationType: 'READY_TO_EAT',
      requiresCooking: false,
      waterRequiredLiters: 0
    }
  ];

  // If cooking fuel is available, add long-term lentils and millets
  if (!isNoCooking) {
    rations.push({
      foodId: 'split_yellow_moong_dal',
      foodName: 'Yellow Split Moong Dal (Fast Cooking)',
      foodNameTamil: 'பாசிப்பருப்பு (Moong Dal)',
      category: 'Pulses & Legumes',
      dailyServingGrams: Math.round((household.adults + household.children) * 80),
      totalGramsForPeriod: Math.round((household.adults + household.children) * 80 * durationDays),
      totalCalories: Math.round(((household.adults + household.children) * 80 * durationDays * 348) / 100),
      totalProteinGrams: Math.round(((household.adults + household.children) * 80 * durationDays * 24.5) / 100),
      preparationType: 'MINIMAL_BOIL',
      requiresCooking: true,
      waterRequiredLiters: Math.round(((household.adults + household.children) * 80 * durationDays * 0.3) / 100)
    });
  }

  const totalFoodPrepWater = rations.reduce((acc, r) => acc + r.waterRequiredLiters, 0);
  const totalHygieneWater = Math.round((household.adults + household.children) * 2.0 * durationDays);
  const grandTotalWater = totalDrinkingWater + totalFoodPrepWater + totalHygieneWater;

  const mealPlan = {
    breakfast: [
      'Cold-soaked Aval (Poha) sweetened with jaggery and roasted peanuts',
      'Hydrating fresh coconut water or electrolyte drink'
    ],
    lunch: [
      isNoCooking 
        ? 'Spiced Pori (Puffed rice) with roasted Bengal gram, groundnuts, and lemon juice'
        : 'Quick-boiled Moong Dal with parboiled rice or millet'
    ],
    dinner: [
      isNoCooking 
        ? 'Whole grain wheat biscuits with peanut butter or dates'
        : 'Steamed millet or rice porridge with cumin and salt'
    ],
    emergencySnacks: [
      'Roasted gram with crushed jaggery (Kadalai Mittai style)',
      'Dry fruit mix (dates, raisins, almonds)'
    ]
  };

  const safetyChecklist = [
    'Store all dry rations in food-grade, airtight plastic containers elevated at least 2 feet above the floor.',
    'Keep clean potable drinking water in separate narrow-necked containers, clearly labeled "DRINKING ONLY".',
    'If floodwaters enter, immediately elevate all hermetic cans and discard paper-boxed rations touched by water.',
    'Consume refrigerator perishables within the first 4 hours of a power cut. Keep the refrigerator door closed.',
    'Never taste food to check if it is spoiled. Trust smell, texture, and elapsed uncooled time.'
  ];

  return {
    planId: `plan_${Date.now()}`,
    household,
    infrastructure,
    durationDays,
    totalDailyCaloriesNeeded: totalDailyCalories,
    totalDailyProteinNeededGrams: totalDailyProtein,
    totalDrinkingWaterLiters: totalDrinkingWater,
    totalFoodPrepWaterLiters: totalFoodPrepWater,
    totalHygieneWaterLiters: totalHygieneWater,
    grandTotalWaterLiters: grandTotalWater,
    rations,
    mealPlan,
    safetyChecklist,
    createdAt: new Date().toISOString()
  };
}

/**
 * Quick access lookup for food emergency suitability.
 */
export function getFoodEmergencyProfileById(foodId: string): EmergencyFoodSuitabilityRecord | null {
  const item = foodItems.find(f => f.id.toLowerCase() === foodId.toLowerCase());
  if (!item) return null;
  return evaluateFoodEmergencySuitability(item);
}
