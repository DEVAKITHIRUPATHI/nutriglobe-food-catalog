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

  // Image QA metadata
  imageConfidence?: number;
  verifiedStatus?: 'unverified' | 'ai_flagged' | 'admin_verified' | 'admin_rejected';
};

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
