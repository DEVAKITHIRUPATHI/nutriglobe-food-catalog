/**
 * NUTRIFACTS — EMERGENCY EVIDENCE REGISTRY
 * 
 * Peer-reviewed public health and disaster response evidence sources from:
 * 1. World Health Organization (WHO) — Humanitarian Food Rations & Safe Water Guidelines
 * 2. FEMA (Federal Emergency Management Agency) — Food and Water in an Emergency
 * 3. CDC (Centers for Disease Control) — Food Safety in a Power Outage & Disaster
 * 4. ICMR - National Institute of Nutrition (ICMR-NIN) — Dietary Guidelines for Indians & Nutrient Requirements
 * 5. FSSAI — Food Safety in Disaster Relief & Storage Guidelines
 * 6. NDMA India — Standard Operating Procedures for Floods, Cyclones & Extreme Heat
 */

import type { EvidenceSourceAttribution, DisasterScenarioId } from './emergencyFoodSchema';

export interface AuthoritativeGuidelineEntry {
  id: string;
  source: EvidenceSourceAttribution;
  applicableScenarios: DisasterScenarioId[];
  coreDirectives: string[];
  hydrationBaselinePerAdultLitersPerDay: number;
  perishableSafeHoldingHoursWithoutPower: number;
}

export const EMERGENCY_EVIDENCE_REGISTRY: Record<string, AuthoritativeGuidelineEntry> = {
  who_humanitarian_nutrition: {
    id: 'who_humanitarian_nutrition',
    source: {
      organization: 'WHO (World Health Organization)',
      documentTitle: 'The Management of Nutrition in Major Emergencies & Sphere Minimum Standards',
      officialReferenceUrl: 'https://www.who.int/publications/i/item/9241545209',
      publicationYear: '2023',
      confidenceScore: 0.98,
      evidenceType: 'ESTABLISHED_DIRECTIVE'
    },
    applicableScenarios: [
      'floods_water_contamination',
      'cyclones_hurricanes',
      'earthquakes_structural',
      'tsunamis_coastal',
      'drought_water_shortage',
      'supply_chain_disruption',
      'food_shortage_inflation',
      'evacuation_displacement',
      'emergency_shelter',
      'community_relief_camp'
    ],
    coreDirectives: [
      'Minimum standard survival intake: 2,100 kcal per person per day with 10-12% energy from protein (52-63g).',
      'Drinking water baseline: Minimum 3.0 liters per person per day under normal temperate conditions, increasing to 4.5+ liters in tropical heat.',
      'Complementary pulse and cereal combinations (e.g., 4:1 cereal-to-pulse ratio) guarantee complete limiting essential amino acids (methionine + lysine).'
    ],
    hydrationBaselinePerAdultLitersPerDay: 3.0,
    perishableSafeHoldingHoursWithoutPower: 4
  },

  fema_food_and_water: {
    id: 'fema_food_and_water',
    source: {
      organization: 'FEMA (Federal Emergency Management Agency)',
      documentTitle: 'Food and Water in an Emergency (FEMA P-477 / ARC 4463)',
      officialReferenceUrl: 'https://www.ready.gov/food',
      publicationYear: '2024',
      confidenceScore: 0.99,
      evidenceType: 'ESTABLISHED_DIRECTIVE'
    },
    applicableScenarios: [
      'grid_blackout_power',
      'floods_water_contamination',
      'cyclones_hurricanes',
      'earthquakes_structural',
      'drinking_water_cutoff',
      'cooking_gas_fuel_shortage'
    ],
    coreDirectives: [
      'First 72 Hours: Rely on ready-to-eat foods that do not require refrigeration, water, or cooking.',
      'Blackout Protocol: An unopened refrigerator keeps food cold for about 4 hours. A full freezer holds temperature for 48 hours (24 hours if half-full).',
      'Consume perishables first from the refrigerator, then items from the freezer, and finally shelf-stable pantry items.',
      'Never taste food to determine its safety. When in doubt, throw it out.'
    ],
    hydrationBaselinePerAdultLitersPerDay: 3.78, // 1 gallon
    perishableSafeHoldingHoursWithoutPower: 4
  },

  cdc_food_safety_blackout: {
    id: 'cdc_food_safety_blackout',
    source: {
      organization: 'CDC (Centers for Disease Control and Prevention)',
      documentTitle: 'Keep Food Safe After a Disaster or Emergency',
      officialReferenceUrl: 'https://www.cdc.gov/food-safety/after-disaster/index.html',
      publicationYear: '2024',
      confidenceScore: 0.97,
      evidenceType: 'ESTABLISHED_DIRECTIVE'
    },
    applicableScenarios: [
      'floods_water_contamination',
      'grid_blackout_power',
      'extreme_heatwave'
    ],
    coreDirectives: [
      'Floodwater Contamination: Discard any food that came into contact with floodwater, including screw-capped jars, twist lids, crown caps, and cardboard containers.',
      'Undamaged all-metal commercially canned foods can be saved if cleaned and sanitized (remove paper label, wash with soap/clean water, submerge in chlorine bleach solution 1 tbsp per gallon for 1 minute).',
      'Throw away perishable foods (meat, poultry, fish, eggs, dairy, cooked leftovers) held above 40°F (4.4°C) for 2 hours or more (1 hour if temperature is above 90°F / 32°C).'
    ],
    hydrationBaselinePerAdultLitersPerDay: 3.0,
    perishableSafeHoldingHoursWithoutPower: 4
  },

  icmr_nin_dietary_emergency: {
    id: 'icmr_nin_dietary_emergency',
    source: {
      organization: 'ICMR-NIN (National Institute of Nutrition, Hyderabad)',
      documentTitle: 'Dietary Guidelines for Indians (2024) & Nutrient Requirements for Indians',
      officialReferenceUrl: 'https://www.nin.res.in/',
      publicationYear: '2024',
      confidenceScore: 0.96,
      evidenceType: 'CONSENSUS_GUIDELINE'
    },
    applicableScenarios: [
      'monsoon_heavy_rainfall',
      'cyclones_hurricanes',
      'drought_water_shortage',
      'food_shortage_inflation',
      'community_relief_camp'
    ],
    coreDirectives: [
      'Indian Staple Resilience: Poha (flattened rice / aval), puffed rice (pori), roasted Bengal gram (pottukadalai), sattu, jaggery (vellam), and groundnuts provide rapid, zero-cooking caloric and protein stability during tropical monsoons and floods.',
      'Millets (Ragi, Kodo, Barnyard, Foxtail) stored in moisture-sealed containers remain viable for 12+ months and supply sustained micronutrients (calcium, iron) and resistant dietary fiber.',
      'Sprouting legumes (green gram / moong) during extended power cuts enhances Vitamin C and B-complex bioavailability even when fresh produce is unobtainable.'
    ],
    hydrationBaselinePerAdultLitersPerDay: 3.2,
    perishableSafeHoldingHoursWithoutPower: 4
  },

  ndma_india_sop: {
    id: 'ndma_india_sop',
    source: {
      organization: 'NDMA (National Disaster Management Authority, India)',
      documentTitle: 'National Disaster Management Guidelines: Management of Floods & Cyclones',
      officialReferenceUrl: 'https://ndma.gov.in/',
      publicationYear: '2023',
      confidenceScore: 0.95,
      evidenceType: 'ESTABLISHED_DIRECTIVE'
    },
    applicableScenarios: [
      'floods_water_contamination',
      'cyclones_hurricanes',
      'tsunamis_coastal',
      'extreme_heatwave',
      'monsoon_heavy_rainfall'
    ],
    coreDirectives: [
      'Coastal Cyclone Preparedness: Coastal households in Tamil Nadu, Andhra Pradesh, and Odisha must maintain a 7-day reserve of dry non-cook rations in airtight, watertight containers.',
      'Drinking water storage: Store water in food-grade, narrow-mouthed HDPE containers with tight covers to prevent vector breeding and bacterial ingress.',
      'During extreme heatwaves ( लू / வெயில் அலை ), oral rehydration solution (ORS), buttermilk, lemon water, and coconut water should be prioritized over caffeinated or heavily sweetened beverages.'
    ],
    hydrationBaselinePerAdultLitersPerDay: 4.0,
    perishableSafeHoldingHoursWithoutPower: 3
  }
};
