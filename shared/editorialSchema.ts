export interface ArticleFoodSection {
  foodId: string;
  foodName: {
    en: string;
    ta?: string;
    hi?: string;
    es?: string;
    fr?: string;
  };
  image: string;
  origin: string;
  nutritionSummary: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  keyNutrients: string[];
  regionalNames: Record<string, string>;
  culinaryUses: string;
  interestingFacts: string[];
  evidenceBasedBenefits: string;
  safetyCaution?: string;
}

export interface ArticleSource {
  title: string;
  url: string;
  sourceType: 'scientific_journal' | 'database' | 'government_health' | 'culinary_heritage';
  accessDate: string;
}

export interface QualityGateResults {
  duplicateTopicCheck: boolean;
  duplicateArticleCheck: boolean;
  factualConsistencyScore: number; // 0-100
  foodDatabaseVerified: boolean;
  nutritionDataVerified: boolean;
  sourceVerified: boolean;
  imageMatchConfidence: number; // 0-100
  copyrightLicensePassed: boolean;
  medicalClaimSafetyPassed: boolean;
  aiHallucinationCheckPassed: boolean;
  grammarReadabilityScore: number; // 0-100
  seoScore: number; // 0-100
  internalLinkCheckPassed: boolean;
  schemaValidationPassed: boolean;
  overallQualityScore: number; // 0-100
  autoPublishEligible: boolean; // >= 90
  recommendation: 'Auto-publish eligible' | 'Human review recommended' | 'Fixes required before publishing';
}

export interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  category: string;
  cuisineOrRegion: string;
  featuredImage: string;
  imageCaption?: string;
  imageAlt: string;
  
  // The 5 featured foods
  foods: ArticleFoodSection[];
  
  whySelected: string;
  introduction: string;
  conclusion: string;
  
  // Metadata
  author: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  status: 'idea' | 'generated' | 'fact_checking' | 'draft' | 'scheduled' | 'published' | 'rejected' | 'archived';
  
  // Editorial Engine Data
  qualityGate: QualityGateResults;
  sources: ArticleSource[];
  topicId?: string;
  isAiGenerated: boolean;
  aiDisclosureText: string;
  medicalDisclaimer: string;
  
  // Engagement
  viewsCount: number;
  likesCount: number;
  sharesCount: number;
  readingTimeMinutes: number;
}

export interface EditorialTopic {
  id: string;
  title: string;
  category: string;
  regionOrCuisine: string;
  themeType: 'seasonal' | 'nutrient' | 'regional_heritage' | 'discovery' | 'preparation' | 'variety_guide';
  selectedFoodIds: string[];
  selectionReason: string;
  priorityScore: number; // 1-100
  freshnessScore: number; // 1-100
  scheduledDate?: string;
  status: 'idea' | 'in_progress' | 'article_created' | 'archived';
}

export interface EditorialEngineSettings {
  autoGenerateEnabled: boolean;
  autoFactCheckEnabled: boolean;
  autoImageCheckEnabled: boolean;
  autoSeoCheckEnabled: boolean;
  autoPublishEnabled: boolean;
  requireHumanApproval: boolean;
  autoPublishThreshold: number; // Default 90
  dailyPublishTarget: number; // Default 1 article/day (5 foods)
  adsenseEnabled: boolean;
  googleNewsEligibilityMonitoring: boolean;
}

export interface EditorialAnalytics {
  totalDatabaseFoods: number;
  publishedArticlesCount: number;
  scheduledArticlesCount: number;
  pendingReviewCount: number;
  aiArticlesGeneratedCount: number;
  passedQualityGateCount: number;
  averageQualityScore: number;
  featuredFoodsCoverage: {
    neverFeatured: number;
    featuredOnce: number;
    featuredMultiple: number;
  };
  googleNewsReadinessScore: number; // 0-100
  adsenseComplianceScore: number; // 0-100
  topArticlesByViews: { title: string; slug: string; views: number }[];
}
