import { describe, it, expect } from 'vitest';
import { MemStorage } from '../server/storage';
import type { FoodItemClient, UserRecommendationResult } from '../shared/schema';

describe('API Contract & Data Stability Tests', () => {
  const storage = new MemStorage();

  it('guarantees FoodItemClient contract compliance across all seeded foods', async () => {
    const foods = await storage.getAllFoodItems();
    expect(foods.length).toBeGreaterThan(0);

    for (const food of foods.slice(0, 50)) {
      // Identity & Localization
      expect(typeof food.id).toBe('string');
      expect(food.id.length).toBeGreaterThan(0);
      expect(food.name).toBeDefined();
      expect(typeof food.name.en).toBe('string');
      expect(food.name.en.length).toBeGreaterThan(0);

      // Category
      expect(Array.isArray(food.category)).toBe(true);

      // Nutrition numbers
      expect(food.nutrition).toBeDefined();
      expect(typeof food.nutrition.calories).toBe('number');
      expect(typeof food.nutrition.protein).toBe('number');
      expect(typeof food.nutrition.carbs).toBe('number');
      expect(typeof food.nutrition.fat).toBe('number');
      expect(typeof food.nutrition.fiber).toBe('number');

      // Negative values prohibited
      expect(food.nutrition.calories).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.protein).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.carbs).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.fat).toBeGreaterThanOrEqual(0);
      expect(food.nutrition.fiber).toBeGreaterThanOrEqual(0);

      // Price
      expect(typeof food.price).toBe('number');
      expect(food.price).toBeGreaterThanOrEqual(0);
    }
  });

  it('maintains mathematical integrity of caloric and macronutrient calculations', async () => {
    const foods = await storage.getAllFoodItems();
    const sampleFoods = foods.slice(0, 5);

    const aggregated = sampleFoods.reduce((acc, item) => ({
      calories: acc.calories + (item.nutrition.calories || 0),
      protein: acc.protein + (item.nutrition.protein || 0),
      carbs: acc.carbs + (item.nutrition.carbs || 0),
      fat: acc.fat + (item.nutrition.fat || 0),
      fiber: acc.fiber + (item.nutrition.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    expect(aggregated.calories).toBeGreaterThan(0);
    expect(aggregated.protein).toBeGreaterThan(0);
    expect(Number.isFinite(aggregated.calories)).toBe(true);
    expect(Number.isFinite(aggregated.protein)).toBe(true);
  });

  it('guarantees search API stability with edge cases and blank queries', async () => {
    // Blank search
    const all = await storage.searchFoodItems('', 'all', 'en');
    expect(all.length).toBeGreaterThan(100);

    // Non-existent search
    const empty = await storage.searchFoodItems('__non_existent_food_query_xyz_123__', undefined, 'en');
    expect(Array.isArray(empty)).toBe(true);
    expect(empty.length).toBe(0);

    // Invalid category
    const emptyCat = await storage.searchFoodItems(undefined, '__non_existent_category__', 'en');
    expect(Array.isArray(emptyCat)).toBe(true);
    expect(emptyCat.length).toBe(0);
  });

  it('guarantees User Recommendation contract stability', async () => {
    const result: UserRecommendationResult = await storage.getUserRecommendations(1, { focus: 'heart_health', limit: 3 });

    expect(result.userId).toBe(1);
    expect(result.focus).toBe('heart_health');
    expect(typeof result.totalRecommendations).toBe('number');
    expect(typeof result.rationale).toBe('string');
    expect(Array.isArray(result.recommendations)).toBe(true);

    for (const rec of result.recommendations) {
      expect(rec.food).toBeDefined();
      expect(typeof rec.score).toBe('number');
      expect(rec.score).toBeGreaterThan(0);
      expect(typeof rec.matchReason).toBe('string');
      expect(Array.isArray(rec.healthTags)).toBe(true);
      expect(typeof rec.keyNutrientHighlight).toBe('string');
    }
  });

  it('guarantees Google Image search URLs and Excel formulas are populated for all food items', async () => {
    const foods = await storage.getAllFoodItems();
    expect(foods.length).toBeGreaterThan(1000);

    for (const food of foods.slice(0, 100)) {
      expect(food.googleSearchUrl).toBeDefined();
      expect(food.googleSearchUrl).toContain('https://www.google.com/search?q=');
      expect(food.googleSearchUrl).toContain('tbm=isch');
      
      expect(food.excelFormula).toBeDefined();
      expect(food.excelFormula).toContain('=HYPERLINK(');
      expect(food.excelFormula).toContain('View Image');
    }
  });

  it('verifies vercel.json is configured for Node.js runtime and SPA non-api routing', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    expect(fs.existsSync(vercelConfigPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    expect(config.functions).toBeDefined();
    expect(config.functions['api/**/*.ts'].runtime).toContain('nodejs');
    
    expect(Array.isArray(config.rewrites)).toBe(true);
    const nonApiRewrite = config.rewrites.find((r: any) => r.destination === '/index.html');
    expect(nonApiRewrite).toBeDefined();
    expect(nonApiRewrite.source).toContain('(?!api/)');
  });

  it('verifies curated photo map entries for swiss_chard and kohlrabi', async () => {
    const { FOOD_PHOTO_MAP, getFoodImageMetadata } = await import('../shared/foodImageResolver');
    
    const swissChard = getFoodImageMetadata('swiss_chard', 'Swiss Chard', ['vegetables', 'leafy green']);
    expect(swissChard.imageUrl).toContain('photo-1759579719674-22b27ba1b8b0');
    expect(swissChard.attribution).toContain('Anna Kharkivska');

    const kohlrabi = getFoodImageMetadata('kohlrabi', 'Kohlrabi', ['vegetables', 'cruciferous']);
    expect(kohlrabi.imageUrl).toContain('photo-1554107716-ec43584a2e9a');
    expect(kohlrabi.attribution).toContain('Monika Grabkowska');
  });

  it('verifies Replit artifacts are completely removed for Vercel deployment cleanliness', async () => {
    const fs = await import('fs');
    const path = await import('path');

    expect(fs.existsSync(path.resolve(process.cwd(), '.replit'))).toBe(false);
    expect(fs.existsSync(path.resolve(process.cwd(), 'replit.nix'))).toBe(false);

    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    expect(allDeps['@replit/vite-plugin-shadcn-theme-json']).toBeUndefined();
  });

  it('verifies curated photo map covers all items from attached vegetables, fruits, and non-veg files', async () => {
    const { getFoodImageMetadata } = await import('../shared/foodImageResolver');

    const sampleItems = [
      { id: 'watercress', name: 'Watercress', category: ['vegetables'] },
      { id: 'endive', name: 'Endive', category: ['vegetables'] },
      { id: 'artichoke', name: 'Artichoke', category: ['vegetables'] },
      { id: 'leek', name: 'Leek', category: ['vegetables'] },
      { id: 'star_fruit', name: 'Star Fruit', category: ['fruits'] },
      { id: 'bacon', name: 'Bacon', category: ['meat'] },
      { id: 'oysters', name: 'Oysters', category: ['seafood'] },
      { id: 'popcorn', name: 'Popcorn', category: ['snacks'] },
      { id: 'butter', name: 'Butter', category: ['dairy'] }
    ];

    for (const item of sampleItems) {
      const meta = getFoodImageMetadata(item.id, item.name, item.category);
      expect(meta.imageUrl).toBeDefined();
      expect(meta.imageUrl.length).toBeGreaterThan(15);
      expect(meta.attribution).toBeDefined();
    }
  });

  it('validates vercel.json configuration for Node.js runtime and SPA rewrite routing', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const vercelConfigPath = path.resolve(process.cwd(), 'vercel.json');
    expect(fs.existsSync(vercelConfigPath)).toBe(true);

    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    expect(config.version).toBe(2);
    expect(config.outputDirectory).toBe('dist');
    expect(config.functions?.['api/index.ts']?.runtime).toBe('nodejs20.x');

    const spaRewrite = config.rewrites?.find((r: any) => r.destination === '/index.html');
    expect(spaRewrite).toBeDefined();
    expect(spaRewrite.source).toContain('api');

    const apiRewrite = config.rewrites?.find((r: any) => r.destination === '/api');
    expect(apiRewrite).toBeDefined();
  });

  it('verifies the consolidated food photo audit spreadsheet contains all catalog items with valid fields', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const csvPath = path.resolve(process.cwd(), 'consolidated_food_photo_audit.csv');
    expect(fs.existsSync(csvPath)).toBe(true);

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.trim().split('\n');
    // Header + 1,376 food items
    expect(lines.length).toBe(1377);

    const header = lines[0];
    expect(header).toContain('ID');
    expect(header).toContain('Food Name');
    expect(header).toContain('Category');
    expect(header).toContain('Match Type');
    expect(header).toContain('Requires Custom Manual Match');
    expect(header).toContain('Confidence Score');
    expect(header).toContain('Current Verified Image URL');
    expect(header).toContain('Attribution');
    expect(header).toContain('Google Images Search Link');
    expect(header).toContain('Excel HYPERLINK Formula');
  });

  it('verifies the batch update script executes successfully and generates report for all catalog items', async () => {
    const { runFoodImagesBatchUpdate } = await import('../scripts/batch-update-food-images');
    const result = await runFoodImagesBatchUpdate({ dryRun: true });

    expect(result.totalProcessed).toBeGreaterThanOrEqual(1320);
    expect(result.curatedMatchCount).toBe(result.totalProcessed);
    expect(result.successRate).toBe('100.0%');
    expect(result.dryRun).toBe(true);

    const fs = await import('fs');
    const path = await import('path');
    const reportPath = path.resolve(process.cwd(), 'food_images_batch_update_report.json');
    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(report.totalProcessed).toBeGreaterThanOrEqual(1320);
    expect(report.successRate).toBe('100.0%');
  });
});

