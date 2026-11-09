/**
 * NUTRIFACTS — EMERGENCY FOOD INTELLIGENCE & DISASTER PREPAREDNESS SCHEMA
 * 
 * Defines rigorous data contracts for:
 * 1. Emergency Preparation & Cooking Classifications
 * 2. Water & Fuel Requirements
 * 3. Shelf-life & Environmental Vulnerabilities (Moisture, Heat, Rodents)
 * 4. Disaster Scenario Suitability Matrix (18 Scenarios)
 * 5. Household Survival Ration Planning
 * 6. Evidence Sources & Confidence Levels (WHO, FEMA, CDC, FSSAI, NDMA, ICMR-NIN)
 */

export type EmergencyPreparationType = 
  | 'READY_TO_EAT'               // Eaten immediately without heat or water (e.g. nuts, dates, roasted gram, banana)
  | 'READY_TO_EAT_AFTER_WASH'    // Edible raw, but requires clean potable water washing (e.g. whole fresh apple, cucumber)
  | 'COLD_SOAKABLE'              // Edible after cold potable water soaking without cooking (e.g. flattened rice / poha / aval, oats, sattu)
  | 'HOT_WATER_REHYDRATION'      // Edible after brief hot water steep (e.g. dehydrated vegetables, couscous, instant poha)
  | 'MINIMAL_BOIL'               // Requires brief boiling (< 5-7 mins) (e.g. split red lentils, quick noodles, parboiled grains)
  | 'FULL_COOK_REQUIRED'         // Requires sustained cooking (> 20 mins) (e.g. raw chickpeas, unpolished raw rice, raw tubers)
  | 'REFRIGERATION_DEPENDENT'    // Spoils within 2-4 hours at room temperature (e.g. fresh dairy, raw meat, fresh fish, paneer)
  | 'PERISHABLE_PRODUCE'         // Spoils within 2-5 days without cold chain (e.g. leafy greens, soft berries)
  | 'SHELF_STABLE_LONG_TERM'     // Stable 6-24+ months dry sealed (e.g. whole millets, whole pulses, jaggery, honey, ghee)
  | 'UNSUITABLE_IN_CRISIS'       // Hazardous or severely impractical without utilities (e.g. frozen foods during blackout, raw shellfish)
  | 'DATA_PENDING';              // Awaiting laboratory or authoritative verification

export type WaterRequirementLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
export type FuelRequirementLevel = 'NONE' | 'MINIMAL' | 'STANDARD' | 'HIGH';

export type DisasterScenarioId =
  | 'floods_water_contamination'
  | 'cyclones_hurricanes'
  | 'earthquakes_structural'
  | 'tsunamis_coastal'
  | 'drought_water_shortage'
  | 'wildfires_evacuation'
  | 'landslides_isolation'
  | 'extreme_heatwave'
  | 'severe_cold_storm'
  | 'monsoon_heavy_rainfall'
  | 'grid_blackout_power'
  | 'drinking_water_cutoff'
  | 'cooking_gas_fuel_shortage'
  | 'supply_chain_disruption'
  | 'food_shortage_inflation'
  | 'evacuation_displacement'
  | 'emergency_shelter'
  | 'community_relief_camp';

export interface DisasterScenarioSuitability {
  scenarioId: DisasterScenarioId;
  scenarioName: string;
  isRecommended: boolean;
  priorityTier: 'FIRST_72_HOURS' | 'DAYS_4_TO_7' | 'LONG_TERM_RATION' | 'RESTRICTED' | 'AVOID';
  clinicalRationale: string;
}

export interface FoodStorageEnvironmentProfile {
  unopenedShelfLifeMonths: number;
  openedShelfLifeDays: number;
  moistureSensitivity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME_MOLD_RISK';
  heatToleranceCelsius: number;
  rodentPestVulnerability: 'LOW' | 'MODERATE' | 'HIGH';
  recommendedPackaging: string;
  refrigerationRequiredAfterOpening: boolean;
}

export interface EvidenceSourceAttribution {
  organization: 
    | 'WHO (World Health Organization)'
    | 'FEMA (Federal Emergency Management Agency)'
    | 'CDC (Centers for Disease Control and Prevention)'
    | 'ICMR-NIN (National Institute of Nutrition, Hyderabad)'
    | 'FSSAI (Food Safety and Standards Authority of India)'
    | 'NDMA (National Disaster Management Authority, India)'
    | 'FAO (Food and Agriculture Organization)'
    | 'UNICEF (United Nations Children\'s Fund)'
    | 'USDA Food Safety and Inspection Service';
  documentTitle: string;
  officialReferenceUrl: string;
  publicationYear: string;
  confidenceScore: number; // 0.0 to 1.0 (e.g. 0.95 for direct guideline)
  evidenceType: 'ESTABLISHED_DIRECTIVE' | 'LAB_STABILITY_ASSAY' | 'CONSENSUS_GUIDELINE' | 'EXPERT_ESTIMATE';
}

export interface EmergencyFoodSuitabilityRecord {
  foodId: string;
  canonicalSlug: string;
  foodNameEnglish: string;
  foodNameTamil: string;
  scientificName: string;
  category: string;
  
  // Preparation & Infrastructure Requirements
  primaryClassification: EmergencyPreparationType;
  secondaryClassifications: EmergencyPreparationType[];
  waterRequirement: WaterRequirementLevel;
  waterMlPer100g: number;
  fuelRequirement: FuelRequirementLevel;
  cookingTimeMinutes: number;
  canEatRaw: boolean;
  canSoakCold: boolean;
  refrigerationRequired: boolean;

  // Storage & Preservation
  storageProfile: FoodStorageEnvironmentProfile;

  // Nutritional Role in Emergency
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  isCaloricDense: boolean; // > 300 kcal / 100g
  isHighProtein: boolean;  // > 10g protein / 100g
  thirstInducingSodiumRisk: boolean; // High sodium / salty foods that exacerbate thirst when water is scarce
  complementaryPairings: string[]; // e.g. ["rice", "moong_dal"] or ["flattened_rice", "roasted_gram"]

  // Disaster Suitability (18 Scenarios)
  scenarios: Record<DisasterScenarioId, DisasterScenarioSuitability>;

  // Safety Warnings & Cautions
  safetyWarnings: string[];
  floodwaterContaminationRule: string;

  // Evidence Attribution
  evidence: EvidenceSourceAttribution;
  lastReviewedDate: string;
}

export interface HouseholdMemberRoster {
  adults: number;
  children: number; // 1-10 years
  infants: number;  // 0-12 months
  elderly: number;  // 65+ years
  pregnantOrLactating: number;
}

export interface HouseholdInfrastructureStatus {
  cookingFuelAvailable: boolean;
  cleanPotableWaterLiters: number;
  electricityWorking: boolean;
  refrigeratorFunctional: boolean;
  hasAirtightStorageContainers: boolean;
}

export interface EmergencyRationItemRequirement {
  foodId: string;
  foodName: string;
  foodNameTamil: string;
  category: string;
  dailyServingGrams: number;
  totalGramsForPeriod: number;
  totalCalories: number;
  totalProteinGrams: number;
  preparationType: EmergencyPreparationType;
  requiresCooking: boolean;
  waterRequiredLiters: number;
}

export interface HouseholdEmergencyPlan {
  planId: string;
  household: HouseholdMemberRoster;
  infrastructure: HouseholdInfrastructureStatus;
  durationDays: 3 | 7 | 15 | 30;
  totalDailyCaloriesNeeded: number;
  totalDailyProteinNeededGrams: number;
  
  // Water Allocations (Litres)
  totalDrinkingWaterLiters: number;       // 3L per adult/day, 1.5L per child
  totalFoodPrepWaterLiters: number;       // Based on chosen food types
  totalHygieneWaterLiters: number;          // Minimum sanitary allocation
  grandTotalWaterLiters: number;
  
  // Rations by Food Category
  rations: EmergencyRationItemRequirement[];
  
  // Meal Schedule Example
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    emergencySnacks: string[];
  };

  // Immediate Action Checklists
  safetyChecklist: string[];
  createdAt: string;
}
