import { pgTable, text, serial, integer, boolean, json, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains the same for authentication purposes
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Food items table for nutrition facts
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(), // e.g., "mango_alphonso"
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  nameTa: text("name_ta").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionHi: text("description_hi").notNull(),
  descriptionTa: text("description_ta").notNull(),
  origin: text("origin").notNull(),
  price: integer("price").notNull(), // Stored in cents
  image: text("image").notNull(),
  categories: text("categories").array().notNull(),
  calories: integer("calories").notNull(),
  carbs: integer("carbs").notNull(), // Stored as decigrames (0.1g)
  protein: integer("protein").notNull(), // Stored as decigrames (0.1g)
  fat: integer("fat").notNull(), // Stored as decigrames (0.1g)
  fiber: integer("fiber").notNull(), // Stored as decigrames (0.1g)
  vitamins: jsonb("vitamins").notNull(),
  allergens: text("allergens").array().notNull(),
  isPopular: boolean("is_popular").notNull().default(false),
  imageSource: text("image_source"),
  imageSourceUrl: text("image_source_url"),
  imageLicense: text("image_license"),
  imageStatus: text("image_status").default("VERIFIED"),
  imageConfidence: integer("image_confidence").default(95),
  imageHash: text("image_hash"),
  imagePerceptualHash: text("image_perceptual_hash"),
  imageVerifiedAt: text("image_verified_at"),
  imageVerificationReason: text("image_verification_reason"),
  imageSearchQuery: text("image_search_query"),
  imageAltText: text("image_alt_text"),
}, (table) => ({
  itemIdIdx: index("food_items_item_id_idx").on(table.itemId),
  nameEnIdx: index("food_items_name_en_idx").on(table.nameEn),
  isPopularIdx: index("food_items_is_popular_idx").on(table.isPopular),
}));

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  foodItemId: text("food_item_id").notNull().references(() => foodItems.itemId),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

// Define relations between tables
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const foodItemsRelations = relations(foodItems, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  foodItem: one(foodItems, {
    fields: [cartItems.foodItemId],
    references: [foodItems.itemId],
  }),
}));

// Define all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Additional types for frontend use
export type TranslatedContent = {
  // English
  en: string;
  
  // Indian languages
  hi?: string;  // Hindi
  ta?: string;  // Tamil
  bn?: string;  // Bengali
  mr?: string;  // Marathi
  te?: string;  // Telugu
  gu?: string;  // Gujarati
  ur?: string;  // Urdu
  kn?: string;  // Kannada
  or?: string;  // Odia (Oriya)
  ml?: string;  // Malayalam
  pa?: string;  // Punjabi
  as?: string;  // Assamese
  mai?: string; // Maithili
  sat?: string; // Santali
  ks?: string;  // Kashmiri
  ne?: string;  // Nepali
  sd?: string;  // Sindhi
  kok?: string; // Konkani
  
  // International languages
  es?: string;  // Spanish
  fr?: string;  // French
  ar?: string;  // Standard Arabic
  ru?: string;  // Russian
  pt?: string;  // Portuguese
  id?: string;  // Indonesian
  de?: string;  // German
  ja?: string;  // Japanese
  sw?: string;  // Swahili
  tr?: string;  // Turkish
  yue?: string; // Yue Chinese (Cantonese)
  vi?: string;  // Vietnamese
  ko?: string;  // Korean
  it?: string;  // Italian
  fa?: string;  // Persian (Farsi)
  th?: string;  // Thai
  ha?: string;  // Hausa
  pl?: string;  // Polish
  uk?: string;  // Ukrainian
  ms?: string;  // Malay
  ro?: string;  // Romanian
  nl?: string;  // Dutch
  am?: string;  // Amharic
  fil?: string; // Filipino (Tagalog)
  my?: string;  // Burmese
  om?: string;  // Oromo
  zh?: string;  // Mandarin Chinese
};

export type FoodItemClient = {
  id: string;
  name: TranslatedContent;
  description: TranslatedContent;
  origin: string;
  price: number;
  image: string;
  category: string[];
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    vitamins: Record<string, string>;
    minerals?: Record<string, string>;
    potassium?: number;
    sodium?: number;
    omega3?: number;
    omega6?: number;
    omega9?: number;
    collagen?: number;
    antioxidants?: Record<string, string>;
    probiotics?: Record<string, string>;
    enzymes?: Record<string, string>;
    glycemicIndex?: number;
    glycemicLoad?: number;
    waterContentPercent?: number;
    measurementBasis?: string;
  };
  healthBenefits?: TranslatedContent[];
  recommendedIntake?: TranslatedContent;
  allergens: string[];
  isPopular: boolean;

  // Digestion & Timing Data
  digestionTimeHours?: string;
  bestTimeToEat?: string;
  idealGapHours?: number;
  digestibilityNotes?: string;

  // Food Combining & Contraindications
  doNotEatWith?: {
    itemOrCategory: string;
    reason: string;
    evidenceLevel: 'traditional' | 'clinical_study' | 'anecdotal';
  }[];
  cautionConditions?: {
    condition: string;
    reason: string;
    severity: 'mild' | 'moderate' | 'avoid_entirely';
  }[];
  bestSeason?: string;

  // Organ-level Benefits
  organBenefits?: {
    organ: 'heart' | 'liver' | 'kidney' | 'brain' | 'eyes' | 'skin' | 'bones' | 'gut' | 'immune_system' | 'thyroid';
    benefit: string;
    supportingNutrient: string;
    evidenceLevel: 'established' | 'emerging' | 'traditional';
  }[];

  // Medical Suitability
  medicalSuitability?: {
    suitableFor: string[];
    cautionFor: string[];
    disclaimer: string;
  };

  // Plant / Crop Profile (if plant-derived)
  plantProfile?: {
    plantType: string;
    climateZone: string;
    idealSoilType: string;
    propagationMethod: string;
    harvestSeason: string;
    waterRequirement: 'low' | 'moderate' | 'high';
    growingRegions: string[];
  };

  // Image pipeline & sourcing metadata
  imageUrl?: string;
  imageSourceType?: 'usda' | 'open_food_facts' | 'wikimedia' | 'ai_generated';
  imageSourceId?: string;
  imageLicense?: string;
  imageAttribution?: string;
  imageVerifiedStatus?: 'verified' | 'unverified' | 'ai_placeholder' | 'mismatch_flagged';
  imageLastCheckedAt?: string;
  imageFallbackUrl?: string;

  // Exact Image Validation System fields (Requirement 1 & 13)
  image_url?: string;
  image_source?: string;
  image_source_url?: string;
  image_license?: string;
  image_status?: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' | 'MISSING' | 'DUPLICATE';
  image_confidence?: number;
  image_hash?: string;
  image_perceptual_hash?: string;
  image_verified_at?: string;
  image_verification_reason?: string;
  image_search_query?: string;
  image_alt_text?: string;

  // CamelCase equivalents for developer ergonomics
  imageSource?: string;
  imageSourceUrl?: string;
  imageStatus?: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' | 'MISSING' | 'DUPLICATE';
  imageHash?: string;
  imagePerceptualHash?: string;
  imageVerifiedAt?: string;
  imageVerificationReason?: string;
  imageSearchQuery?: string;
  imageAltText?: string;
  isDuplicate?: boolean;
  duplicateOfId?: string;

  // Image QA metadata
  imageConfidence?: number;
  verifiedStatus?: 'unverified' | 'ai_flagged' | 'admin_verified' | 'admin_rejected';

  // Google Images search link & Excel spreadsheet export metadata
  googleSearchUrl?: string;
  excelFormula?: string;

  // Extended Scientific Data & Provenance (Phase 2)
  scientificProfile?: ExtendedScientificProfile;
};

// ============================================================================
// PHASE 2 SCIENTIFIC DATA PROVENANCE & QUALITY SCHEMA
// ============================================================================

export type ProvenanceStatus = 
  | 'VERIFIED'
  | 'SOURCE_REPORTED'
  | 'CALCULATED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'MISSING'
  | 'NOT_APPLICABLE'
  | 'CONFLICTING'
  | 'NEEDS_REVIEW';

export type EvidenceLevel = 
  | 'Strong'
  | 'Moderate'
  | 'Limited'
  | 'Preliminary'
  | 'Traditional use only';

export type ClinicalEvidenceLevel = 
  | 'STRONG_CLINICAL_EVIDENCE'
  | 'MODERATE_CLINICAL_EVIDENCE'
  | 'PRELIMINARY_EVIDENCE'
  | 'THEORETICAL_MECHANISM'
  | 'TRADITIONAL_USE_ONLY';

export type InteractionSeverity = 
  | 'CONTRAINDICATED'
  | 'MAJOR'
  | 'MODERATE'
  | 'MINOR'
  | 'INFORMATIONAL';

export interface ClinicalMedicationInteraction {
  id?: string;
  drug_class: string;
  interacting_substance: string;
  severity: InteractionSeverity;
  clinical_mechanism: string;
  patient_action: string;
  evidence_level: ClinicalEvidenceLevel;
  authoritative_reference: string;
  provenance_status: ProvenanceStatus;
  confidence: number;
}

export interface BioactiveCompoundRecord {
  compound: string;
  value?: number;
  unit: string;
  basis: string;
  provenance_status: ProvenanceStatus;
  source: string;
  confidence: number;
  method?: string;
  biologicalActivity?: string;
}

export interface PlantAgricultureProfile {
  is_plant: boolean;
  provenance_status: ProvenanceStatus;
  plant_type?: 'Tree' | 'Shrub' | 'Herb' | 'Vine' | 'Grass' | 'Tuber' | 'Root' | 'Legume' | 'Palm';
  lifecycle?: 'Annual' | 'Biennial' | 'Perennial';
  climate_classification?: 'Tropical' | 'Subtropical' | 'Temperate' | 'Arid' | 'Alpine' | 'Mediterranean';
  soil_type?: string;
  soil_ph?: string;
  water_requirements?: 'Low' | 'Moderate' | 'High' | 'Drought-Tolerant' | 'Aquatic / Flooded';
  sunlight_requirements?: 'Full Sun' | 'Partial Shade' | 'Shade';
  planting_season?: string;
  germination_time_days?: string;
  days_to_maturity?: string;
  flowering_season?: string;
  fruit_development_period?: string;
  harvest_window?: string;
  harvest_frequency?: string;
  productive_lifespan_years?: string;
  total_plant_lifespan_years?: string;
  major_cultivation_regions?: string[];
  edible_portion_yield_indicator?: string;
}

export interface AntinutrientRecord {
  compound: 'Phytates' | 'Oxalates' | 'Lectins' | 'Tannins' | 'Goitrogens' | 'Trypsin Inhibitors' | 'None Documented';
  prevalence: 'Trace' | 'Moderate' | 'Significant' | 'Negligible' | 'None Documented';
  physiological_context: string;
  reduction_methods: string[];
  provenance_status: ProvenanceStatus;
}

export interface BioavailabilityRecord {
  nutrient: string;
  chemicalForm?: string;
  absorption_rate_estimate: string;
  enhancing_factors: string[];
  inhibiting_factors: string[];
  preparation_effects: string;
  evidence_level: ClinicalEvidenceLevel;
  provenance_status: ProvenanceStatus;
}

export interface NutrientProvenanceRecord<T = number | string> {
  nutrient: string;
  value: T;
  unit: string;
  basis: string; // e.g., "per 100 g edible portion"
  provenance_status: ProvenanceStatus;
  source: string; // e.g., "USDA FoodData Central" | "ICMR-NIN IFCT 2017"
  source_organization?: string;
  publication_database?: string;
  year_version?: string;
  method?: string; // e.g., "AOAC 984.27 ICP-OES", "HPLC", "Calculation"
  confidence: number; // 0.0 to 1.0 (e.g. 0.98 for lab assay, 0.65 for derived)
  last_verified: string;
  standard_reference_id?: string; // e.g., "FDC ID 1102644", "IFCT D001"
  notes?: string;
}

export interface DetailedDataQualityScore {
  overallScore: number; // 0 - 100
  identityScore: number; // 0 - 100
  nutritionScore: number; // 0 - 100
  micronutrientSourceScore: number; // 0 - 100 (high for source-reported, lower for derived)
  bioactiveSourceScore: number; // 0 - 100
  evidenceScore: number; // 0 - 100
  safetyScore: number; // 0 - 100
  agricultureScore: number; // 0 - 100
  storageScore: number; // 0 - 100
  articleScore: number; // 0 - 100
  referenceScore: number; // 0 - 100
  translationScore: number; // 0 - 100
  imageScore: number; // 0 - 100
  scoreExplanation: string;
}

export interface DataConflictRecord {
  id: string;
  foodId: string;
  fieldName: string;
  sourceA: {
    sourceName: string;
    value: any;
    unit?: string;
    status: ProvenanceStatus;
  };
  sourceB: {
    sourceName: string;
    value: any;
    unit?: string;
    status: ProvenanceStatus;
  };
  conflictType: 'different_forms' | 'different_cultivars' | 'discrepant_assay' | 'unit_mismatch';
  resolutionStatus: 'RESOLVED' | 'NEEDS_REVIEW' | 'KEEP_BOTH_WITH_CONTEXT';
  resolutionNotes: string;
}

export interface ExtendedScientificProfile {
  foodId: string;
  provenanceMap: Record<string, NutrientProvenanceRecord>;
  bioactivesMap?: Record<string, BioactiveCompoundRecord>;
  agricultureProfile?: PlantAgricultureProfile;
  clinicalInteractions?: ClinicalMedicationInteraction[];
  antinutrients?: AntinutrientRecord[];
  bioavailability?: BioavailabilityRecord[];
  qualityScore: DetailedDataQualityScore;
  conflicts?: DataConflictRecord[];
  isEnrichedFromAuthoritativeDatabase: boolean;
  authoritativeSourceId?: string;
  authoritativeSourceName?: string;
  authoritativeDatabase?: string;
  ediblePortionDescription?: string;
}

export type ImageStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' | 'MISSING' | 'DUPLICATE';
export type ImageSourceType = 'usda' | 'open_food_facts' | 'wikimedia' | 'ai_generated';
export type ImageVerifiedStatus = 'verified' | 'unverified' | 'ai_placeholder' | 'mismatch_flagged';

export type CartItemClient = {
  id: string;
  foodItem: FoodItemClient;
  quantity: number;
};

export type Language = 
  // English
  'en' | 
  
  // Indian languages
  'hi' | 'ta' | 'bn' | 'mr' | 'te' | 'gu' | 'ur' | 'kn' | 'or' | 
  'ml' | 'pa' | 'as' | 'mai' | 'sat' | 'ks' | 'ne' | 'sd' | 'kok' |
  
  // International languages
  'es' | 'fr' | 'ar' | 'ru' | 'pt' | 'id' | 'de' | 'ja' | 'sw' | 
  'tr' | 'yue' | 'vi' | 'ko' | 'it' | 'fa' | 'th' | 'ha' | 'pl' | 
  'uk' | 'ms' | 'ro' | 'nl' | 'am' | 'fil' | 'my' | 'om' | 'zh';

// --- Visitor & Analytics Intelligence Interfaces ---
export interface VisitorLog {
  id: string;
  ip: string;
  path: string;
  userAgent: string;
  visitCount: number;
  isRepeatUser: boolean;
  country: string;
  region: string;
  timestamp: string;
}

export interface PageMetric {
  path: string;
  pageName: string;
  totalViews: number;
  dailyViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: string;
}

export interface FoodViewMetric {
  foodId: string;
  foodName: string;
  category: string;
  imageUrl?: string;
  views: number;        // Total views
  dailyViews: number;   // Daily views (today)
  shares: number;
  downloads: number;
  lastViewedAt: string;
}

export interface NetworkAdPerformance {
  provider: 'Google AdSense' | 'Amazon Associates' | 'Flipkart Affiliate';
  totalImpressions: number; // Total Ad Views
  dailyImpressions: number; // Daily Ad Views
  totalClicks: number;      // Total Ad Clicks
  dailyClicks: number;      // Daily Ad Clicks
  ctr: number;
  ecpm: number;
  totalRevenue: number;
  dailyRevenue: number;
}

export interface DailyHistoryGraphPoint {
  date: string;
  pageViews: number;
  foodViews: number;
  googleAdViews: number;
  googleAdClicks: number;
  amazonAdViews: number;
  amazonAdClicks: number;
  flipkartAdViews: number;
  flipkartAdClicks: number;
  totalAdClicks: number;
  googleRevenue: number;
  amazonRevenue: number;
  flipkartRevenue: number;
  totalRevenue: number;
}

export interface AdPerformanceLog {
  id: string;
  date: string;
  adUnit: string;
  impressions: number;
  clicks: number;
  ctr: number;
  estimatedRevenue: number;
  ecpm: number;
}

export interface VisitorAnalyticsSummary {
  totalVisits: number;
  uniqueIPsCount: number;
  repeatUsersCount: number;
  repeatUserPercentage: number;
  totalFoodViews: number;
  totalShares: number;
  totalDownloads: number;
  totalAdImpressions: number;
  totalAdClicks: number;
  avgCtr: number;
  totalAdRevenue: number;
  recentVisitorLogs: VisitorLog[];
  topFoodMetrics: FoodViewMetric[];
  pageMetrics: PageMetric[];
  networkAdPerformance: NetworkAdPerformance[];
  dailyHistoryGraph: DailyHistoryGraphPoint[];
  adPerformanceHistory: AdPerformanceLog[];
}
