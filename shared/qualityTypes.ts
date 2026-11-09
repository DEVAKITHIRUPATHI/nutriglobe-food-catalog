export interface FoodQualityAuditRecord {
  foodId: string;
  foodName: string;
  foodNameTamil: string;
  scientificName: string;
  canonicalSlug: string;
  canonicalUrl: string;
  category: string;
  subcategory: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  imageUrl: string;
  nutritionSource: string;
  qualityScore: number; // 0 to 100
  isIndexable: boolean;
  validationStatus: 'PASSED' | 'WARNING' | 'FAILED';
  atwaterEstimatedCalories: number;
  atwaterDifference: number;
  atwaterStatus: 'EQUILIBRIUM' | 'VARIATION_WARNING' | 'MISMATCH_FLAG';
  missingFields: string[];
  issues: string[];
}

export interface ContentQualityDashboardSummary {
  totalFoods: number;
  indexableFoods: number;
  reviewRequired: number;
  thinFoods: number;
  duplicateCandidates: number;
  missingImages: number;
  missingNutrition: number;
  missingDescriptions: number;
  averageQualityScore: number;
  unsupportedClaimsCount: number;
  overallCompletenessPercent: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  generatedAt: string;

  // Recharts Interactive Datasets
  completenessDonut: Array<{ name: string; value: number; percentage: number; fill: string }>;
  fieldCoverage: Array<{ field: string; percentage: number; coveredCount: number; total: number; fill: string }>;
  qualityDistribution: Array<{ range: string; count: number; percentage: number; fill: string }>;
  nutritionIntegrity: Array<{ status: string; count: number; percentage: number; fill: string }>;
  categoryCompleteness: Array<{ category: string; total: number; avgScore: number; completenessPercent: number }>;
  dataProvenance: Array<{ source: string; count: number; percentage: number; fill: string }>;

  // Audit Records for Inspector Table
  records: FoodQualityAuditRecord[];

  // Scoring Methodology Documentation
  scoringMethodology: {
    formula: string;
    weights: Record<string, number>;
    disclaimer: string;
  };
}
